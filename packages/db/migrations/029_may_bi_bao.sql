-- Dấu «máy bị báo mất» (hàng 38, luật 32, Kiến trúc §8): «Báo mất máy» thu mọi phiên khác của người và ghi một dấu cho
-- từng phiên bị thu, để máy ấy lần đầu chạm máy chủ nhận mã riêng mà xoá kho trên máy — tách khỏi hết phiên thường, vốn
-- giữ thay đổi chờ (dong-bo-tu-lanh AC-2). Bảng của danh tính, không thuộc công ty nào: nằm ở schema `identity` do chủ
-- giữ, vai API của công ty không đọc không ghi. Mã phiên không lưu thô — chỉ băm sha256 hex. Hạn của dấu do API ghi
-- bằng lúc thu cộng hạn phiên (packages/api/src/auth/constants.ts), nên không phiên bị thu nào sống lâu hơn dấu của nó.

create table identity.reported_device (
  token_hash  text primary key check (token_hash ~ '^[0-9a-f]{64}$'),
  user_id     text not null references identity."user" ("id") on delete cascade,
  reported_at timestamptz not null default now(),
  expires_at  timestamptz not null,
  check (expires_at > reported_at)
);
create index reported_device_user_id_idx on identity.reported_device (user_id);

revoke all on identity.reported_device from public;
revoke all on identity.reported_device from quy_hang_app;
