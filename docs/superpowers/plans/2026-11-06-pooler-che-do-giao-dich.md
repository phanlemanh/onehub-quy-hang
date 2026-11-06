# Kế hoạch thi công — pooler-che-do-giao-dich

Hợp đồng: `_acceptance/pooler-che-do-giao-dich/contract.md` (duyệt 06/11, Manh Phan; Hỏi-1..3 nhận khuyến nghị).
Thiết kế: `docs/superpowers/specs/2026-11-06-pooler-che-do-giao-dich-design.md`. Hạng T3 — kế hoạch này chờ duyệt
(Gate 1.5) trước khi viết mã.

Thứ tự: T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8 → T9. Mỗi task một commit Conventional Commits trên nhánh
`claude/pooler-che-do-giao-dich`.

## T1 — Bể danh tính không tham số khởi động, dòng nhật ký nêu cổng

- Files: `apps/web/src/lib/api.ts`, `apps/web/src/lib/api.test.ts`
- Làm: bỏ `options: "-c search_path=identity"` khỏi `dungPools`; mỗi lần dựng bể ghi một dòng
  `[pool:ket-noi] cổng <cổng> · <nơi>` (cổng đọc bằng `new URL(url).port`, vắng thì 5432; không in máy chủ, người dùng,
  mật khẩu); sửa chú thích cỡ bể (chế độ phiên hôm nay, chế độ giao dịch sau Cổng Bằng chứng). Bài kiểm: ma trận hai nơi
  không `options`; dòng cổng với chuỗi thử mang `mat-khau-thu`, `may-chu-thu`, cổng 6543; bỏ assert cũ
  `options === "-c search_path=identity"`.
- Verify: `npm test -w @quy-hang/web`
- Phục vụ: E1 · independent: true

## T2 — better-auth đặt lược đồ ở adapter, truy vấn tay ghi `identity.`

- Files: `packages/api/src/auth/auth.ts`, `packages/api/package.json`, `package-lock.json`, `packages/api/src/app.ts`
  (chú thích), `packages/api/src/ten-hien-thi.ts`, `packages/api/src/leads/routes.ts`, `packages/api/src/owners/routes.ts`,
  `packages/api/src/routing/routes.ts`, `packages/api/test-db/helpers.ts`, `packages/api/test-db/owners.test.ts`,
  `packages/api/test-db/hom-nay-truong-nhom.test.ts`
- Làm: thêm `kysely` (^0.29.7, bản đã có trong cây) vào phụ thuộc của `@quy-hang/api`; `createAuth` truyền
  `{ dialect: new PostgresDialect({ pool: identityPool }), type: "postgres", schemaName: "identity", transaction: true }`;
  sáu câu `"user"` → `identity."user"`; `helpers.ts` dựng `identityPool` không `options`; chú thích kiểu
  `CreateAuthOptions.identityPool` và `ApiDeps.identityPool` thôi nói «search_path = identity».
- Verify: `npm run typecheck`; `npm test -w @quy-hang/api`; Postgres tạm cổng 5597 → `npm run db:migrate && npm run db:test`
  xanh, đầu ra không có «Could not validate the database schema».
- Phá-thử (chiều đỏ E2, ghi vào sổ): lần lượt trả từng câu trong bốn tuyến về `"user"` trần → ghi tên ca db:test đỏ với
  `relation "user" does not exist`; tuyến nào không ca nào đỏ thì thêm ca vào `test-db` của tuyến ấy rồi đo lại.
- Phục vụ: E2, E12 · independent: true

## T3 — Bài thử bộ kiểm db trên Postgres riêng

- Files: `_acceptance/pooler-che-do-giao-dich/thu/cach-ly.test.mjs`
- Làm: ca dựng container `quy-hang-db-pooler-V` (postgres:16, cổng 5597), `npm run db:migrate && npm run db:test` với
  `DATABASE_URL` trỏ nó, assert mã 0 và đầu ra không khớp lỗi lược đồ; assert `helpers.ts` không dựng bể với `options`
  (rút từ chính tệp); dọn container ở `after`.
- Verify: `node --import tsx --test _acceptance/pooler-che-do-giao-dich/thu/cach-ly.test.mjs`
- Phục vụ: E2 · independent: false (sau T2)

## T4 — Bàn thử pooler chế độ giao dịch tại máy

- Files: `_acceptance/pooler-che-do-giao-dich/thu/pgbouncer.mjs` (dựng/dọn), `thu/con-api.mts` (tiến trình con nạp
  `getApi` thật), `thu/pooler-giao-dich.test.mjs`
- Làm: `brew install pgbouncer` (Hỏi-1 đã duyệt). `pgbouncer.mjs` sinh `pgbouncer.ini` + `userlist.txt` vào
  `.acceptance-runs/pooler-che-do-giao-dich/` (`pool_mode = transaction`, `default_pool_size = 1`, `max_client_conn = 200`,
  cổng 5596, cổng quản trị bật cho `SHOW CONFIG`), trỏ Postgres chỗ thử `va-pool-ket-noi` (5598). Đường dẫn suy từ vị trí
  tệp, không ghim gốc kho. Ca E3: đăng nhập bằng mã (đọc dòng `[ma-dang-nhap]`), `/api/v1/me`, Hôm nay, Bảng hàng; đối
  chứng cấu hình cũ hỏng. Ca E4: mở sàn thứ hai bằng `moSan`, cấp phiên, thêm một căn qua API; 10 tiến trình × 4 yêu cầu
  khởi cùng tín hiệu; ma trận 40 phản hồi so với tập căn đọc trực tiếp ở 5598; kết nối trần sau loạt; đối chứng đặt mức
  phiên thì rò.
- Verify: `node --import tsx --test _acceptance/pooler-che-do-giao-dich/thu/pooler-giao-dich.test.mjs`
- Phục vụ: E3, E4 · independent: false (sau T1, T2)

## T5 — Bài quét trạng thái phiên

- Files: `_acceptance/pooler-che-do-giao-dich/thu/quet-trang-thai-phien.test.mjs`
- Làm: chín mẫu của E5 trên cây thật (danh sách bảng identity rút từ migration); mười bốn mồi theo dạng viết bị gọi tên;
  năm đối chứng dương không bị gọi tên.
- Verify: `node --test _acceptance/pooler-che-do-giao-dich/thu/quet-trang-thai-phien.test.mjs`
- Phục vụ: E5 · independent: false (sau T2 — cây thật mới sạch)

## T6 — Bài phạm vi và ADR chỉ thêm

- Files: `_acceptance/pooler-che-do-giao-dich/thu/pham-vi.test.mjs`, `thu/adr-chi-them.test.mjs`
- Làm: danh sách cho phép rút từ mục Notes của hợp đồng; chiều đỏ năm đường; ca cây thật bỏ qua khi diff rỗng.
  `adr-chi-them`: diff ADR-0009 từ điểm rẽ không dòng xoá, có «Sửa đổi 06/11»; chiều đỏ trên diff mồi.
- Verify: `node --test _acceptance/pooler-che-do-giao-dich/thu/pham-vi.test.mjs _acceptance/pooler-che-do-giao-dich/thu/adr-chi-them.test.mjs`
- Phục vụ: E6, E13 · independent: true

## T7 — Tài liệu

- Files: `docs/adr/0009-moi-truong-that.md` (mục «Sửa đổi 06/11», không sửa đoạn cũ),
  `docs/architecture/kien-truc-repo-va-stack.md`, `docs/product/tham-chieu.md` (§12 một dòng 06/11)
- Làm: chế độ giao dịch và vì sao; lược đồ danh tính ở adapter; job migrate giữ `PROD_DATABASE_URL`; bước đổi
  `DATABASE_URL` bản thật, theo dõi 30 phút, cách lùi về 5432.
- Verify: `node --test _acceptance/pooler-che-do-giao-dich/thu/adr-chi-them.test.mjs`
- Phục vụ: E8, E13 · independent: true

## T8 — Bản xem trước cổng 6543

- Files: `_acceptance/pooler-che-do-giao-dich/thu/xem-truoc.mjs`
- Làm: đẩy nhánh, mở PR nháp để Vercel dựng bản xem trước. Đặt `DATABASE_URL` phạm vi bản xem trước của nhánh qua CLI
  Vercel (Hỏi-2): đọc chuỗi hiện có vào tệp tạm trong thư mục nháp, đổi cổng 5432 → 6543, ghi bằng `vercel env add …
  preview claude/pooler-che-do-giao-dich` qua stdin, xoá tệp tạm — không in giá trị. Rào của app chặn → không lách, báo
  chủ kho đúng một bước. Dựng lại bản xem trước sau khi đặt biến. Tập lệnh bốn bước của E7 (cổng 6543 trong nhật ký,
  40 yêu cầu, nhật ký bản xem trước, nhật ký bản thật). Phép đo thật chạy trong giờ vắng (Hỏi-3): sau 15:00Z (22:00 giờ
  Việt Nam), một đợt, dừng khi bản thật có `EMAXCONNSESSION`.
- Verify: `APP_URL=<bản xem trước> VERCEL_LINK_DIR=<thư mục link> node _acceptance/pooler-che-do-giao-dich/thu/xem-truoc.mjs`
- Phục vụ: E7 · independent: false (sau T1, T2)

## T9 — Phá-thử và chốt S3

- Làm: chiều đỏ của E1 (trả `options` vào `dungPools`), E2 (đã làm ở T2), E7 (chạy với một triển khai cổng 5432) — mỗi
  lần ghi một dòng sổ `fix`/`approach` nêu ca đỏ, rồi hoàn lại. `/verify` đủ bước. Hợp đồng → `implemented`.
- Verify: `npm run typecheck && npm run lint && npm test && npm run build`
- Phục vụ: E1, E2, E7, E9–E12 · independent: false

## S4

Một lượt chấm sau T9, dưới khoá `s4` của đợt, với `--diff-base $(git merge-base HEAD origin/main)`. E7 thuộc lượt chấm
nên lượt chấm bắt đầu trong giờ vắng (sau 15:00Z).
