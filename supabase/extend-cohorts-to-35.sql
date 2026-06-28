-- Run this once in Supabase SQL Editor to allow 1기 through 35기.
alter table public.members
  drop constraint if exists members_cohort_check;

alter table public.members
  add constraint members_cohort_check
  check (cohort between 1 and 35);
