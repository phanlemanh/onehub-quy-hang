-- 002_dang_nhap_theo_san.sql · Danh tính và thành viên sàn: người đăng nhập vào đúng sàn mình (ADR-0003, hàng 6).
-- Danh tính (tài khoản, phiên, mã) ở schema `identity` do chủ giữ — vai API không với tới. Thành viên sàn ở `public`
-- như mọi bảng của công ty, mang luật theo dòng và ca trong packages/db/tests/isolation.test.mjs.

-- Người của phiên: API đặt `set local app.user_id = '<id>'` cạnh app.company_id. Không đặt thì trả null.
create or replace function app.current_user_id() returns text
  language sql stable
  as $$ select nullif(current_setting('app.user_id', true), '') $$;
grant execute on function app.current_user_id() to quy_hang_app;

-- Bảng của better-auth 1.7.x (lõi + plugin emailOTP dùng `verification`), đúng tên cột thư viện đọc.
-- Một người không thuộc một công ty nên không có luật theo dòng theo công ty: thay vào đó vai API không có quyền gì
-- trên schema này; better-auth dùng kết nối chủ riêng, chỉ cho danh tính.
create schema identity;
revoke all on schema identity from public;

create table identity."user" (
  "id"            text primary key,
  "name"          text not null,
  "email"         text not null unique,
  "emailVerified" boolean not null,
  "image"         text,
  "createdAt"     timestamptz not null default now(),
  "updatedAt"     timestamptz not null default now()
);

create table identity.session (
  "id"        text primary key,
  "expiresAt" timestamptz not null,
  "token"     text not null unique,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null,
  "ipAddress" text,
  "userAgent" text,
  "userId"    text not null references identity."user" ("id") on delete cascade
);
create index "session_userId_idx" on identity.session ("userId");

create table identity.account (
  "id"                    text primary key,
  "accountId"             text not null,
  "providerId"            text not null,
  "userId"                text not null references identity."user" ("id") on delete cascade,
  "accessToken"           text,
  "refreshToken"          text,
  "idToken"               text,
  "accessTokenExpiresAt"  timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  "scope"                 text,
  "password"              text,
  "createdAt"             timestamptz not null default now(),
  "updatedAt"             timestamptz not null
);
create index "account_userId_idx" on identity.account ("userId");

create table identity.verification (
  "id"         text primary key,
  "identifier" text not null,
  "value"      text not null,
  "expiresAt"  timestamptz not null,
  "createdAt"  timestamptz not null default now(),
  "updatedAt"  timestamptz not null default now()
);
create index "verification_identifier_idx" on identity.verification ("identifier");

-- Mỗi lần xin mã một dòng, để giới hạn số lần xin theo email đúng cả khi chạy nhiều máy chủ.
create table identity.otp_requests (
  email text not null,
  at    timestamptz not null default now()
);
create index otp_requests_email_at_idx on identity.otp_requests (email, at);

-- Thành viên sàn: ai thuộc sàn nào. Vai, khu phụ trách và lời mời là việc của hàng 7.
create table company_members (
  company_id uuid not null references companies (id) on delete cascade,
  user_id    text not null references identity."user" ("id") on delete cascade,
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);
create index company_members_user_idx on company_members (user_id);

alter table company_members enable row level security;
alter table company_members force row level security;
-- Thấy dòng của chính mình (để chọn sàn) và dòng của sàn đang làm. Thêm, bớt thành viên chưa mở cho API.
create policy company_members_read on company_members for select
  using (user_id = app.current_user_id() or company_id = app.current_company_id());
grant select on company_members to quy_hang_app;

-- Người thấy tên các sàn mình là thành viên, cạnh luật companies_self của 001.
create policy companies_member on companies for select
  using (exists (select 1 from company_members m where m.company_id = companies.id and m.user_id = app.current_user_id()));
