-- ============================================================
-- CATEGORIES
-- ============================================================
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  color text not null default '#6366f1',
  created_at timestamptz not null default now()
);

alter table categories enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'categories' and policyname = 'Users can manage their own categories'
  ) then
    create policy "Users can manage their own categories"
      on categories for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

-- ============================================================
-- TRANSACTIONS
-- ============================================================
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  amount numeric(12, 2) not null check (amount > 0),
  description text,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table transactions enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'transactions' and policyname = 'Users can manage their own transactions'
  ) then
    create policy "Users can manage their own transactions"
      on transactions for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

create index if not exists transactions_user_id_date_idx on transactions (user_id, date desc);
create index if not exists transactions_category_id_idx on transactions (category_id);

-- ============================================================
-- BUDGETS
-- ============================================================
create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  month text not null check (month ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  created_at timestamptz not null default now(),
  unique (user_id, category_id, month)
);

alter table budgets enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'budgets' and policyname = 'Users can manage their own budgets'
  ) then
    create policy "Users can manage their own budgets"
      on budgets for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

create index if not exists budgets_user_id_month_idx on budgets (user_id, month);
