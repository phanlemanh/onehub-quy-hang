# Thiết kế: va-ac9-mau-co-san — AC-9 chỉ đếm dòng do chính bài nạp

Hàng vá khẩn dãy D (đợt `dau-khach-nhap`), chủ kho mở 06/11, giám sát trả D-22 «duyet». Câu giao ở hàng
`va-ac9-mau-co-san` của `docs/plan/lo-trinh.json`. Hạng T3 vì chạm `packages/db/**`.

## Vấn đề

Job `deploy` trên nhánh chính chạy `npm run test:isolation -w @quy-hang/db` trên cơ sở dữ liệu bản thật
(`PROD_DATABASE_URL`) trước khi gọi Vercel. Lệnh ấy chạy mọi tệp `packages/db/tests/*.test.mjs`, kể cả
`du-lieu-mau-thap-tang.test.mjs`. Ca AC-9 của tệp đó (dòng 788) đỏ từ 05/11 08:41Z:

```
AssertionError [ERR_ASSERTION]: còn dòng mẫu sau xoá
  actual: 1,
  expected: 0,
```

Nguyên nhân: hàm `conDongMau` (dòng 708) đếm MỌI sàn có tên bắt đầu `[Mẫu] Sàn` và MỌI người có email miền
`@mau.quy-hang.test` trong cơ sở dữ liệu, rồi đòi số ấy bằng 0 sau lệnh xoá. Lệnh xoá (`CAU_XOA` của
`packages/db/seed/nap.mjs`) chỉ gỡ người miền mẫu và đúng sàn tên `[Mẫu] Sàn thử`. Cơ sở dữ liệu nào có sẵn một sàn
mẫu tên khác (bản thật có một) thì phép đếm ra 1 dù bài đã gỡ sạch mọi thứ nó nạp. Dựng lại tại máy 06/11: cơ sở dữ
liệu tạm sau migrate, thêm một dòng `[Mẫu] Sàn trình diễn` → AC-9 đỏ đúng câu trên, `actual: 1`.

Ca «hai sàn mẫu» (dòng 841) mắc cùng lớp: đếm mọi sàn tên `[Mẫu] Sàn thử%`.

## Cách sửa (chỉ trong tệp kiểm)

- **Hai hàm đếm theo tập mốc** (bài đo E3 bám đúng tên và chữ ký này): `async function dongMauMoi(c, goc)` trả số
  dòng mang nhãn mẫu (sàn tên `[Mẫu] Sàn…`, người miền mẫu) mà mã không có trong `goc`; `async function
  sanMauMoi(c, goc)` trả số sàn tên `[Mẫu] Sàn thử%` mà mã không có trong `goc`. `goc` là tập mốc ghi lúc chụp `s0`.
  Phá thử «xoá thiếu» khẳng định `coLoi(loi, "còn dòng mẫu sau xoá")` với `loi` dựng từ `dongMauMoi`; phá thử «nạp sàn
  thứ hai» khẳng định `coLoi(loi, "hai sàn mẫu")` với `loi` dựng từ `sanMauMoi`.
- **Phép đếm theo mốc của chính bài.** Ngay sau ảnh chụp `s0` (cơ sở dữ liệu trong giao dịch, đã gỡ dữ liệu mẫu theo
  lệnh xoá), bài ghi tập mã (`id`) của các dòng mang nhãn mẫu còn lại — đó là dữ liệu có sẵn bài không nạp. Phép
  đếm «còn dòng mẫu» và «hai sàn mẫu» chỉ đếm dòng mang nhãn mẫu mà mã KHÔNG nằm trong tập mốc. Phép so ảnh chụp
  `assert.deepEqual(anhChup(c), s0)` giữ nguyên: nó đã chứng cả hai chiều (không sót dòng bài nạp, không mất dòng có
  sẵn).
- **Phá thử giữ chiều đỏ.** Hai ca phá thử (xoá thiếu một câu, nạp sàn thứ hai) dùng cùng phép đếm mới; chúng phải đỏ
  trên cơ sở dữ liệu có sàn mẫu khác cũng như trên cơ sở dữ liệu sạch — bài đo E1 chạy cả tệp trên cơ sở dữ liệu có
  sàn mẫu khác, nên phá thử nào xanh oan là tệp đỏ.
- **Không đổi gì khác.** `CAU_XOA`, `xoaMau`, bộ nạp, giao dịch rollback và bước deploy giữ nguyên. Bài vẫn xoá dữ
  liệu mẫu trong giao dịch để có mốc sạch, rồi rollback — dữ liệu bản thật không đổi sau lượt chạy (đo bằng E2).

## Đo

Bài đo `_acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs` dựng cơ sở dữ liệu tạm (`CREATE DATABASE` trên Postgres
được chỉ qua `DATABASE_URL`, mặc định Postgres dãy D cổng 5575), migrate, và chạy cả tệp kiểm bằng `node --test`
trên ba trạng thái:

| Ca | Dữ liệu có sẵn | Kỳ vọng bản sửa | Kỳ vọng bản cũ |
|---|---|---|---|
| `sach` | không có gì | tệp xanh, AC-9 chạy; bộ kiểm cách ly xanh | xanh |
| `san-khac` | `[Mẫu] Sàn thử` (bộ nạp mẫu `seed/nap.mjs --nap`) · `[Mẫu] Sàn trình diễn` và `[Tên sàn] có sẵn` (lệnh mở sàn `scripts/mo-san.mjs`) | tệp xanh, AC-9 chạy; lệnh deploy xanh; dữ liệu có sẵn không đổi | đỏ «còn dòng mẫu sau xoá» |
| `san-thu-trung` | chỉ `[Mẫu] Sàn thử (bản cũ)` (lệnh mở sàn) | tệp xanh | đỏ «còn dòng mẫu sau xoá» |

Dữ liệu có sẵn dựng bằng chính bộ ghi đã dựng sàn trên bản thật (bộ nạp mẫu hàng 5 và lệnh mở sàn vận hành), không
chèn tay. Câu giao của hàng viết «như «[Mẫu] Sàn thử» trên bản thật»; nhật ký deploy cho thấy dòng thừa là một sàn
tên khác, vì «[Mẫu] Sàn thử» đã bị lệnh xoá gỡ trong giao dịch — ca `san-khac` có cả hai.

Hai phép phá (E3): chèn `return 0;` đầu `dongMauMoi` rồi chạy trên `san-khac` → tệp đỏ ở `coLoi(loi, "còn dòng mẫu
sau xoá")`; chèn `return 0;` đầu `sanMauMoi` rồi chạy trên `san-thu-trung` → tệp đỏ ở `coLoi(loi, "hai sàn mẫu")`.

Dữ liệu có sẵn đo bằng băm các dòng của `companies`, `identity."user"`, `company_members` trước và sau lượt chạy
(đối chứng dương: trước lượt, đủ số dòng đã cấy). Bản cũ lấy bằng `git show <sha>:packages/db/tests/...` vào một tệp
tạm cạnh tệp thật (để đường nhập `../seed/...` đúng), xoá trong `finally`. Cơ sở dữ liệu tạm bị `DROP` cuối lượt.

Job deploy xanh ở lần gộp đầu sau hàng này là thước sống (ô cơ hội) — chỉ đo được sau khi gộp, ghi ở «Đường đo».

## Đối chiếu ngành

Không áp: vòng không thêm đối tượng, trường, danh sách hay điểm cấu hình nào — chỉ sửa phép đếm của một bài kiểm.
Không có dòng «ta cứng — họ cấu hình».

## Ngoài vòng

- Bước deploy chạy bộ kiểm trên cơ sở dữ liệu bản thật: việc đó có từ trước và đúng ý (bộ kiểm cách ly là check bắt
  buộc trước phát hành, AGENTS.md bất biến 1). Có nên tách tệp dữ liệu mẫu khỏi lệnh chạy trên bản thật là một câu
  hỏi riêng — đề xuất làm hàng riêng nếu chủ kho muốn.
- Sàn mẫu có sẵn trên bản thật: không dọn, không đổi.
- `va-ac8-uuid-nham-so` (cùng tệp) chờ sau hàng này.
