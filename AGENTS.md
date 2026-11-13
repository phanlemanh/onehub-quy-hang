# onehub-quy-hang — hướng dẫn cho mọi AI coding agent

Quỹ hàng là **SaaS quản lý hàng cho sàn môi giới bất động sản**: nhận lead chủ nhà, biến thành căn sẵn sàng bán,
giữ tươi, phát cho đầu khách và khách qua link sống. Gốc quyết định: ADR-0017 của kho `onehub-invest`; khởi điểm của
kho này: `docs/adr/0001-khoi-diem.md`. Từ vựng (nhãn UI ↔ tên code): `CONTEXT.md`.
Làm việc với người dùng bằng **tiếng Việt**.

**Điều đang đúng của sản phẩm: `docs/product/tham-chieu.md`** — đọc trước khi đề xuất việc mới; không hỏi lại điều đã
chốt ở §12 «Sổ quyết định». Kiến trúc và stack: `docs/architecture/kien-truc-repo-va-stack.md`. Bảng «mỗi loại thông
tin một chỗ»: `docs/README.md`. Làm xong một việc làm đổi điều đang đúng → sửa Tham chiếu trong cùng PR.

## Bản đồ kho

```
apps/web          bàn làm việc (máy tính + điện thoại) và trang khách /s/<mã> — Next.js
packages/core     luật nghiệp vụ thuần: lớp dữ liệu và trần, thoả thuận; sau: trạng thái, tính giá, luật ẩn, kiểm trùng
packages/api      API có phiên bản /api/v1 (Hono + OpenAPI): đường ghi duy nhất, đọc cho bên ngoài
packages/connect  loại kết nối và khuôn dữ liệu cấp vào; kết nối đầu tiên: danh mục từ OneHub Invest
packages/db       migration đánh số, luật cách ly theo dòng, bộ kiểm cách ly
packages/ui-lint  luật lint giao diện quy-hang-ui, mức nợ giao diện (trần 0), kiểm chuẩn — chạy trong npm run lint
.agents/skills/   skill giao diện quy-hang-ui và skill reui (nạp qua symlink ở .claude/skills/)
docs/adr/         quyết định kiến trúc của kho này
```

## Bất biến — không thoả thuận, cấu hình hay yêu cầu nào mở được

1. **Cách ly giữa công ty.** Mọi bảng của công ty bật luật theo dòng (`enable` + `force row level security`) theo
   `app.current_company_id()`; API chạy bằng vai `quy_hang_app`, không phải chủ bảng. Bảng mới thiếu luật là lỗi chặn.
   Bộ kiểm `packages/db/tests/isolation.test.mjs` là check bắt buộc trước mỗi lần phát hành.
2. **Thông tin chủ nhà không rời công ty.** Lớp dữ liệu `source` (chủ nhà, số điện thoại, giá đáy, ảnh sổ) có trần
   `never_leaves_company` trong `packages/core` và bị chặn thêm ở ràng buộc của cơ sở dữ liệu. Không nới ở chỗ nào.
3. **Người luôn là người bấm gửi.** Không tích hợp gửi tin qua Zalo cá nhân, không đăng vào nhóm, không tự trả lời.
   Chỉ mở bảng chia sẻ của thiết bị.
4. **Phần nội bộ không ra trang khách.** Dữ liệu ra ngoài được dựng từ luật ẩn ở `packages/core`, không ẩn ở giao diện.
   Luật ẩn là `banRaNgoai` (`@quy-hang/core/redaction`); bộ kiểm rò rỉ (`npm run test:ro-ri`, job `ro-ri`) là check bắt
   buộc, và trang cửa ra nào cũng có tệp `*.ro-ri.test.ts` quét mồi trên mã nguồn trang.

## Luật làm việc

- **Mọi kết nối là một thoả thuận** (`packages/core/src/agreements.ts`), không viết riêng từng bên. Invest, Platform
  hay công ty khác đều là bên của một loại kết nối.
- **Không đọc cơ sở dữ liệu của OneHub Invest**, không gọi sang Invest — Invest không có cửa vào. Invest đẩy dữ liệu
  theo khuôn ở `packages/connect`; khuôn `.strict()` — khoá lạ bị từ chối. Chiều ngược duy nhất là «xác nhận danh mục»
  (ADR-0017 §6 sửa đổi 03/11): máy thu Invest kéo từ hộp thư đi của Quỹ hàng bằng token máy, theo thoả thuận từng sàn.
- **Dữ liệu cá nhân thật không vào kho**: không tên, số điện thoại thật trong test, fixture, docs. Dùng `[Tên]`,
  `0900 000 0xx`.
- **Schema chỉ đổi bằng migration mới** trong `packages/db/migrations/NNN_*.sql`; không sửa migration đã commit.
- **Thiết kế đối chiếu ngành** (ADR-0022): câu giao là điểm sàn, không phải trần; danh sách cố định trong câu giao mặc
  định là dữ liệu của sàn; bản thiết kế so với RESO và ít nhất hai sản phẩm ở `docs/product/doi-chieu-nganh.md`. Bảng
  luật thiết kế đủ bộ ở ADR-0022 §3.
- **RESO-first**: tên trường và giá trị theo RESO Data Dictionary khi có (`UnitNumber`, `BuildingName`, `LivingArea`…);
  đặc trưng Việt Nam mới được đặt tên riêng.
- **TypeScript chặt** ở mọi gói. Code, API, tên bảng tiếng Anh; comment nghiệp vụ và chữ UI tiếng Việt, nhãn lấy từ
  `CONTEXT.md`.
- **UI: chọn trên kho ReUI trước, tự viết sau cùng.** Mỗi ô của màn đi thang dùng lại ở `.claude/rules/giao-dien.md`
  (khối đã chọn → khối ReUI khác → ví dụ `c-*` → thành phần → ghép → tự viết); chuyển thể chỉ đổi dữ liệu, chữ, prop.
  Vỏ, IA và khối đích từng màn: `docs/design/vo-va-ia.md` (ADR-0002). Style `base-nova`, icon lucide, như onehub-invest.
- **Git**: `main` có bảo vệ nhánh, vào main chỉ qua PR có check xanh. Commit theo Conventional Commits.

## Rào của kho

- **Hook git** `.githooks/` (nối khi `npm install`): `pre-commit` chặn commit trên `main` và quét bí mật bằng gitleaks
  (cần `brew install gitleaks`); `pre-push` chạy kiểm kiểu + lint. Không dùng `--no-verify` — quyền của Claude Code cấm.
- **Claude Code** `.claude/`: hook chặn sửa migration đã commit và ghi `.env*`; hook cuối lượt kiểm kiểu + lint tệp vừa
  đổi; luật theo đường dẫn ở `.claude/rules/`; skill `/verify`, `/new-migration`. Cài đặt nạp lúc mở phiên — đổi
  `.claude/settings.json` thì mở phiên mới.
- **CI**: check bắt buộc duy nhất là `ci-ok`, xanh khi `check`, `isolation`, `secrets`, `gate`, `ro-ri` cùng xanh.
- **Cổng nghiệm thu** (Acceptance-Gate Kit, `_acceptance/config.yaml`): đổi code ngoài T1 phải kèm hồ sơ
  `_acceptance/<slug>/`, T2/T3 phải có người ký; T3 là cơ sở dữ liệu, trần lớp dữ liệu, thoả thuận, `packages/connect`
  và các rào. Tính năng mới đi `/feature-loop:feature-loop`. Job `gate` lấy kit theo tag `KIT_TAG` trong `ci.yml`
  (đang `v2.39.0`) — nâng kit là đổi dòng đó bằng PR riêng. Kho bật thêm: phản biện context sạch bắt buộc
  (`gap_probe: required`); hồ sơ mới phải thuộc một hàng lộ trình (`lo_trinh.chan`); máy tự định tuyến mục ngoài hợp
  đồng ở hồ sơ T2 sạch (`feature_loop.ngoai_n_tu_dinh_tuyen`).
- **Gộp tệp sinh**: `.gitattributes` gắn driver `tep-sinh` cho `PRODUCT-MAP.md` và `LO-TRINH.html` — gộp nhánh chính vào
  nhánh việc giữ bản của nhánh đang đứng, không dừng xung đột; vẽ lại rồi commit, CI `--check` bắt bản vẽ sai. Driver bật
  ở mỗi bản clone khi `npm install` (script `prepare`); trên web GitHub PR vẫn báo xung đột ở hai tệp này — gộp tại máy.
- Mỗi rào có bài tự kiểm: `npm run test:hooks` phải ra `TỔNG: ĐẠT`.

## Lệnh

```bash
npm install
npm run typecheck && npm run lint && npm test && npm run test:hooks && npm run build

# Postgres local cho bộ kiểm cách ly (dự án riêng, cổng 5544)
docker run --rm -d --name quy-hang-db -e POSTGRES_PASSWORD=quyhang -p 5544:5432 postgres:16
export DATABASE_URL=postgres://postgres:quyhang@localhost:5544/postgres
npm run db:migrate && npm run db:test

npm run dev   # http://localhost:3460 · API http://localhost:3460/api/v1/health
```
