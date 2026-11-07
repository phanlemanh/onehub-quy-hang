# Kế hoạch thi công — nhap-o-la (hàng 69)

> Thiết kế: `_acceptance/nhap-o-la/design.md` · Hợp đồng: `contract.md` (duyệt 2026-11-06, Hỏi-1, Hỏi-2 theo khuyến nghị) ·
> Eval: `evals.yaml`. Thi công tuần tự trong phiên (các task chung kiểu dữ liệu với nhau).

## Ràng buộc chung

- Vùng: `packages/core/src/import/ai/o-la/**`, `packages/core/src/import/ai/index.ts`, `packages/api/src/imports/ai/{routes,claude,gia,store}.ts`,
  `packages/api/src/imports/ai/cells/**`, `packages/api/src/app.ts` (một khoá deps), `packages/api/test-db/imports/o-la.test.ts`,
  `apps/web/src/lib/nhap/**`, `apps/web/src/app/(app)/imports/**`, `docs/product/tham-chieu.md` (chỉ thêm dòng), `_acceptance/nhap-o-la/**`.
- Không migration, không package-lock, không dữ liệu cá nhân thật. Mọi test dùng khách AI giả.
- Mô hình đường ô lạ: `claude-opus-5-5` (Hỏi-1).

## Task 1 — Lõi ô lạ (phục vụ E1, E2b, E3) · independent: false

Files: `packages/core/src/import/ai/o-la/{goi,quet,kiem,khuon,loi-nhac,index}.ts` + `goi.test.ts`, `kiem.test.ts`; export ở `ai/index.ts`.

- `dungGoiOLa(profile, plan, rows: AppliedRow[]): GoiOLa` — `GoiOLa = {o: OLa[]}`, `OLa = {id, cot, tieuDe, truong, giaTri, lyDoMa}`;
  `id = "<cot>:<băm ngắn chữ>"`; điều kiện: ô `needs_person` `by: "normalize"`, `LOP_COT[cls].moGiaTri`, đích là trường chuẩn,
  `FIELD_CLASS[đích]` ∈ {catalog, shareable_listing}; gộp (cột, chữ đã trim); bỏ ô trúng `detectPersonal`/`looksLikePersonName`;
  trần `MAX_O_LA = 300` theo thứ tự cột rồi dòng. `oCuaLuoi(goi)`: map (cot, chữ) → id.
- `kiemKhuonGoiOLa(v)` khuôn chặt (khoá lạ, ≤ 300, trường lớp nguồn bị từ chối, chữ ≤ 200). `quetGoiOLa(goi)` quét tieuDe, giaTri, lyDoMa.
- `KHUON_O_LA` `{de_xuat:[{id, gia_tri, ly_do}]}`, `LOI_NHAC_O_LA`, `bamLoiNhacOLa()`.
- `kiemDeXuatOLa(goi, v, ctx: {cot → {transform, valueMap}}, today)` → `{deXuat: DeXuatO[], loi: {id|null, lyDo}[]}`; luật dải
  (`docDai`), luật về tay (`giaBaoPhiTuVeTay`), bộ chuẩn hoá ra keep/fixed.
- Verify: `npm test -w @quy-hang/core` — chiều đỏ mỗi ca ghi ở evals.

## Task 2 — Máy chủ (phục vụ E2, E5b, E7, E9) · independent: false

Files: `packages/api/src/imports/ai/cells/routes.ts`, `routes.ts` (gọi đăng ký, tách cửa chung), `claude.ts` (khách ô lạ
`khachOLaClaude`, `khachOLaGia`), `gia.ts` (`GIA_THEO_MO_HINH`, `tinhTien(u, model)`), `app.ts` (`khachOLa?`),
`packages/api/test-db/imports/o-la.test.ts`.

- POST `/api/v1/imports/ai/cells`: cùng thứ tự cửa của `/plan` (phiên → khuôn → vai → thoả thuận → mở lớp → khoá → trần →
  quét) rồi gọi khách, ghi `ai_usage`, `kiemDeXuatOLa` (máy chủ kiểm khuôn, gửi lại cho trình duyệt kiểm nghĩa với ngữ cảnh cột).
- Verify: `executors.script.nhap_tac_tu`.

## Task 3 — Màn (phục vụ E4, E4b, E4c, E5, E6, E7b) · independent: false

Files: `apps/web/src/lib/nhap/o-la.ts` + `o-la.test.ts`, `test-db/o-la.db-test.mts`, `goi-api.ts`, `trang-thai.ts` (khoá
`oLa` trong trạng thái), `apps/web/src/app/(app)/imports/new/{man-nhap,bang}.tsx`.

- `canHoiOLa`, `hoiOLa` (nhớ theo băm gói), `deXuatHien(state)` (ô lưới → đề xuất còn hiệu lực), `dungDeXuat` = `suaO` + đánh
  dấu đã dùng, sửa tay tắt đề xuất của ô. Khối đề xuất trong ô của `BangXemTruoc`; dòng `TrangThai` chờ / «Sửa tay lần này».
- Verify: `npm test -w @quy-hang/web`, `npm run typecheck`, `npm run lint`, ảnh 1440/375.

## Task 4 — Bộ ô lạ và số đo (phục vụ E1b, E8) · independent: false

Files: `_acceptance/nhap-o-la/thu/{bo-o-la,do-o-la,lap-de-xuat}.ts`, `de-xuat-o-la/{claude-opus-5-5,claude-haiku-5-5}.json`,
`so-do-o-la.json`, `packages/core/src/import/ai/o-la/do-o-la.test.ts`, `packages/api/src/imports/ai/cells/{goi,quet}.ro-ri.test.ts`.

- Bộ ≥ 8 ô mỗi nhóm + ≥ 4 đối chứng; hai bộ đề xuất do tác tử context sạch (Opus, Haiku) lập trên gói + lời nhắc; số đo năm số.
- Verify: `npm test -w @quy-hang/core`, `npm run test:ro-ri`.

## Task 5 — Tham chiếu và bản đồ

- Một dòng Sổ quyết định ở `docs/product/tham-chieu.md`; vẽ lại bản đồ.
