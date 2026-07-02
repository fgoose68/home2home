import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json().catch(() => ({}));
    const isTest: boolean = body.test === true;

    // Read settings
    const { data: settings, error: settingsErr } = await supabase
      .from("settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (settingsErr) throw new Error(settingsErr.message);
    if (!settings?.pushover_user_key || !settings?.pushover_api_token) {
      return new Response(
        JSON.stringify({ error: "Credenziali Pushover non configurate." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (isTest) {
      const resp = await fetch("https://api.pushover.net/1/messages.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: settings.pushover_api_token,
          user: settings.pushover_user_key,
          title: "H2H - Test notifica",
          message: "Notifiche Pushover configurate correttamente per H2H Home2Home.",
        }),
      });

      const result = await resp.json();
      if (result.status !== 1) {
        return new Response(
          JSON.stringify({ error: "Pushover ha rifiutato la richiesta: " + (result.errors?.join(", ") ?? "errore sconosciuto") }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: "Notifica di test inviata correttamente." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Scheduled-style: send notifications for today's due expenses
    const today = new Date().toISOString().slice(0, 10);
    const { data: expenses, error: expErr } = await supabase
      .from("expenses")
      .select("amount, period_label, apartments(name), expense_categories(name)")
      .eq("due_date", today)
      .eq("status", "pending");

    if (expErr) throw new Error(expErr.message);
    if (!expenses || expenses.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sent = 0;
    for (const exp of expenses) {
      const apt = (exp.apartments as any)?.name ?? "";
      const cat = (exp.expense_categories as any)?.name ?? "";
      const amount = Number(exp.amount).toFixed(2);
      let message = `${apt} · ${cat} · €${amount}`;
      if (exp.period_label) message += ` (${exp.period_label})`;

      const resp = await fetch("https://api.pushover.net/1/messages.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: settings.pushover_api_token,
          user: settings.pushover_user_key,
          title: "H2H - Scadenza oggi",
          message,
        }),
      });
      const result = await resp.json();
      if (result.status === 1) sent++;
    }

    return new Response(
      JSON.stringify({ success: true, sent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message ?? "Errore interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
