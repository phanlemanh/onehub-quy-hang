---
schema_version: 1
feature: "Máy chủ web không sập khi cơ sở dữ liệu cắt một kết nối đang rảnh: mọi bể kết nối gắn trình nghe lỗi, ghi nhật ký rồi bỏ kết nối hỏng; người đang dùng không gặp trang lỗi vì việc này."
slug: va-pool-nghe-loi
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api]
status: implemented
design_doc: docs/superpowers/specs/2026-11-06-va-pool-nghe-loi-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-11-06T05:14:35Z
---

# Acceptance Contract: va-pool-nghe-loi

## Context

Ngoài-3 của hồ sơ `va-pool-ket-noi` (PR #155, sự cố bản thật 06/11): hai `pg.Pool` của mỗi hàm máy chủ không nghe sự kiện
`error`, nên khi pooler cắt một kết nối đang rảnh thì lỗi không bắt được làm sập phiên bản hàm. Chủ kho chọn «mở hợp đồng
mới» ở Cổng Bằng chứng 06/11; giám sát ghi Cổng Đáng «build» theo quyết định ấy (yêu cầu V-1). Gốc và cách làm: design doc.

Source input: hàng `va-pool-nghe-loi` của `docs/plan/lo-trinh.json` · ô cơ hội `_acceptance/va-pool-nghe-loi/opportunity.md`.

## Criteria

- AC-1: Given `dungPools` dựng bộ pool ở nơi chạy «trang» và ở nơi chạy «chan-dau», When đếm trình nghe sự kiện `error`
  trên từng pool, Then cả bốn pool (danh tính và ứng dụng × hai nơi) mỗi pool có đúng một trình nghe.
- AC-2: Given một pool do `dungPools` dựng từ chuỗi kết nối mang mật khẩu, When pool phát `error` (như pg-pool làm khi bỏ
  một kết nối rảnh hỏng), Then lời phát không ném, nhật ký lỗi có đúng một dòng nêu tên pool, nơi chạy, mã lỗi và câu lỗi,
  và dòng ấy không chứa mật khẩu; đối chứng: một pool trần không qua `dungPools` phát `error` thì ném.
- AC-3 (cross-layer): Given chỗ thử Postgres sau công tắc mạng và một tiến trình nạp `dungPools` thật từ
  `apps/web/src/lib/api.ts`, giữ một kết nối đang rảnh, When công tắc cắt mọi kết nối, Then tiến trình không chết và nhật ký
  có đúng một dòng lỗi của pool; When công tắc mở lại, Then truy vấn kế tiếp trên cùng pool chạy được; đối chứng: cùng kịch
  bản với pool trần thì tiến trình chết với mã khác 0.
- AC-4: Given cây sau bản vá, When so với điểm rẽ khỏi nhánh chính, Then mọi tệp đổi nằm trong danh sách cho phép đích danh
  — `apps/web/src/lib/api.ts`, `apps/web/src/lib/api.test.ts`, `_acceptance/va-pool-nghe-loi/**`, design doc và kế hoạch
  của hàng, `docs/plan/lo-trinh.json`, `docs/product/tham-chieu.md`, hai tệp sinh — và `_acceptance/config.yaml` chỉ thêm
  đúng một dòng khoá executor của hồ sơ; khi nhánh đã nằm trong nhánh chính thì ca cây thật tự bỏ qua có ghi lý do.
- AC-5: Given cây sau bản vá, When chạy kiểm kiểu, lint và build, Then đều xanh.
- AC-6 (cross-layer): Given cùng chỗ thử và một tiến trình đã MƯỢN một kết nối từ pool của `dungPools` (giữa hai truy vấn,
  chưa trả), When công tắc cắt mọi kết nối, Then tiến trình không chết; truy vấn kế tiếp trên kết nối đã mượn nhận lỗi của
  chính nó; sau khi trả kết nối và mở công tắc, truy vấn mới trên pool chạy được; đối chứng: cùng kịch bản với pool trần thì
  tiến trình chết với mã khác 0.
- AC-7: Given mã chạy của `apps/web/src` và `packages/api/src` (trừ bài kiểm), When tìm mọi chỗ dựng `Pool`/`Client` của pg,
  Then chỗ duy nhất là `dungPools` trong `apps/web/src/lib/api.ts` — không bể kết nối nào của máy chủ web nằm ngoài lưới nghe lỗi.

## Coverage

Liệt kê tay hai trục (descope «bỏ coverage-scan» trong sổ quyết định):

- Trục A — pool × nơi chạy: danh tính·trang · ứng dụng·trang · danh tính·chan-dau · ứng dụng·chan-dau [thước CE: `dungPools`
  dựng đúng hai pool mỗi lời gọi, `getApi` chỉ có hai nơi chạy]
- Trục B — kết nối bị cắt: RẢNH trong pool (pool phát `error`) · ĐÃ MƯỢN, giữa hai truy vấn (chính kết nối phát `error`;
  pg-pool 3.14 `_acquireClient` gỡ trình nghe rảnh lúc cho mượn) · ĐANG CHẠY truy vấn (lỗi về chính lời gọi, đi đường 5xx
  sẵn có) [thước CE: `node_modules/pg-pool/index.js` — `makeIdleListener` và `_acquireClient`]
- Trục C — nơi dựng pool trong máy chủ web: chỉ `dungPools` [thước CE: bài quét AC-7]
- Core: A toàn bộ ở AC-1, AC-2; B rảnh ở AC-2, AC-3, đã mượn ở AC-6, đang chạy giữ đường cũ (không AC mới); C ở AC-7.
- Later: thử lại tự động khi kết nối đang dùng hỏng; số đo đếm lỗi pool.
- Never: nuốt lỗi của lời gọi đang dùng — lời gọi phải nhận lỗi của chính nó.

## Đường đo

- Ngưỡng «tiến trình không sập» · số từ: mã thoát của tiến trình con ở E3, E8 · bảo đảm bởi: AC-3, AC-6
- Ngưỡng «nhật ký có một dòng lỗi» · số từ: đếm dòng nhật ký của pool sau cú cắt ở E3 (đúng 1 cho 1 kết nối rảnh) · bảo đảm bởi: AC-3
- Ngưỡng «lời gọi sau vẫn chạy» · số từ: kết quả `select 1` sau khi mở lại ở E3, E8 · bảo đảm bởi: AC-3, AC-6
- Ngưỡng «bài kiểm phủ cả hai bể» · số từ: ma trận bốn pool của E1, E2 · bảo đảm bởi: AC-1, AC-2

## Out of scope

- Thử lại tự động, đóng/dựng lại pool khi lỗi.
- Pool và kết nối của `packages/db` (migrate, nạp mẫu, bộ kiểm cách ly) — chạy ngắn, không phải máy chủ web.
- Pooler chế độ giao dịch — hàng `pooler-che-do-giao-dich`.

## Notes

- Kết nối đã mượn: `dungPools` gắn thêm một trình chặn lặng trên từng kết nối mới (sự kiện `connect` của pool) — không ghi nhật ký (lỗi về lời gọi kế tiếp trên kết nối ấy), chỉ ngăn lỗi thành lỗi không bắt được; kết nối rảnh vẫn chỉ ghi một dòng qua trình nghe của pool.
- Chạm tệp: `apps/web/src/lib/api.ts`, `apps/web/src/lib/api.test.ts`, `_acceptance/config.yaml` (khoá `va_pool_nghe_loi`),
  `docs/product/tham-chieu.md` (một dòng Sổ quyết định).
- Bài thử thật dùng lại chỗ thử `_acceptance/va-pool-ket-noi/thu/dung-su-co.mjs` (chỉ đọc, không sửa).
