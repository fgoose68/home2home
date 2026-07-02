export interface Apartment {
  id: string;
  name: string;
  location: string;
  address: string | null;
  color_theme: string;
  icon: string | null;
  created_at: string;
}

export interface ExpenseCategory {
  id: string;
  apartment_id: string;
  name: string;
  billing_type: BillingType;
  color: string;
  icon: string | null;
  sort_order: number;
  notes: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  apartment_id: string;
  category_id: string;
  amount: number;
  description: string | null;
  expense_date: string;
  due_date: string | null;
  year: number;
  period_label: string | null;
  status: 'pending' | 'paid';
  created_at: string;
  updated_at: string;
  // joined
  category?: ExpenseCategory;
}

export type BillingType =
  | 'monthly'
  | 'bimonthly'
  | 'four_monthly'
  | 'quarterly'
  | 'quarterly_march'
  | 'tari_roma'
  | 'tari_nettuno'
  | 'biannual'
  | 'annual'
  | 'free';

export interface ApartmentDocument {
  id: string;
  apartment_id: string;
  name: string;
  description: string | null;
  storage_path: string;
  file_size: number;
  mime_type: string;
  doc_year: number;
  uploaded_at: string;
}

export interface Settings {
  id: number;
  pushover_user_key: string | null;
  pushover_api_token: string | null;
  notifications_enabled: boolean;
  updated_at: string;
}

export type ActivePage = 'dashboard' | 'roma' | 'nettuno' | 'statistics' | 'backup' | 'documenti' | 'impostazioni';
