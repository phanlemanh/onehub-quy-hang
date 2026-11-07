# Vá bài kiểm «đường lõi mật khẩu đóng»: thôi đếm người dùng của cả cơ sở dữ liệu

Ngày 07/11/2026 · hàng `va-dong-duong-gui-ma-song-song` (T2) · dãy Q, đợt `dau-khach-nhap` · Cổng Đáng: chủ kho «build» 07/11.

## Vì sao

Ca «đường lõi mật khẩu đóng» trong `packages/api/test-db/dong-duong-gui-ma/dong-duong-gui-ma.test.ts` (hàng
dang-nhap-mat-khau, E9) gọi mười lần mỗi đường lõi «đã tắt» rồi khẳng định đường đăng ký không tạo người. Nó đếm
`select count(*) from identity."user"` — **toàn bảng** — trước và sau. Bộ kiểm API chạy tuần tự từng tệp, nhưng cơ sở dữ
liệu của lượt chấm thì dùng chung: máy chủ dev hay một bộ kiểm khác tạo người cùng lúc là số lệch. Đã đỏ oan hai lần:
lượt chấm 2 của mau-nhap-va-bai («13 khác 12», xếp là nhiễu hạ tầng) và lượt chấm 1 của va-deploy-csdl-tam (chạy lại riêng
xanh 488/488).

Còn một chỗ yếu thứ hai: mọi lời gọi dùng `email` đã có người (sàn mở bằng email ấy), nên đường đăng ký lỡ mở lại cũng
không tạo người — thư viện từ chối email trùng. Khẳng định «đường đăng ký tạo người» hiện chỉ có ích nhờ đếm toàn bảng.

## Thiết kế

1. Thêm `emailMoi = mail("loi-tat-moi")` — email chưa ai đăng ký, mang tiền tố `RUN` riêng mỗi tiến trình nên không trùng
   giữa các lượt, và `after(cleanup)` của tệp xoá theo tiền tố ấy. Ca khẳng định `emailMoi` đã ở dạng chuẩn
   (`trim().toLowerCase()`, thông điệp «email thử chưa ở dạng chuẩn») vì thư viện chuẩn hoá email trước khi lưu mà câu đếm
   so nguyên chuỗi.
2. Ngoài vòng hiện có (mọi đường × 10 với `email`), gọi thêm đường đăng ký của bảng lõi (`BANG_LOI.signUpEmail[0]`,
   `/sign-up/email`) mười lần với `emailMoi`; mỗi lần phải 404.
3. Đếm người chỉ trên hai email ấy: `select count(*) from identity."user" where email = any($1)` với `[email, emailMoi]`,
   trước và sau; thông điệp giữ nguyên «đường đăng ký tạo người». Các khẳng định khác của ca (404, không gửi thư, không
   đốt lượt xin mã, không đếm thử sai, đối chứng dương xin mã) giữ nguyên.
4. Không đổi mã nguồn ngoài tệp kiểm; không đổi cấu hình bộ kiểm (`--test-concurrency=1` giữ nguyên).

## Bộ đo của hàng (`_acceptance/va-dong-duong-gui-ma-song-song/thu/kiem-song-song.mjs`)

Chép tệp kiểm ra `.acceptance-runs/va-dong-duong-gui-ma-song-song/` (đường nhập viết lại thành tuyệt đối), chèn một câu
ghi người ngay trước dòng đếm «sau», chạy riêng bằng `node --import tsx --test` trên Postgres của `DATABASE_URL` (mặc
định dãy Q, cổng 5577). Không ghi gì vào cây kho.

- `--song-song`: chèn người mang email khác (giả một tệp kiểm khác chạy cùng lúc) → bản của cây xanh; đối chứng: cùng chèn
  vào bản tệp tại `987c78c6` (trước hàng) → đỏ «đường đăng ký tạo người».
- `--dang-ky-tao`: chèn người mang `emailMoi` (giả đường đăng ký lỡ mở lại) → bản của cây đỏ đúng «đường đăng ký tạo người».
- `--that`: chạy tệp thật của cây, không chèn → xanh, đủ bốn ca, có dòng «✔ đường lõi mật khẩu đóng».

## Đối chiếu ngành (ADR-0022)

Không phải đối tượng nghiệp vụ hay danh sách của sàn — là bài kiểm. Không có cột RESO, không có chỗ «ta cứng — họ cấu
hình». Nếp thường gặp: bài kiểm trên cơ sở dữ liệu dùng chung chỉ khẳng định trên dòng do chính nó tạo (lọc theo khoá
riêng của lượt — kho đã dùng tiền tố `RUN`), không đếm cả bảng.

## Phạm vi

Làm: một ca trong một tệp kiểm. Không làm: sửa ca khác hay tệp kiểm khác đếm toàn bảng (chưa soát — ghi việc theo sau nếu
thấy); đổi bảng xếp loại đường lõi; đổi `--test-concurrency`.
