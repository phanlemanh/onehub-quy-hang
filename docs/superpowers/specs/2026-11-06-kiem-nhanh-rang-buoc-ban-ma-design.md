# Kiểm nhanh thêm vế ràng buộc bản mã (bất biến 2)

Ngày 06/11/2026 · hàng `kiem-nhanh-rang-buoc-ban-ma` (T3) · dãy Q · Nối: Ngoài-2 của hàng `va-deploy-csdl-tam` (PR #176),
ADR-0013, migration 008, 009, 013.

## Vì sao

Trước PR #176, job `deploy` chạy bộ cách ly trên bản thật, trong đó có ca chỉ đọc của
`packages/db/tests/bat-rang-buoc.test.mjs`: bảng `listing_owners` và `leads` không còn số điện thoại để rõ
(`owner_phone is not null` = 0) thì ràng buộc `*_phone_chi_ban_ma` phải đã bật (`convalidated`); còn số rõ mà ràng buộc
đã bật là trạng thái không thể có. Tham chiếu §12 ngày 01/11 chốt: deploy dừng khi bảng sạch mà ràng buộc chưa bật.
PR #176 bỏ bộ cách ly khỏi bản thật, nên lưới này mất. Postgres tạm không có dữ liệu chủ nhà, không thay được.

## Thiết kế

1. `kiem-nhanh.mjs`: `soi` đọc thêm, cho từng cặp (bảng, ràng buộc) của danh sách cố định
   `[listing_owners, listing_owners_phone_chi_ban_ma]`, `[leads, leads_phone_chi_ban_ma]`: số dòng còn số rõ
   (`count(*) … where owner_phone is not null` — chỉ đếm, không đọc giá trị) và `convalidated` của ràng buộc (vắng ràng
   buộc → `null`). Cùng kết nối, cùng giao dịch read only.
2. `xet` thêm vế lỗi: «bảng sạch mà ràng buộc chưa bật», «ràng buộc bật mà còn số rõ», «thiếu ràng buộc». Bảng còn số
   rõ mà ràng buộc chưa bật là trạng thái hợp lệ (chờ mã hoá lại) — không lỗi, chỉ báo.
3. Dòng xanh của CLI nêu trạng thái từng bảng: `ràng buộc bản mã: listing_owners bật · leads bật` hoặc
   `leads còn N số rõ (chưa bật — chờ mã hoá lại)`. Dòng đỏ gọi đúng tên bảng và ràng buộc.
4. `ci.yml` không đổi: bước kiểm nhanh đã đứng trước bước gọi Vercel (thước của PR #176 giữ).

Danh sách hai cặp là danh sách cố định của lõi bất biến 2 (cùng danh sách ở migration 013 và bài bat-rang-buoc), không
phải dữ liệu của sàn — điều khoá bất biến, không cần Hỏi.

## Phạm vi

Không làm: đọc giá trị số; mã hoá lại; đổi migration; sửa bài bat-rang-buoc hay chú thích của nó (ngoài vùng).

## Thay eval của hồ sơ đã ký (ghi 07/11, hàng va-thuoc-ci-ho-so-moi-truong-that)

| Eval cũ | Tiêu chí của hồ sơ này đo lại |
|---|---|
| bat-rang-buoc-ban-ma/E4 | AC-1 — bảng sạch mà ràng buộc bản mã chưa bật thì deploy đỏ trước khi gọi Vercel |
