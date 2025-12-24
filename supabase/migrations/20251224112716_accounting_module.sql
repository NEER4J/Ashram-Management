-- ==========================================
-- Accounting & Finance Module
-- ==========================================

-- ==========================================
-- 1. Financial Periods (Master)
-- ==========================================

create table if not exists financial_periods (
  id uuid primary key default uuid_generate_v4(),
  period_name text not null,
  start_date date not null,
  end_date date not null,
  status text default 'Open' check (status in ('Open', 'Closed')),
  created_at timestamptz default now(),
  closed_at timestamptz,
  closed_by uuid references auth.users(id)
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
  description text,
  is_gst_applicable boolean default false,
  gst_rate numeric(5, 2) default 0, -- GST rate percentage
  is_active boolean default true,
  opening_balance numeric(15, 2) default 0,
  current_balance numeric(15, 2) default 0,
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
  reference_type text, -- 'Donation', 'Puja', 'Bill', 'Invoice', 'Expense', 'Journal', etc.
  reference_id uuid, -- ID of the source transaction
  description text,
  debit_amount numeric(15, 2) default 0,
  credit_amount numeric(15, 2) default 0,
  balance numeric(15, 2), -- Running balance for the account
  gst_applicable boolean default false,
  gst_rate numeric(5, 2) default 0,
  gst_amount numeric(15, 2) default 0,
  taxable_amount numeric(15, 2) default 0,
  period_id uuid references financial_periods(id),
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

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
  total_debit numeric(15, 2) default 0,
  total_credit numeric(15, 2) default 0,
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
  line_order integer default 0
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
  branch_name text,
  account_type text default 'Savings' check (account_type in ('Savings', 'Current', 'Cash')),
  opening_balance numeric(15, 2) default 0,
  current_balance numeric(15, 2) default 0,
  account_id uuid references chart_of_accounts(id), -- Link to COA
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
  reference text,
  description text,
  cheque_number text,
  is_reconciled boolean default false,
  reconciled_at timestamptz,
  reconciled_by uuid references auth.users(id),
  ledger_entry_id uuid references general_ledger(id),
  created_at timestamptz default now()
);

-- ==========================================
-- 6. Vendors (Accounts Payable)
-- ==========================================

create table if not exists vendors (
  id uuid primary key default uuid_generate_v4(),
  vendor_name text not null,
  gstin text,
  contact_person text,
  email text,
  mobile_number text,
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
  payment_status text default 'Unpaid' check (payment_status in ('Unpaid', 'Partially Paid', 'Paid', 'Cancelled')),
  paid_amount numeric(15, 2) default 0,
  expense_account_id uuid references chart_of_accounts(id), -- Which expense account
  payable_account_id uuid references chart_of_accounts(id), -- Accounts Payable account
  description text,
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

create table if not exists bill_payments (
  id uuid primary key default uuid_generate_v4(),
  bill_id uuid references bills(id) not null,
  payment_date date not null,
  amount numeric(15, 2) not null,
  payment_mode text not null check (payment_mode in ('Cash', 'Online Transfer', 'UPI', 'Cheque', 'Card', 'DD')),
  bank_account_id uuid references bank_accounts(id),
  transaction_ref text,
  description text,
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

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
  payment_status text default 'Unpaid' check (payment_status in ('Unpaid', 'Partially Paid', 'Paid', 'Cancelled')),
  paid_amount numeric(15, 2) default 0,
  income_account_id uuid references chart_of_accounts(id), -- Which income account
  receivable_account_id uuid references chart_of_accounts(id), -- Accounts Receivable account
  description text,
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

create table if not exists invoice_payments (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references invoices(id) not null,
  payment_date date not null,
  amount numeric(15, 2) not null,
  payment_mode text not null check (payment_mode in ('Cash', 'Online Transfer', 'UPI', 'Cheque', 'Card', 'DD')),
  bank_account_id uuid references bank_accounts(id),
  transaction_ref text,
  description text,
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

-- ==========================================
-- 8. Expenses
-- ==========================================

create table if not exists expenses (
  id uuid primary key default uuid_generate_v4(),
  expense_number text unique, -- EXP-YYYY-####
  expense_date date not null,
  expense_category_id uuid references chart_of_accounts(id) not null, -- Expense account
  vendor_id uuid references vendors(id),
  amount numeric(15, 2) not null,
  gst_applicable boolean default false,
  gst_rate numeric(5, 2) default 0,
  gst_amount numeric(15, 2) default 0,
  taxable_amount numeric(15, 2) default 0,
  payment_status text default 'Unpaid' check (payment_status in ('Unpaid', 'Paid')),
  payment_mode text check (payment_mode in ('Cash', 'Online Transfer', 'UPI', 'Cheque', 'Card', 'DD')),
  bank_account_id uuid references bank_accounts(id),
  description text,
  reference_type text, -- 'Event', 'Inventory', 'General', etc.
  reference_id uuid, -- ID of related record
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

-- ==========================================
-- 9. Budgets
-- ==========================================

create table if not exists budgets (
  id uuid primary key default uuid_generate_v4(),
  financial_year text not null, -- e.g., "2024-25"
  account_id uuid references chart_of_accounts(id) not null,
  budgeted_amount numeric(15, 2) not null,
  period_id uuid references financial_periods(id),
  created_at timestamptz default now(),
  created_by uuid references auth.users(id),
  unique(financial_year, account_id, period_id)
);

-- ==========================================
-- 10. GST Returns
-- ==========================================

create table if not exists gst_returns (
  id uuid primary key default uuid_generate_v4(),
  return_type text not null check (return_type in ('GSTR-1', 'GSTR-3B', 'GSTR-9')),
  period_month integer not null check (period_month between 1 and 12),
  period_year integer not null,
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
  filed_at timestamptz,
  filed_by uuid references auth.users(id)
);

-- ==========================================
-- 11. Indexes for Performance
-- ==========================================

create index if not exists idx_general_ledger_account on general_ledger(account_id);
create index if not exists idx_general_ledger_date on general_ledger(transaction_date);
create index if not exists idx_general_ledger_reference on general_ledger(reference_type, reference_id);
create index if not exists idx_journal_entry_lines_entry on journal_entry_lines(journal_entry_id);
create index if not exists idx_journal_entry_lines_account on journal_entry_lines(account_id);
create index if not exists idx_bank_transactions_account on bank_transactions(bank_account_id);
create index if not exists idx_bank_transactions_date on bank_transactions(transaction_date);
create index if not exists idx_bills_vendor on bills(vendor_id);
create index if not exists idx_bills_status on bills(payment_status);
create index if not exists idx_invoices_devotee on invoices(devotee_id);
create index if not exists idx_invoices_status on invoices(payment_status);
create index if not exists idx_expenses_category on expenses(expense_category_id);
create index if not exists idx_expenses_date on expenses(expense_date);
create index if not exists idx_chart_of_accounts_type on chart_of_accounts(account_type);
create index if not exists idx_chart_of_accounts_parent on chart_of_accounts(parent_account_id);

-- ==========================================
-- 12. Functions for Auto-posting
-- ==========================================

-- Function to post donation to general ledger
create or replace function post_donation_to_ledger()
returns trigger as $$
declare
  income_account_id uuid;
  bank_account_id uuid;
  cash_account_id uuid;
begin
  -- Find or create Donation Income account
  select id into income_account_id
  from chart_of_accounts
  where account_code = '4000' and account_type = 'Income'
  limit 1;

  if income_account_id is null then
    -- Create default Donation Income account if it doesn't exist
    insert into chart_of_accounts (account_code, account_name, account_type, is_active)
    values ('4000', 'Donation Income', 'Income', true)
    returning id into income_account_id;
  end if;

  -- Determine which account to debit (Cash or Bank)
  if new.payment_mode in ('Online Transfer', 'UPI', 'Card', 'DD', 'Cheque') then
    -- Find default bank account
    select id into bank_account_id
    from bank_accounts
    where is_active = true
    limit 1;
    
    if bank_account_id is null then
      -- Use cash account if no bank account
      select id into cash_account_id
      from chart_of_accounts
      where account_code = '1000' and account_type = 'Asset'
      limit 1;
      
      if cash_account_id is null then
        insert into chart_of_accounts (account_code, account_name, account_type, is_active)
        values ('1000', 'Cash', 'Asset', true)
        returning id into cash_account_id;
      end if;
      
      -- Debit Cash
      insert into general_ledger (transaction_date, account_id, reference_type, reference_id, description, debit_amount, created_by)
      values (new.donation_date, cash_account_id, 'Donation', new.id, 
              'Donation from ' || coalesce((select first_name || ' ' || coalesce(last_name, '') from devotees where id = new.devotee_id), 'Anonymous'),
              new.amount, new.created_by);
    else
      -- Debit Bank
      insert into general_ledger (transaction_date, account_id, reference_type, reference_id, description, debit_amount, created_by)
      values (new.donation_date, (select account_id from bank_accounts where id = bank_account_id), 'Donation', new.id,
              'Donation from ' || coalesce((select first_name || ' ' || coalesce(last_name, '') from devotees where id = new.devotee_id), 'Anonymous'),
              new.amount, new.created_by);
    end if;
  else
    -- Cash payment
    select id into cash_account_id
    from chart_of_accounts
    where account_code = '1000' and account_type = 'Asset'
    limit 1;
    
    if cash_account_id is null then
      insert into chart_of_accounts (account_code, account_name, account_type, is_active)
      values ('1000', 'Cash', 'Asset', true)
      returning id into cash_account_id;
    end if;
    
    -- Debit Cash
    insert into general_ledger (transaction_date, account_id, reference_type, reference_id, description, debit_amount, created_by)
    values (new.donation_date, cash_account_id, 'Donation', new.id,
            'Donation from ' || coalesce((select first_name || ' ' || coalesce(last_name, '') from devotees where id = new.devotee_id), 'Anonymous'),
            new.amount, new.created_by);
  end if;

  -- Credit Income
  insert into general_ledger (transaction_date, account_id, reference_type, reference_id, description, credit_amount, created_by)
  values (new.donation_date, income_account_id, 'Donation', new.id,
          'Donation from ' || coalesce((select first_name || ' ' || coalesce(last_name, '') from devotees where id = new.devotee_id), 'Anonymous'),
          new.amount, new.created_by);

  return new;
end;
$$ language plpgsql;

-- Trigger for donations
drop trigger if exists trigger_post_donation_to_ledger on donations;
create trigger trigger_post_donation_to_ledger
  after insert on donations
  for each row
  when (new.payment_status = 'Completed')
  execute function post_donation_to_ledger();

-- Function to post puja booking payment to ledger
create or replace function post_puja_payment_to_ledger()
returns trigger as $$
declare
  income_account_id uuid;
  bank_account_id uuid;
  cash_account_id uuid;
begin
  -- Only process when payment is made
  if new.amount_paid <= 0 or new.payment_status != 'Paid' then
    return new;
  end if;

  -- Find or create Puja Income account
  select id into income_account_id
  from chart_of_accounts
  where account_code = '4100' and account_type = 'Income'
  limit 1;

  if income_account_id is null then
    insert into chart_of_accounts (account_code, account_name, account_type, is_active)
    values ('4100', 'Puja Income', 'Income', true)
    returning id into income_account_id;
  end if;

  -- Determine debit account (simplified - assume cash for now)
  select id into cash_account_id
  from chart_of_accounts
  where account_code = '1000' and account_type = 'Asset'
  limit 1;
  
  if cash_account_id is null then
    insert into chart_of_accounts (account_code, account_name, account_type, is_active)
    values ('1000', 'Cash', 'Asset', true)
    returning id into cash_account_id;
  end if;

  -- Debit Cash
  insert into general_ledger (transaction_date, account_id, reference_type, reference_id, description, debit_amount, created_by)
  values (new.booking_date, cash_account_id, 'Puja', new.id,
          'Puja booking payment', new.amount_paid, auth.uid());

  -- Credit Income
  insert into general_ledger (transaction_date, account_id, reference_type, reference_id, description, credit_amount, created_by)
  values (new.booking_date, income_account_id, 'Puja', new.id,
          'Puja booking payment', new.amount_paid, auth.uid());

  return new;
end;
$$ language plpgsql;

-- Trigger for puja bookings (only when payment_status changes to Paid)
drop trigger if exists trigger_post_puja_payment_to_ledger on puja_bookings;
create trigger trigger_post_puja_payment_to_ledger
  after insert or update on puja_bookings
  for each row
  when (new.payment_status = 'Paid' and (old is null or old.payment_status != 'Paid'))
  execute function post_puja_payment_to_ledger();

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

-- ==========================================
-- 14. Seed Data - Default Chart of Accounts
-- ==========================================

-- Assets
insert into chart_of_accounts (account_code, account_name, account_type, is_active) values
('1000', 'Current Assets', 'Asset', true),
('1001', 'Cash', 'Asset', true),
('1002', 'Bank Accounts', 'Asset', true),
('1003', 'Accounts Receivable', 'Asset', true),
('1004', 'Inventory', 'Asset', true),
('1005', 'Prepaid Expenses', 'Asset', true)
on conflict (account_code) do nothing;

-- Liabilities
insert into chart_of_accounts (account_code, account_name, account_type, is_active) values
('2000', 'Current Liabilities', 'Liability', true),
('2001', 'Accounts Payable', 'Liability', true),
('2002', 'GST Payable', 'Liability', true),
('2003', 'Accrued Expenses', 'Liability', true)
on conflict (account_code) do nothing;

-- Income
insert into chart_of_accounts (account_code, account_name, account_type, is_active) values
('4000', 'Donation Income', 'Income', true),
('4100', 'Puja Income', 'Income', true),
('4200', 'Event Income', 'Income', true),
('4300', 'Other Income', 'Income', true)
on conflict (account_code) do nothing;

-- Expenses
insert into chart_of_accounts (account_code, account_name, account_type, is_active) values
('5000', 'Operating Expenses', 'Expense', true),
('5100', 'Staff Expenses', 'Expense', true),
('5200', 'Event Expenses', 'Expense', true),
('5300', 'Maintenance Expenses', 'Expense', true),
('5400', 'Inventory Purchases', 'Expense', true),
('5500', 'Utilities', 'Expense', true),
('5600', 'GST Input Tax', 'Expense', true)
on conflict (account_code) do nothing;

-- Equity
insert into chart_of_accounts (account_code, account_name, account_type, is_active) values
('3000', 'Equity', 'Equity', true),
('3001', 'Retained Earnings', 'Equity', true)
on conflict (account_code) do nothing;

-- Create default financial period for current year
insert into financial_periods (period_name, start_date, end_date, status)
values (
  'FY ' || extract(year from current_date)::text || '-' || substr(extract(year from current_date)::text, 3, 2),
  date_trunc('year', current_date),
  (date_trunc('year', current_date) + interval '1 year' - interval '1 day')::date,
  'Open'
)
on conflict do nothing;

