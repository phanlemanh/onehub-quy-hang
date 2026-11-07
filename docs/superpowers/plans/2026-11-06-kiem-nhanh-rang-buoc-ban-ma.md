# Kiểm nhanh thêm vế ràng buộc bản mã — kế hoạch

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Kiểm nhanh trên bản thật làm đỏ khi bảng chủ nhà hay bảng lead sạch số rõ mà ràng buộc bản mã chưa bật.

**Architecture:** Mở rộng `soi`/`xet` của `packages/db/scripts/kiem-nhanh.mjs` hiện có; tách phần dựng mã thoát và dòng
báo (`ketQuaCli`) thành hàm thuần để bài kiểm đo nhánh đỏ. Không đổi `ci.yml`.

**Tech Stack:** Node 24, `pg`, `node:test`.

**Spec:** `docs/superpowers/specs/2026-11-06-kiem-nhanh-rang-buoc-ban-ma-design.md` · hợp đồng
`_acceptance/kiem-nhanh-rang-buoc-ban-ma/contract.md`

## Global Constraints

- Chỉ đếm `count(*) … where owner_phone is not null`; không câu nào trả cột `owner_phone`.
- Một kết nối, giao dịch read only; không chạy gì lên bản thật từ máy.
- Bài chạy trên Postgres dãy Q: `DATABASE_URL=postgres://postgres:quyhang@localhost:5577/postgres`.

## Review Focus

1. Ràng buộc vắng → `convalidated` null, không được coi là «chưa bật» (vế riêng «thiếu ràng buộc»).
2. `count(*)` của pg trả chuỗi — ép số trước khi so.
3. Vai chịu luật theo dòng → báo lỗi vai, KHÔNG suy «bảng sạch».
4. Dòng xanh của CLI phải nêu cả hai bảng theo thứ tự cố định.
5. Ca hiện có của hàng va-deploy-csdl-tam (ma trận 24 dòng, một kết nối) vẫn xanh.

---

### Task 1: Kiểm nhanh thêm vế ràng buộc bản mã (E1–E6) — independent: false

**Files:** Modify `packages/db/scripts/kiem-nhanh.mjs`, `packages/db/tests/kiem-nhanh.test.mjs`

**Interfaces — Produces:**
- Ảnh vào `xet` thêm: `banMa: { bang, rangBuoc, conSo: number, bat: boolean | null }[]` và
  `vaiKetNoi: { ten, thayHet: boolean }`.
- Vế lỗi mới: «bảng sạch mà ràng buộc chưa bật», «ràng buộc bật mà còn số rõ», «thiếu ràng buộc»,
  «vai kết nối chịu luật theo dòng — không đếm được số rõ» (khi vai chịu luật thì bỏ ba vế kia).
- `dongBanMa(banMa) → string` — «ràng buộc bản mã: listing_owners bật · leads còn 2 số rõ (chưa bật — chờ mã hoá lại)».
- `ketQuaCli({ loi, soBang, banMa }) → { ma: 0 | 1, dong: string[] }`.

- [ ] Viết bài: ma trận 12 dòng (bảng × số rõ {0,3} × ràng buộc {bật, chưa bật, vắng}) + 2 dòng vai; ca Postgres gỡ
  và dựng lại ràng buộc not valid (cả hai bảng) → lỗi + `ketQuaCli` mã 1, validate lại → mã 0; ca cấy một dòng số rõ
  (khoá ngoài tắt bằng `set local session_replication_role = replica`) → 0 lỗi, báo «còn 1 số rõ»; ca drop ràng buộc
  leads → «thiếu ràng buộc»; ca `set local role quy_hang_app` → lỗi vai, không lỗi bảng sạch; ca bọc client ghi
  `result.fields` → mọi câu chạm hai bảng trả một cột int8, đối chứng đỏ hai cột; ca tiến trình con CLI → mã 0 và
  stdout chứa «ràng buộc bản mã: listing_owners bật · leads bật».
- [ ] Chạy → đỏ. Viết code. Chạy → xanh. Phá thử: bỏ nhánh «bảng sạch mà chưa bật» → ma trận đỏ; hoàn lại.
- [ ] `DATABASE_URL=… npm run db:migrate && npm run db:test` xanh; typecheck, lint; commit.
