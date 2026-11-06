# Pool kết nối nghe sự kiện lỗi — thiết kế

Hàng `va-pool-nghe-loi` của lộ trình, Ngoài-3 của hồ sơ `va-pool-ket-noi` (PR #155): chủ kho chọn «mở hợp đồng mới» ở Cổng
Bằng chứng 06/11. Hạng T2: chỉ lớp web, không đổi cơ sở dữ liệu.

## Vấn đề

`dungPools` (`apps/web/src/lib/api.ts`) dựng hai `pg.Pool` mỗi hàm máy chủ (hàm trang `trang`, bước chặn đầu `chan-dau`)
mà không gắn trình nghe sự kiện `error`. Với pg-pool 3.14: khi một kết nối đang RẢNH trong pool bị đầu kia đóng (pooler
Supabase cạn, khởi động lại, cắt kết nối — ECONNRESET, «Connection terminated unexpectedly»), pool tự bỏ kết nối đó
(`_remove`) rồi phát `error` lên chính pool. Không ai nghe thì EventEmitter ném — lỗi không bắt được — và phiên bản hàm
Vercel chết: mọi yêu cầu đang chạy trên phiên bản đó hỏng cùng lúc, người dùng thấy trang lỗi dù cơ sở dữ liệu đã hồi.

Đúng ca của sự cố 06/11: pooler cắt kết nối khi cạn. Chỗ thử của hồ sơ trước (`dung-su-co.mjs --tat` cắt mọi kết nối đang
sống) tái hiện được nó.

## Cách làm

- Trong `dungPools`, gắn ĐÚNG MỘT trình nghe `error` cho mỗi pool ở mọi nơi chạy (bốn pool: danh tính và ứng dụng × hàm
  trang và bước chặn đầu). Trình nghe chỉ ghi một dòng nhật ký `console.error` mang tên pool (`danh-tinh`/`ung-dung`),
  nơi chạy và mã lỗi + câu lỗi của pg — KHÔNG in đối tượng lỗi hay cấu hình pool (chuỗi kết nối mang mật khẩu).
- Kết nối ĐÃ MƯỢN (giữa hai truy vấn, ví dụ trong `withCompany` sau `begin`): pg-pool gỡ trình nghe rảnh khỏi kết nối lúc
  cho mượn, nên nếu nó bị cắt lúc ấy thì chính kết nối phát `error` mà không ai nghe — cũng sập. `dungPools` nghe sự kiện
  `connect` của pool và gắn lên mỗi kết nối mới một trình chặn LẶNG (không ghi nhật ký): truy vấn kế tiếp trên kết nối ấy
  vẫn nhận lỗi của chính nó và đi đường cũ; kết nối rảnh vẫn chỉ ghi một dòng (qua trình nghe của pool).
- Không tự thử lại, không đóng pool: pg-pool đã bỏ kết nối hỏng; lời gọi kế tiếp lấy kết nối mới như thường. Yêu cầu
  đang dở trên đúng kết nối ấy vẫn nhận lỗi của chính nó — đi đường cũ (5xx → trang lỗi «Thử lại» của hồ sơ trước).
- Bài kiểm đơn vị trên pool thật (không kết nối): mỗi pool có đúng một trình nghe; phát `error` không ném và ghi đúng một
  dòng không chứa mật khẩu; đối chứng: pool trần (không qua `dungPools`) phát `error` thì ném.
- Bài quét mã: chỗ duy nhất dựng `Pool`/`Client` của pg trong `apps/web/src` và `packages/api/src` là `dungPools`.
- Bài thử thật trên chỗ thử (tiến trình con nạp `dungPools` thật bằng `tsx`), hai kịch bản — kết nối rảnh và kết nối đã mượn: Postgres sau công tắc mạng; tiến trình mở kết nối rồi để rảnh, công tắc cắt, tiến trình
  KHÔNG chết và nhật ký có dòng lỗi; công tắc mở, truy vấn kế tiếp chạy. Chiều đỏ: cùng kịch bản với pool trần trong một
  tiến trình con → tiến trình con chết với mã khác 0.

**Không** dựng bể kết nối mới, không đổi cỡ pool, không đổi `withCompany` hay `packages/`.

## Đối chiếu ngành (ADR-0022)

Không có đối tượng nghiệp vụ hay danh sách cố định mới — bảng đối chiếu RESO và sản phẩm khác không áp.

## Đặc tả UX

Không chạm giao diện: không màn, chữ hay trạng thái mới; khi kết nối đang dùng hỏng thì vẫn là trang lỗi «Thử lại» sẵn có.
