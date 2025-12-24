-- ==========================================
-- Accounting & Finance Module
-- Complete double-entry accounting system
-- ==========================================

-- ==========================================
-- 1. Financial Periods
-- ==========================================

create table if not exists financial_periods (
  id uuid primary key default uuid_generate_v4(),
  period_name text not null,
  start_date date not null,
  end_date date not null,
  status text default 'Open' check (status in ('Open', 'Closed')),
  created_at timestamptz default now(),
  unique(period_name)
);

-- ==========================================
-- 2. Chart of Accounts
-- ==========================================

create table if not exists chart_of_accounts (
  id uuid primary key default uuid_generate_v4(),
  account_code text not null unique,
  account_name text not null,
  account_type text not null check (account_type in ('Asset', 'Liability', 'Income', 'Expense', 'Equity')),
  parent_account_id uuid references chart_of_accounts(id),
  is_gst_applicable boolean default false,
  gst_rate numeric(5, 2) default 0, -- GST rate percentage
  opening_balance numeric(15, 2) default 0,
  current_balance numeric(15, 2) default 0,
  is_active boolean default true,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==========================================
-- 3. General Ledger
-- ==========================================

create table if not exists general_ledger (
  id uuid primary key default uuid_generate_v4(),
  transaction_date date not null,
  account_id uuid references chart_of_accounts(id) not null,
  reference_type text, -- 'Donation', 'Puja', 'Bill', 'Invoice', 'Expense', 'Journal', 'Payment', etc.
  reference_id uuid, -- ID of the source transaction
  description text not null,
  debit_amount numeric(15, 2) default 0,
  credit_amount numeric(15, 2) default 0,
  balance numeric(15, 2) default 0, -- Running balance for the account
  gst_applicable boolean default false,
  gst_rate numeric(5, 2) default 0,
  gst_amount numeric(15, 2) default 0,
  period_id uuid references financial_periods(id),
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

create index idx_gl_account_date on general_ledger(account_id, transaction_date);
create index idx_gl_reference on general_ledger(reference_type, reference_id);
create index idx_gl_period on general_ledger(period_id);

-- ==========================================
-- 4. Journal Entries
-- ==========================================

create table if not exists journal_entries (
  id uuid primary key default uuid_generate_v4(),
  entry_number text unique, -- JRNL-YYYY-####
  entry_date date not null,
  description text,
  period_id uuid references financial_periods(id),
  status text default 'Draft' check (status in ('Draft', 'Posted', 'Cancelled')),
  created_at timestamptz default now(),
  created_by uuid references auth.users(id),
  posted_at timestamptz,
  posted_by uuid references auth.users(id)
);

create table if not exists journal_entry_lines (
  id uuid primary key default uuid_generate_v4(),
  journal_entry_id uuid references journal_entries(id) on delete cascade not null,
  account_id uuid references chart_of_accounts(id) not null,
  description text,
  debit_amount numeric(15, 2) default 0,
  credit_amount numeric(15, 2) default 0,
  line_number integer not null
);

-- ==========================================
-- 5. Bank Accounts
-- ==========================================

create table if not exists bank_accounts (
  id uuid primary key default uuid_generate_v4(),
  account_name text not null,
  account_number text,
  bank_name text not null,
  ifsc_code text,
  branch text,
  account_type text default 'Savings' check (account_type in ('Savings', 'Current', 'Fixed Deposit')),
  opening_balance numeric(15, 2) default 0,
  current_balance numeric(15, 2) default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists bank_transactions (
  id uuid primary key default uuid_generate_v4(),
  bank_account_id uuid references bank_accounts(id) not null,
  transaction_date date not null,
  transaction_type text not null check (transaction_type in ('Debit', 'Credit')),
  amount numeric(15, 2) not null,
  description text,
  reference_number text,
  cheque_number text,
  is_reconciled boolean default false,
  reconciled_at timestamptz,
  reconciled_by uuid references auth.users(id),
  ledger_entry_id uuid references general_ledger(id),
  created_at timestamptz default now()
);

create index idx_bank_trans_reconciled on bank_transactions(bank_account_id, is_reconciled);

-- ==========================================
-- 6. Vendors (Accounts Payable)
-- ==========================================

create table if not exists vendors (
  id uuid primary key default uuid_generate_v4(),
  vendor_code text unique,
  name text not null,
  gstin text,
  contact_person text,
  email text,
  phone text,
  address_line_1 text,
  address_line_2 text,
  city text,
  state text,
  pincode text,
  country text default 'India',
  payment_terms text, -- e.g., "Net 30"
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists bills (
  id uuid primary key default uuid_generate_v4(),
  bill_number text unique, -- BILL-YYYY-####
  vendor_id uuid references vendors(id) not null,
  bill_date date not null,
  due_date date,
  subtotal numeric(15, 2) not null,
  gst_rate numeric(5, 2) default 0,
  gst_amount numeric(15, 2) default 0,
  total_amount numeric(15, 2) not null,
  description text,
  payment_status text default 'Unpaid' check (payment_status in ('Unpaid', 'Partial', 'Paid')),
  paid_amount numeric(15, 2) default 0,
  period_id uuid references financial_periods(id),
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

create table if not exists bill_payments (
  id uuid primary key default uuid_generate_v4(),
  bill_id uuid references bills(id) not null,
  payment_date date not null,
  amount numeric(15, 2) not null,
  payment_mode text not null check (payment_mode in ('Cash', 'Cheque', 'Online Transfer', 'UPI', 'Card', 'DD')),
  bank_account_id uuid references bank_accounts(id),
  reference_number text,
  description text,
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

create index idx_bills_vendor on bills(vendor_id);
create index idx_bills_status on bills(payment_status);

-- ==========================================
-- 7. Invoices (Accounts Receivable)
-- ==========================================

create table if not exists invoices (
  id uuid primary key default uuid_generate_v4(),
  invoice_number text unique, -- INV-YYYY-####
  devotee_id uuid references devotees(id),
  invoice_date date not null,
  due_date date,
  subtotal numeric(15, 2) not null,
  gst_rate numeric(5, 2) default 0,
  gst_amount numeric(15, 2) default 0,
  total_amount numeric(15, 2) not null,
  description text,
  payment_status text default 'Unpaid' check (payment_status in ('Unpaid', 'Partial', 'Paid')),
  paid_amount numeric(15, 2) default 0,
  period_id uuid references financial_periods(id),
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

create table if not exists invoice_payments (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references invoices(id) not null,
  payment_date date not null,
  amount numeric(15, 2) not null,
  payment_mode text not null check (payment_mode in ('Cash', 'Cheque', 'Online Transfer', 'UPI', 'Card', 'DD')),
  bank_account_id uuid references bank_accounts(id),
  reference_number text,
  description text,
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

create index idx_invoices_devotee on invoices(devotee_id);
create index idx_invoices_status on invoices(payment_status);

-- ==========================================
-- 8. Expenses
-- ==========================================

create table if not exists expenses (
  id uuid primary key default uuid_generate_v4(),
  expense_number text unique, -- EXP-YYYY-####
  expense_date date not null,
  expense_category_id uuid references chart_of_accounts(id) not null,
  vendor_id uuid references vendors(id),
  amount numeric(15, 2) not null,
  gst_rate numeric(5, 2) default 0,
  gst_amount numeric(15, 2) default 0,
  total_amount numeric(15, 2) not null,
  description text,
  payment_status text default 'Unpaid' check (payment_status in ('Unpaid', 'Paid')),
  payment_mode text check (payment_mode in ('Cash', 'Cheque', 'Online Transfer', 'UPI', 'Card', 'DD')),
  bank_account_id uuid references bank_accounts(id),
  reference_number text,
  period_id uuid references financial_periods(id),
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

create index idx_expenses_category on expenses(expense_category_id);
create index idx_expenses_date on expenses(expense_date);

-- ==========================================
-- 9. Budgets
-- ==========================================

create table if not exists budgets (
  id uuid primary key default uuid_generate_v4(),
  financial_year text not null, -- e.g., "2024-25"
  account_id uuid references chart_of_accounts(id) not null,
  budgeted_amount numeric(15, 2) not null,
  actual_amount numeric(15, 2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(financial_year, account_id)
);

-- ==========================================
-- 10. GST Returns
-- ==========================================

create table if not exists gst_returns (
  id uuid primary key default uuid_generate_v4(),
  return_period text not null, -- e.g., "2024-04" for April 2024
  return_type text not null check (return_type in ('GSTR-1', 'GSTR-3B', 'GSTR-9')),
  filing_date date,
  taxable_value numeric(15, 2) default 0,
  cgst_amount numeric(15, 2) default 0,
  sgst_amount numeric(15, 2) default 0,
  igst_amount numeric(15, 2) default 0,
  total_tax_amount numeric(15, 2) default 0,
  status text default 'Draft' check (status in ('Draft', 'Filed', 'Amended')),
  remarks text,
  created_at timestamptz default now(),
  created_by uuid references auth.users(id),
  unique(return_period, return_type)
);

-- ==========================================
-- 11. Functions for Auto-posting
-- ==========================================

-- Function to post donation to general ledger
create or replace function post_donation_to_ledger()
returns trigger as $$
declare
  donation_income_account uuid;
  cash_account uuid;
  bank_account uuid;
begin
  -- Find or create accounts (simplified - in production, these should be configured)
  select id into donation_income_account from chart_of_accounts 
    where account_code = '4000' or account_name ilike '%donation income%' limit 1;
  
  -- Determine cash or bank account based on payment mode
  if new.payment_mode = 'Cash' then
    select id into cash_account from chart_of_accounts 
      where account_code = '1000' or account_name ilike '%cash%' limit 1;
    
    if cash_account is not null and donation_income_account is not null then
      -- Credit Income, Debit Cash
      insert into general_ledger (transaction_date, account_id, reference_type, reference_id, description, credit_amount, balance)
      values (new.donation_date, donation_income_account, 'Donation', new.id, 
              'Donation from devotee', new.amount, 
              (select coalesce(current_balance, 0) from chart_of_accounts where id = donation_income_account) + new.amount);
      
      insert into general_ledger (transaction_date, account_id, reference_type, reference_id, description, debit_amount, balance)
      values (new.donation_date, cash_account, 'Donation', new.id, 
              'Donation received', new.amount,
              (select coalesce(current_balance, 0) from chart_of_accounts where id = cash_account) + new.amount);
      
      -- Update account balances
      update chart_of_accounts set current_balance = current_balance + new.amount where id = cash_account;
      update chart_of_accounts set current_balance = current_balance + new.amount where id = donation_income_account;
    end if;
  else
    -- For bank transfers, find appropriate bank account
    select id into bank_account from bank_accounts where is_active = true limit 1;
    if bank_account is not null then
      select id into bank_account from chart_of_accounts 
        where account_code like '1%' and account_name ilike '%bank%' limit 1;
    end if;
    
    if bank_account is not null and donation_income_account is not null then
      insert into general_ledger (transaction_date, account_id, reference_type, reference_id, description, credit_amount, balance)
      values (new.donation_date, donation_income_account, 'Donation', new.id, 
              'Donation from devotee', new.amount,
              (select coalesce(current_balance, 0) from chart_of_accounts where id = donation_income_account) + new.amount);
      
      insert into general_ledger (transaction_date, account_id, reference_type, reference_id, description, debit_amount, balance)
      values (new.donation_date, bank_account, 'Donation', new.id, 
              'Donation received', new.amount,
              (select coalesce(current_balance, 0) from chart_of_accounts where id = bank_account) + new.amount);
      
      update chart_of_accounts set current_balance = current_balance + new.amount where id = bank_account;
      update chart_of_accounts set current_balance = current_balance + new.amount where id = donation_income_account;
    end if;
  end if;
  
  return new;
end;
$$ language plpgsql;

-- Trigger for donations
create trigger trigger_post_donation_to_ledger
after insert on donations
for each row
when (new.payment_status = 'Completed')
execute function post_donation_to_ledger();

-- Function to post puja booking payment to general ledger
create or replace function post_puja_payment_to_ledger()
returns trigger as $$
declare
  puja_income_account uuid;
  cash_account uuid;
  bank_account uuid;
begin
  if new.payment_status = 'Paid' and new.amount_paid > 0 then
    select id into puja_income_account from chart_of_accounts 
      where account_code = '4100' or account_name ilike '%puja income%' limit 1;
    
    select id into cash_account from chart_of_accounts 
      where account_code = '1000' or account_name ilike '%cash%' limit 1;
    
    if puja_income_account is not null and cash_account is not null then
      insert into general_ledger (transaction_date, account_id, reference_type, reference_id, description, credit_amount, balance)
      values (new.booking_date, puja_income_account, 'Puja', new.id, 
              'Puja booking payment', new.amount_paid,
              (select coalesce(current_balance, 0) from chart_of_accounts where id = puja_income_account) + new.amount_paid);
      
      insert into general_ledger (transaction_date, account_id, reference_type, reference_id, description, debit_amount, balance)
      values (new.booking_date, cash_account, 'Puja', new.id, 
              'Puja booking payment received', new.amount_paid,
              (select coalesce(current_balance, 0) from chart_of_accounts where id = cash_account) + new.amount_paid);
      
      update chart_of_accounts set current_balance = current_balance + new.amount_paid where id = cash_account;
      update chart_of_accounts set current_balance = current_balance + new.amount_paid where id = puja_income_account;
    end if;
  end if;
  
  return new;
end;
$$ language plpgsql;

-- Trigger for puja bookings
create trigger trigger_post_puja_payment_to_ledger
after insert or update on puja_bookings
for each row
when (new.payment_status = 'Paid' and new.amount_paid > 0)
execute function post_puja_payment_to_ledger();

-- ==========================================
-- 12. Seed Data - Default Chart of Accounts
-- ==========================================

-- Assets
insert into chart_of_accounts (account_code, account_name, account_type, opening_balance, current_balance) values
('1000', 'Cash', 'Asset', 0, 0),
('1100', 'Bank Accounts', 'Asset', 0, 0),
('1200', 'Accounts Receivable', 'Asset', 0, 0),
('1300', 'Inventory', 'Asset', 0, 0),
('1400', 'Fixed Assets', 'Asset', 0, 0)
on conflict (account_code) do nothing;

-- Liabilities
insert into chart_of_accounts (account_code, account_name, account_type, opening_balance, current_balance) values
('2000', 'Accounts Payable', 'Liability', 0, 0),
('2100', 'GST Payable', 'Liability', 0, 0),
('2200', 'Loans Payable', 'Liability', 0, 0)
on conflict (account_code) do nothing;

-- Equity
insert into chart_of_accounts (account_code, account_name, account_type, opening_balance, current_balance) values
('3000', 'Capital', 'Equity', 0, 0),
('3100', 'Retained Earnings', 'Equity', 0, 0)
on conflict (account_code) do nothing;

-- Income
insert into chart_of_accounts (account_code, account_name, account_type, opening_balance, current_balance) values
('4000', 'Donation Income', 'Income', 0, 0),
('4100', 'Puja Income', 'Income', 0, 0),
('4200', 'Event Income', 'Income', 0, 0),
('4300', 'Other Income', 'Income', 0, 0)
on conflict (account_code) do nothing;

-- Expenses
insert into chart_of_accounts (account_code, account_name, account_type, opening_balance, current_balance) values
('5000', 'Staff Expenses', 'Expense', 0, 0),
('5100', 'Event Expenses', 'Expense', 0, 0),
('5200', 'Maintenance Expenses', 'Expense', 0, 0),
('5300', 'Inventory Expenses', 'Expense', 0, 0),
('5400', 'Administrative Expenses', 'Expense', 0, 0),
('5500', 'GST Expenses', 'Expense', 0, 0)
on conflict (account_code) do nothing;

-- Create default financial period (current year)
insert into financial_periods (period_name, start_date, end_date, status) values
('FY 2024-25', '2024-04-01', '2025-03-31', 'Open')
on conflict (period_name) do nothing;

-- ==========================================
-- 13. RLS Policies
-- ==========================================

alter table financial_periods enable row level security;
alter table chart_of_accounts enable row level security;
alter table general_ledger enable row level security;
alter table journal_entries enable row level security;
alter table journal_entry_lines enable row level security;
alter table bank_accounts enable row level security;
alter table bank_transactions enable row level security;
alter table vendors enable row level security;
alter table bills enable row level security;
alter table bill_payments enable row level security;
alter table invoices enable row level security;
alter table invoice_payments enable row level security;
alter table expenses enable row level security;
alter table budgets enable row level security;
alter table gst_returns enable row level security;

-- Policies for authenticated users
create policy "Enable all for authenticated users" on financial_periods for all using (auth.role() = 'authenticated');
create policy "Enable all for authenticated users" on chart_of_accounts for all using (auth.role() = 'authenticated');
create policy "Enable all for authenticated users" on general_ledger for all using (auth.role() = 'authenticated');
create policy "Enable all for authenticated users" on journal_entries for all using (auth.role() = 'authenticated');
create policy "Enable all for authenticated users" on journal_entry_lines for all using (auth.role() = 'authenticated');
create policy "Enable all for authenticated users" on bank_accounts for all using (auth.role() = 'authenticated');
create policy "Enable all for authenticated users" on bank_transactions for all using (auth.role() = 'authenticated');
create policy "Enable all for authenticated users" on vendors for all using (auth.role() = 'authenticated');
create policy "Enable all for authenticated users" on bills for all using (auth.role() = 'authenticated');
create policy "Enable all for authenticated users" on bill_payments for all using (auth.role() = 'authenticated');
create policy "Enable all for authenticated users" on invoices for all using (auth.role() = 'authenticated');
create policy "Enable all for authenticated users" on invoice_payments for all using (auth.role() = 'authenticated');
create policy "Enable all for authenticated users" on expenses for all using (auth.role() = 'authenticated');
create policy "Enable all for authenticated users" on budgets for all using (auth.role() = 'authenticated');
create policy "Enable all for authenticated users" on gst_returns for all using (auth.role() = 'authenticated');

