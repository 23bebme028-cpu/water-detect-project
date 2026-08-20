-- OPTIONAL PRODUCTION BACKEND STARTER
-- Do NOT put a Supabase service-role key in the frontend.
-- Apply this schema in a protected Supabase project only after reviewing
-- your team's data/privacy requirements.

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  description text not null,
  location_text text,
  priority text not null default 'Normal'
    check (priority in ('Normal','High','Urgent')),
  status text not null default 'New'
    check (status in ('New','Assigned','In Progress','Resolved','Closed')),
  evidence_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.service_requests enable row level security;

create policy "users can view their own requests"
on public.service_requests for select
using (auth.uid() = user_id);

create policy "users can create their own requests"
on public.service_requests for insert
with check (auth.uid() = user_id);

create policy "users can update their own requests"
on public.service_requests for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Officer/admin access should be implemented with a separate role model
-- and server-side authorization. Do not expose unrestricted service-role
-- credentials in index.html or app.js.
