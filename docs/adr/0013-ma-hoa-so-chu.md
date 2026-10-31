# ADR-0013: Mã hoá số chủ nhà ở mức trường

Ngày: 2026-10-31 · Trạng thái: **accepted** (Manh Phan duyệt Cổng Phạm vi hồ sơ `ma-hoa-so-chu` 31/10, Hỏi-1..3 theo
khuyến nghị; duyệt kế hoạch 31/10) · Liên quan: Kiến trúc §8; bất biến 2; ADR-0009 §9–10; ADR-0010; ADR-0011; hàng 62
và hàng 24 của lộ trình

## Bối cảnh

ADR-0010 dựng cửa «Mở số» duy nhất nhưng để số chủ nằm rõ trong `listing_owners.owner_phone`; chủ kho đặt điều kiện mã
hoá «phải xong trước dữ liệu thật». Kiến trúc §8: số được mã hoá ở mức trường, chỉ giải qua cửa mở số. ADR-0009 §9: mọi
bí mật chỉ ở Vercel và secret GitHub, không ở kho.

## Quyết định

1. **Mã hoá ở tầng API, khoá không vào cơ sở dữ liệu.** AES-256-GCM (`node:crypto`), khoá `OWNER_PHONE_KEY` = base64 của
   đúng 32 byte. Bản mã `bytea`: `0x01 (phiên bản khoá) ‖ nonce 12 ‖ thẻ 16 ‖ thân`. Ngữ cảnh (dữ liệu xác thực kèm)
   `listing_owners:<company_id>:<listing_id>` — chép bản mã sang hàng hay sàn khác thì không giải được. Mã ở
   `packages/api/src/owners/ma-hoa.ts`. Cơ sở dữ liệu và bản sao lưu chỉ giữ bản mã. Loại pgcrypto: khoá sẽ phải vào phiên
   cơ sở dữ liệu.
2. **So trùng bằng dấu vết (Hỏi-2).** `owner_phone_hash` = HMAC-SHA256 của `<company_id>:<số>`, khoá con suy từ
   `OWNER_PHONE_KEY` bằng HKDF (nhãn `quy-hang/owner-phone-hash/v1`). Ghi chú «băm số 10 chữ số đảo ngược được» của
   ADR-0011 đúng với băm không khoá; dấu vết có khoá không thử ngược được khi thiếu khoá. Đổi lại: hai dòng cùng số trong
   một sàn lộ là trùng nhau cho người đọc thẳng bảng — đó chính là việc kiểm trùng cần.
3. **Thiếu khoá.** `NODE_ENV=production` mà thiếu khoá hay khoá là khoá dev → `createApi` ném, API không dựng. Khoá sai
   dạng → ném ở mọi môi trường. Ngoài bản thật thiếu khoá → khoá dev công khai (máy dev, CI, test), vẫn mã hoá. Thông
   điệp lỗi chỉ nêu tên biến.
4. **Cơ sở dữ liệu (migration 008).** Cột `owner_phone_enc`, `owner_phone_hash`; `has_phone` theo bản mã; vai API ghi
   được, không đọc được hai cột. Ràng buộc `listing_owners_phone_chi_ban_ma` (`owner_phone is null`, NOT VALID) chặn mọi
   số rõ mới ở mọi vai. `app.reveal_owner_phone` trả bản mã, vẫn xét quyền và ghi một sự kiện; API giải bằng khoá. Hàm
   `app.cot_so_ro_chua_chan()` liệt cột chữ tên chứa `phone` chưa bị chặn — bộ kiểm cách ly đòi danh sách rỗng, nên bảng
   nào sau này lưu số dạng chữ là đỏ.
5. **Chỗ giữ khoá (Hỏi-1, Hỏi-3).** Chỉ **Vercel Production** nhận khoá — bản xem trước (Preview) không nhận: nó chạy mã
   của mọi nhánh trên cơ sở dữ liệu thật, thiếu khoá thì API của nó không dựng. Chủ kho sinh khoá ở máy mình và cất **một
   bản** trong trình quản lý mật khẩu của chủ kho — không ở kho, không ở tin nhắn, không ở máy tác tử. Khoá Sensitive của
   Vercel không đọc lại được, nên bản ngoài Vercel là bản duy nhất dùng được cho lệnh mã hoá lại.
6. **Số chủ của lead (hàng 24 gộp trước, migration 009).** `leads.owner_phone_enc` + `owner_phone_hash`, ngữ cảnh
   `leads:<company_id>:<lead_id>`; `leads_phone_chi_ban_ma` (NOT VALID) chặn số rõ mới, `leads_phone_co_so` bắt lead phải
   có số. `app.lead_dedupe_facts` nhận dấu vết (`bytea`) và so `owner_phone_hash` của chủ nhà và của lead trước — không
   hàm nào của cơ sở dữ liệu còn nhận số chủ dạng chữ. Lead chưa có cửa mở số (telesales không thấy lại số, hàng 24).

## Vận hành

**Sinh khoá** (ở máy chủ kho, một lần):

<!-- <<<SINH-KHOA -->
```bash
openssl rand -base64 32
```
<!-- SINH-KHOA>>> -->

Đầu ra là 44 ký tự kết thúc bằng `=`. Đặt vào Vercel Production, biến `OWNER_PHONE_KEY`, loại Sensitive; cất cùng giá
trị vào trình quản lý mật khẩu. Không dán vào kho, tin nhắn hay phiên tác tử.

**Mất khoá thì mất mọi số chủ.** Không có đường cứu: bản mã không giải được nếu không có khoá. Mất cả bản Vercel lẫn bản
trong trình quản lý mật khẩu là phải hỏi lại số từ chủ nhà.

**Mã hoá lại dữ liệu đã có** (sau khi áp migration 008 lên cơ sở dữ liệu thật):

1. Đếm trước — bằng vai chủ, ở **cả hai bảng**: `select count(*) from listing_owners where owner_phone is not null;` và
   `select count(*) from leads where owner_phone is not null;`. Bằng 0 thì vẫn chạy bước 2 một lần để validate ràng buộc.
   Chạy **ngay sau khi áp migration 008, 009**: ràng buộc NOT VALID vẫn xét mọi lần sửa dòng, nên lead cũ còn số rõ không
   «Bỏ lead» được tới khi chạy lệnh.
2. Với `DATABASE_URL` của vai chủ và `OWNER_PHONE_KEY` thật trong môi trường (không ghi vào tệp):
   `node --import tsx packages/api/van-hanh/ma-hoa-lai.ts`. Lệnh từ chối chạy khi thiếu khoá, khoá sai dạng hay khoá
   dev; in `đã mã hoá N dòng, M dòng đã là bản mã, L lead`. Chạy lại không đổi gì.
3. Đếm lại cả hai bảng: phải bằng 0.

**Xoá cột `owner_phone`** là migration của hàng sau, sau khi cơ sở dữ liệu thật đã chạy bước trên.

## Ngoài quyết định này

Xoay khoá (byte phiên bản `0x01` đặt sẵn, lệnh xoay để sau) · hàm kiểm trùng (hàng 24) · dịch vụ quản lý khoá (KMS) ·
số che một phần trên màn (việc màn hồ sơ căn, nếu cần) · số chủ trên máy (hàng 13).

## Hệ quả

- Mọi đường ghi số chủ sau này đi qua `maHoaSo` + `dauVetSo`; ràng buộc và phép quét lược đồ bắt đường quên.
- Bản xem trước không mở số được khi chưa có khoá — chấp nhận, vì bản xem trước chưa đăng nhập được (ADR-0009).
