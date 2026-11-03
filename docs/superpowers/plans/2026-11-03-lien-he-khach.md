# Kế hoạch — Liên hệ khách (hàng 86, T3)

Hợp đồng: `_acceptance/lien-he-khach/contract.md` (duyệt Manh Phan 03/11, Hỏi-1..7 theo khuyến nghị). Thiết kế:
`docs/superpowers/specs/2026-11-03-lien-he-khach-design.md`. Tệp ngoài vùng duyệt ở yêu cầu L-1. Migration `021`.
Postgres dãy L: `quy-hang-db-dkn-L`, cổng 5571 (`.env.local`).

Thứ tự tuần tự trong một worktree: các bước dùng chung Postgres của dãy và `packages/core/src/contacts/index.ts`.

## T1 — Lõi nhu cầu khách

- Files: `packages/core/src/contacts/prospects.ts` (mới), `packages/core/src/contacts/index.ts` (xuất lại),
  `packages/core/src/contacts/prospects.test.ts` (mới)
- Làm: `PROSPECT_NEEDS`, `typesForProspectNeed`, `PROSPECT_CRITERIA_KEYS`, `validateProspectInput` (tên, số qua
  `normalizePhone`, need, criteria), `validateProspectPatch` (`ownerMemberUserId`), `PROSPECT_EVENT_TYPES`,
  `PROSPECT_VIEW_KEYS` + `prospectView`.
- Verify: `npm test -w @quy-hang/core` + phá thử (thêm `contactId` vào khoá bản xem → ca đỏ nêu khoá).
- Phục vụ: E1. `independent: false` (T6 thêm ca tài liệu vào cùng tệp kiểm).

## T2 — Lõi Lần gửi

- Files: `packages/core/src/sharing/index.ts`, `packages/core/src/sharing/sharing.test.ts` (mới),
  `packages/core/package.json` (thêm `./sharing`)
- Làm: `SHARE_AUDIENCES`, `MAX_SHARE_LISTINGS = 30`, `validateShareInput`, `newShareCode`, `SHARE_PUBLIC_KEYS` +
  `publicEnvelope`.
- Verify: `npm test -w @quy-hang/core` + phá thử (thêm `prospectId` vào khoá phong bì → ca đỏ).
- Phục vụ: E9, E5 (khuôn). `independent: false` (T4 dùng).

## T3 — Migration 021 + bộ kiểm cách ly

- Files: `packages/db/migrations/021_lien_he_khach.sql` (mới), `packages/db/tests/isolation.test.mjs` (thêm ca)
- Làm: bảng `prospects`, `prospect_events`, `shares`, `share_listings` (enable + force RLS, luật đọc, chỉ `select` cho
  vai API); ràng buộc `enc_context` nhận `prospects:`; hàm `app.open_prospect`, `app.add_prospect_phone`,
  `app.close_prospect`, `app.reassign_prospect`, `app.create_share`; `app.set_contact_types` thêm vế giữ loại khách.
- Verify: `npm run db:migrate && npm run db:test` trên 5571 + phá thử (bỏ điều kiện người giữ ở luật đọc nhu cầu → ca đỏ).
- Phục vụ: E2. `independent: false` (T4 dùng hàm).

## T4 — API nhu cầu khách và Lần gửi

- Files: `packages/api/src/contacts/prospects.ts`, `packages/api/src/contacts/shares.ts` (mới),
  `packages/api/src/contacts/routes.ts` (đăng ký thêm), `packages/api/src/errors.ts` (thêm mã)
- Làm: `POST /api/v1/prospects`, `GET /api/v1/prospects/{id}`, `PATCH /api/v1/prospects/{id}`,
  `POST /api/v1/prospects/{id}/phones`, `POST /api/v1/prospects/{id}/close`, `GET /api/v1/prospects/{id}/shares`,
  `POST /api/v1/shares`. Số → dấu vết + bản mã ngữ cảnh `prospects:<sàn>:<id>`; căn → nấc «Toàn sàn» bằng dữ kiện sự kiện.
- Verify: `npm run typecheck && npm test -w @quy-hang/api`.
- Phục vụ: E3–E8. `independent: false`.

## T5 — Bộ kiểm API trên Postgres

- Files: `packages/api/test-db/lien-he-khach.test.ts` (mới)
- Làm: các ca đúng tên trong `evals.yaml` E3–E8, bảng viết trước, đối chứng dương cho máy dò số.
- Verify: `npm run db:test` + phá thử từng chiều đỏ đã khai (một lần mỗi eval, trên bản sao, hoàn lại).
- Phục vụ: E3–E8. `independent: false`.

## T6 — Tài liệu

- Files: `docs/product/tham-chieu.md` (§4, §12, §15 thêm dòng), `docs/adr/0021-lien-he.md` (mục sửa đổi),
  `docs/product/doi-chieu-nganh.md` (dòng Prospecting), ca «tài liệu khớp lõi» trong `prospects.test.ts`
- Verify: `npm test -w @quy-hang/core` + phá thử (đổi tên một khoá tiêu chí → ca đỏ).
- Phục vụ: E10. `independent: false`.

## Cuối

`npm run typecheck && npm run lint && npm test && npm run test:hooks && npm run build`, `npm run db:migrate && npm run
db:test` xanh; vẽ lại bản đồ; contract → `implemented`; S4.
