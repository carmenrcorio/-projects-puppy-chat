-- Puppy Chat – Supabase Database Schema
-- Run this in the Supabase SQL Editor to bootstrap the database.

-- ============================================================
-- 1. BREEDS
-- ============================================================
create table public.breeds (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 2. USERS  (mirrors auth.users; populated via trigger)
-- ============================================================
create table public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text not null unique,
  display_name text,
  avatar_url   text,
  bio          text,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- 3. PUPPIES
-- ============================================================
create table public.puppies (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references public.users(id) on delete cascade,
  name       text not null,
  breed_id   uuid references public.breeds(id) on delete set null,
  photo_url  text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 4. POSTS
-- ============================================================
create table public.posts (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid not null references public.users(id) on delete cascade,
  puppy_id   uuid not null references public.puppies(id) on delete cascade,
  photo_url  text not null,
  caption    text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 5. COMMENTS
-- ============================================================
create table public.comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  author_id  uuid not null references public.users(id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 6. FOLLOWS  (composite PK prevents duplicate follows)
-- ============================================================
create table public.follows (
  follower_id  uuid not null references public.users(id) on delete cascade,
  following_id uuid not null references public.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id != following_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_puppies_owner    on public.puppies(owner_id);
create index idx_posts_author     on public.posts(author_id);
create index idx_posts_puppy      on public.posts(puppy_id);
create index idx_posts_created    on public.posts(created_at desc);
create index idx_comments_post    on public.comments(post_id);
create index idx_follows_follower on public.follows(follower_id);
create index idx_follows_following on public.follows(following_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Breeds: anyone can read
alter table public.breeds enable row level security;
create policy "Breeds are publicly readable"
  on public.breeds for select using (true);

-- Users: anyone can read, owner can update own row
alter table public.users enable row level security;
create policy "Users are publicly readable"
  on public.users for select using (true);
create policy "Users can insert their own row"
  on public.users for insert with check (auth.uid() = id);
create policy "Users can update their own row"
  on public.users for update using (auth.uid() = id);

-- Puppies
alter table public.puppies enable row level security;
create policy "Puppies are publicly readable"
  on public.puppies for select using (true);
create policy "Owners can insert puppies"
  on public.puppies for insert with check (auth.uid() = owner_id);
create policy "Owners can update their puppies"
  on public.puppies for update using (auth.uid() = owner_id);
create policy "Owners can delete their puppies"
  on public.puppies for delete using (auth.uid() = owner_id);

-- Posts
alter table public.posts enable row level security;
create policy "Posts are publicly readable"
  on public.posts for select using (true);
create policy "Authors can insert posts"
  on public.posts for insert with check (auth.uid() = author_id);
create policy "Authors can update their posts"
  on public.posts for update using (auth.uid() = author_id);
create policy "Authors can delete their posts"
  on public.posts for delete using (auth.uid() = author_id);

-- Comments
alter table public.comments enable row level security;
create policy "Comments are publicly readable"
  on public.comments for select using (true);
create policy "Authenticated users can comment"
  on public.comments for insert with check (auth.uid() = author_id);
create policy "Authors can update their comments"
  on public.comments for update using (auth.uid() = author_id);
create policy "Authors can delete their comments"
  on public.comments for delete using (auth.uid() = author_id);

-- Follows
alter table public.follows enable row level security;
create policy "Follows are publicly readable"
  on public.follows for select using (true);
create policy "Users can follow"
  on public.follows for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow"
  on public.follows for delete using (auth.uid() = follower_id);

-- ============================================================
-- TRIGGER: auto-create public.users row on sign-up
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- SEED: common dog breeds
-- ============================================================
insert into public.breeds (name) values
  ('Labrador Retriever'),
  ('Golden Retriever'),
  ('German Shepherd'),
  ('French Bulldog'),
  ('Bulldog'),
  ('Poodle'),
  ('Beagle'),
  ('Rottweiler'),
  ('Dachshund'),
  ('Corgi'),
  ('Siberian Husky'),
  ('Australian Shepherd'),
  ('Shih Tzu'),
  ('Pomeranian'),
  ('Border Collie')
on conflict (name) do nothing;
