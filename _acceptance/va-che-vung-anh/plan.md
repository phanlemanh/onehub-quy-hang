# Vá Che vùng ảnh — kế hoạch

Một chuỗi việc nối nhau trong `apps/web/src/app/(app)/units/photos/redact/`; không việc nào độc lập để chạy song song.

## Việc 1 — hàm thuần đổi điểm hiển thị sang điểm vẽ (phục vụ E1, E6) · independent: false

- Tệp: `redact/vung.ts`, `redact/vung.test.ts`.
- Viết ca «E1v …» trước (ma trận của `diemTrenKhung` và chuỗi `diemTrenKhung → khungTuMan`, đối chứng đỏ hàm giả trả nguyên
  điểm), thấy đỏ vì hàm chưa có, rồi thêm `diemTrenKhung(p, hienThi, hien)`: nhân theo từng trục, khung hiển thị rỗng trả
  nguyên điểm, không kẹp.
- Kiểm: `npm test -w @quy-hang/web` — ca E1v và E1–E5 của hàng 19 xanh; phá thử: tạm đổi hàm thành trả nguyên điểm → ô
  «co 0,5» đỏ gọi tên ô, rồi hoàn lại.

## Việc 2 — trình che: hộp rộng, khung co, điểm kéo theo cỡ hiển thị (phục vụ E2–E5) · independent: false

- Tệp: `redact/trinh-che.tsx`.
- `DialogContent className="sm:max-w-5xl"` (bỏ `max-w-5xl` không tiền tố); canvas thêm
  `block h-auto max-h-[calc(100dvh-13rem)] w-auto max-w-full`; `diem()` đọc `getBoundingClientRect` rồi qua `diemTrenKhung`
  với cỡ vẽ `hien`. Chú thích một dòng: ngoại lệ có hạn của ADR-0024 tới khi chuyển sang ngăn nổi (hàng 91).
- Kiểm: `npm run typecheck`, `npm run lint` (mức nợ 0), bản chạy dev dãy B (3481) nhìn ba khổ.

## Việc 3 — ranh giới và sàn (phục vụ E7–E10)

- `node _acceptance/va-che-vung-anh/thu/ranh-gioi.mjs` exit 0; design floor S3.
