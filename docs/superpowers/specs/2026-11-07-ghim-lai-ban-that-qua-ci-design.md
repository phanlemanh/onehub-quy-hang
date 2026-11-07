# Nút ghim lại hồ sơ cần bản thật, chạy trên GitHub

Ngày 07/11/2026 · hàng `ghim-lai-ban-that-qua-ci` (T3 — chạm `.github/workflows/`, `_acceptance/config.yaml`) · dãy Q, đợt
`dau-khach-nhap` · Cổng Đáng: chủ kho «Mở hàng nút CI» 07/11, giám sát mở hàng (Q-11).

## Vì sao

PR #192 chờ ghim lại hồ sơ `moi-truong-that`: lệnh `repin-lane.mjs --write` cần chuỗi kết nối vai chủ của bản thật,
`SUPABASE_URL`, khoá công khai và địa chỉ app. Máy không đọc được bí mật (luật quyền chặn `.env*` và dò bí mật trên GitHub);
chủ kho không phải developer. Bí mật bản thật đã ở environment `production` của GitHub — job `deploy` và nút «Nạp dữ liệu
mẫu» đang dùng; environment ấy chỉ cho nhánh main.

## Thiết kế

1. **Luồng chạy tay** `.github/workflows/ghim-lai-ban-that.yml` — chỉ `workflow_dispatch`; ô `ho_so` là danh sách cố định
   (`[moi-truong-that]`, thêm hồ sơ là sửa luồng qua PR); ô `nhanh` là nhánh PR. Chạy từ main (environment production chỉ
   cho main). Hai bản checkout: `goc` (main — bộ chặn và bộ quét lấy từ đây, nhánh PR không sửa được) và `nhanh` (nhánh PR —
   mã của hồ sơ). `npm ci` trong `nhanh`, lấy kit theo `KIT_TAG` như CI, chạy bộ chặn của main trên cây nhánh, rồi
   `repin-lane.mjs --write` cho đúng hồ sơ ấy trong `nhanh`. Quyền kho chỉ đọc (`contents: read`). Bí mật `PROD_DATABASE_URL` chỉ ở bước ghim lại; `SUPABASE_URL`,
   `SUPABASE_PUBLISHABLE_KEY` là biến (giá trị công khai) của environment production; `APP_URL` cố định tên miền chính.
2. **Quét rồi mới tải** — bước `quet-bi-mat.mjs` (lấy từ main, `if: always()`) tìm `PROD_DATABASE_URL` và riêng phần mật
   khẩu của nó trong hai tệp sắp tải (thông báo lỗi kết nối có thể in nguyên chuỗi; GitHub không che bí mật trong tệp
   đính kèm); gặp thì dừng, không tải, chỉ in tên tệp. **Kết quả ra tệp đính kèm, không ghi kho**: `run-log.jsonl` và `evidence-report.md` của hồ sơ tải lên artifact (cả khi
   làn đỏ — để đọc dòng `repin-do`), giữ 7 ngày. Máy tải về (`gh run download`), commit vào nhánh PR và đẩy — đẩy của máy
   chạy CI bình thường (đẩy bằng token của luồng thì không).
3. **Bộ chặn** `.github/scripts/chan-ghim-ban-that.mjs <slug>`: từ chối khi một eval còn chạy (không `status: not-run`) của
   hồ sơ gọi `test:isolation`, `test:db`, `db:test` (giải `config:` theo config.yaml), khi một tham chiếu không giải được,
   hay khi `feature_loop.repin_ci_blank_env` không để trống `DATABASE_URL`.
4. **Bộ kiểm chung không thấy bí mật**: `feature_loop.repin_ci_blank_env: [DATABASE_URL, SUPABASE_URL,
   SUPABASE_PUBLISHABLE_KEY, APP_URL]` — làn của kit đặt các biến ấy RỖNG cho bộ kiểm chung, eval của hồ sơ vẫn thấy đủ.
   Áp cả cho mọi lần ghim lại tại máy (bộ kiểm chung không cần cơ sở dữ liệu).
5. **Dùng lần đầu cho PR #192**: trên nhánh #192, E8 của moi-truong-that đổi lệnh sang `config:executors.script.suc_khoe_that`
   (gọi thẳng `APP_URL/api/v1/health`) — lệnh cũ cần thư mục đã `vercel link` và phiên Vercel CLI, CI không có; chủ kho đã
   duyệt E8 đo trên bản thật («Áp gói khuyên» 07/11). Sau khi hàng này gộp: gộp main vào nhánh #192, bấm nút
   (`ho_so=moi-truong-that`, `nhanh=claude/va-thuoc-ci-moi-truong-that-ban-that`), tải tệp đính kèm, commit, đẩy, gộp #192.
   Trên nhánh #192, E3 của moi-truong-that đã khai `status: not-run`, `superseded_by: va-deploy-csdl-tam#AC-2` (commit
   ffa51298). Trước khi bấm, máy chạy bộ chặn tại máy trên cây #192 — phải ra «CHO CHẠY moi-truong-that» (đo 07/11: ra đúng).

## Rủi ro đã cân

- Luồng chạy mã của nhánh PR với bí mật bản thật trong env của eval. Gác: danh sách hồ sơ cố định (trong luồng của main), bộ chặn
  bộ kiểm ghi (từ main), bộ quét tệp đính kèm (từ main), bộ kiểm chung để trống biến (khoá đọc từ cây nhánh — bộ chặn của
  main đòi khoá có mặt), quyền kho chỉ đọc, environment production (chủ kho có thể bật «Required reviewers» để duyệt từng
  lượt). Nhánh do máy hay chủ kho viết; nhánh lạ vẫn chạy được nếu ai có quyền bấm — đó là Hỏi-2.
- Eval `moi_truong_that` (E1, E2, E4, E5) chỉ đọc (`kiem-moi-truong.mjs`, «chỉ đọc»); E6, E7, E9 không chạm bản thật.

## Đối chiếu ngành (ADR-0022)

Không phải đối tượng nghiệp vụ — là quy trình phát hành. Nếp thường gặp: việc cần bí mật môi trường thật chạy trong CI có
environment bảo vệ (GitHub Environments), không đưa bí mật về máy người.

## Phạm vi

Làm: luồng, bộ chặn, một khoá config, bước dùng lần đầu cho #192. Không làm: đổi `KIT_TAG`; bật «Required reviewers» cho
environment (cài đặt của chủ kho); thêm hồ sơ khác vào danh sách; cho luồng ghi kho.
