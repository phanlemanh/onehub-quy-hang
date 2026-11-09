# Vá khuôn v2: mốc đo tương lai, tên miền, phút múi giờ — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gói có mốc đo tương lai quá một giờ, tên miền đuôi lạ, hay mốc đo cơ sở dữ liệu không nhận bị từ chối đúng lỗi khuôn; khu không bị đóng băng.

**Architecture:** Chỉ sửa `packages/connect/src/catalog-feed.ts`. `parseCatalogFeed` nhận thêm giờ làm tham số và gắn lượt kiểm mốc tương lai sau khuôn. Hai đường vào gọi `parseCatalogFeed(raw)` như cũ nên không đổi.

**Tech Stack:** TypeScript chặt, zod 3.25, `node:test` + tsx, Postgres 16 cho bộ cửa nhận.

**Spec:** `docs/superpowers/specs/2026-11-09-va-khuon-v2-moc-tuong-lai-design.md` · `_acceptance/va-khuon-v2-moc-tuong-lai/contract.md` · `evals.yaml`. Câu chốt từng ca nằm ở `expected`; tên ca phải trùng nguyên văn.

## Global Constraints

- Cổng Phạm vi duyệt 10/11: dung sai 1 giờ, đúng biên được nhận · ba mẫu tên miền · kiểm trong khuôn, giờ là tham số.
- Không đổi hình khuôn, không migration, không đổi phản hồi, không sửa `feeds*.ts`.
- Lưới tên miền chỉ áp cho v2. Lưới mốc đo tương lai và `MocDo` áp cho cả v1, v2.
- Khoá máy cấp `subdivisionKey`, `buildingKey`, `upi` miễn mẫu đuôi bất kỳ.
- Không dữ liệu cá nhân thật. Mốc đo trong đồ thử phải ở quá khứ so với lúc chạy, trừ ô cố ý tương lai.

## Review Focus

- Mốc đúng biên viết ở múi giờ khác → so theo thời điểm, không theo chuỗi (Việc 1, ca «mốc tương lai: so theo thời điểm»).
- Mốc `+0700` không hai chấm, phần lẻ 9 chữ số → tính đúng thời điểm; mốc không đọc ra thời điểm thì từ chối, không lọt (Việc 1, cùng ca).
- Gói vừa sai khuôn nhẹ vừa có mốc tương lai → trả đủ cả hai lỗi, không ném (Việc 1, ca «mốc tương lai: cùng lỗi khác»).
- Địa danh chữ thường có dấu như `q.thủ đức`, `Phường.an phú` → nhận, vì nhãn hoặc đuôi không toàn ASCII (Việc 1, ca «tên miền: chữ thường có dấu tiếng Việt»).
- Đuôi `.io`, `.co` bỏ khỏi danh sách cứng → viết thường ở trường chữ vẫn bị từ chối (Việc 1, ca «tên miền: đuôi bỏ khỏi danh sách cứng»).

---

### Việc 1: Khuôn và bộ kiểm khuôn

`independent: false` (Việc 2 dùng) · Phục vụ **E1, E3, E4, E5, E7**

**Files:** Modify `packages/connect/src/catalog-feed.ts` · Create `packages/connect/src/catalog-feed-va.test.ts`

**Interfaces — Produces:** `CATALOG_FEED_FUTURE_TOLERANCE_MS = 3_600_000`; `parseCatalogFeed(raw: unknown, opts?: { now?: Date })`, mặc định `new Date()`, kiểu trả không đổi.

Giá trị máy không tự suy được:

- `MocDo`: giữ trần ±15:59 và năm 0001, thêm phút múi giờ < 60 và phần lẻ giây tối đa 9 chữ số, trong cùng một `refine` để mỗi mốc sai đúng một lỗi, giữ thông điệp «Mốc đo…».
- Mốc tương lai: `(v === 2 ? CatalogFeedV2 : CatalogFeed).superRefine(...)` viết hai nhánh cho đúng kiểu. Hàm `kiemTuongLai` thêm một lỗi cho mỗi mốc có `!(Date.parse(m) <= tran)`, viết phủ định để `NaN` rơi về từ chối; đường khoá `["measuredAt"]`, `["marketStats", i, "measuredAt"]`, `["publicListings", i, "measuredAt"]`; thông điệp có «tương lai».
- `DANG_CAM`: thay mẫu tên miền cũ bằng `/\b[a-z0-9-]+\.(?:com|net|org|vn|info|biz|asia|xyz)(?:\.[a-z]{2})?\b/i` và `/\b(?:zalo|fb|m|t)\.me\b/i`.
- Đuôi bất kỳ, chỉ khi khoá không thuộc `KHOA_MA_MAY`: `/(?<![\p{L}\p{N}_])(?=[0-9-]*[a-z])[a-z0-9-]+\.[a-z]{2,24}(?![\p{L}\p{N}_])/u`, tên dáng «tên miền». Ranh giới theo mọi chữ cái thay `\b`, vì `\b` coi chữ có dấu là ranh giới và bắt nhầm `q.thủ`, trái câu «cả nhãn lẫn đuôi đều chữ thường ASCII» của thiết kế.

- [ ] Viết các ca, thấy đỏ: `npm test -w @quy-hang/connect`. Ca: «mốc tương lai: ma trận», «mốc tương lai: so theo thời điểm», «mốc tương lai: cùng lỗi khác» (E1) · «tên miền: đuôi bất kỳ», «tên miền: địa danh viết thường là giá đã duyệt», «tên miền: chữ thường có dấu tiếng Việt», «tên miền: đuôi bỏ khỏi danh sách cứng» (E3) · «tên miền: chuỗi sạch có dấu chấm», «tên miền: khoá máy cấp có dấu chấm» (E4) · «mốc đo cơ sở dữ liệu không nhận: phút và phần lẻ» (E5). Chiều đỏ của E3 làm như ca «cấm: giá trị trong mọi chuỗi» của `catalog-feed-v2.test.ts`: bản sao hàm đọc lọc bỏ lỗi có «Giá trị có dáng», mọi ô phải đỏ và nêu đường.
- [ ] Sửa khuôn. Chạy lại `npm test -w @quy-hang/connect`, toàn bộ xanh gồm «gói mẫu: sinh từ khuôn, khớp tệp» (E7). `npm run typecheck`.
- [ ] Commit `fix(connect): từ chối mốc đo tương lai, tên miền đuôi lạ, mốc đo cơ sở dữ liệu không nhận`.

### Việc 2: Cửa nhận và tài liệu

`independent: false` (cần Việc 1) · Phục vụ **E2, E6**

**Files:** Create `packages/api/test-db/khuon-v2/va-moc.test.ts` · Modify `docs/adr/0015-*.md`, `docs/product/tham-chieu.md`

**Interfaces — Consumes:** `goiV2`, `khuCua`, `chup`, `soDong`, `donDepV2`, `sanCoToken`, `goi`, `dongNhatKy`, `FEED` từ `./chung`. Mảng `DUONG` như `tat-thoa-thuan.test.ts`.

- [ ] Viết ca «từ chối: khu không đổi» (E2), «mốc đo lạ: 422 không phải 500», «mốc đo biên ghi được» (E6). Gói đúng sau đó dùng mốc `2026-11-09T10:00:00+07:00`, mới hơn gói mẫu và ở quá khứ. Mốc biên phần lẻ dùng `.123456789`.
- [ ] Chạy: dựng Postgres sạch ở cổng 5573, rồi lệnh `executors.test.khuon_v2_db`. Xanh gồm `nhan-goi.test.ts`.
- [ ] ADR-0015 thêm mục «Sửa đổi 10/11: vá khuôn v2»; Tham chiếu §12 thêm một dòng 10/11, nêu ba luật và giá «địa danh viết toàn chữ thường bị từ chối».
- [ ] `npm run typecheck && npm run lint`. Commit `test(api): cửa nhận từ chối mốc đo tương lai và mốc lạ, cập nhật ADR-0015`.
