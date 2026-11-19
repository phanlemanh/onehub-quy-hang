# Kế hoạch: chuyen-cho-delivery-loop-3-0

Hồ sơ `_acceptance/chuyen-cho-delivery-loop-3-0/` · thiết kế `docs/superpowers/specs/2026-11-19-chuyen-cho-delivery-loop-3-0-design.md`.
Mọi task tuần tự (`independent: false`) — task sau đọc vật task trước. Kit của mọi lệnh: bản cài `delivery-loop` 3.0.0.

## T1 — Năm phần của việc chuyển chợ

- Files: `.claude/settings.json`, `.github/workflows/ci.yml`, `.github/workflows/ghim-lai-ban-that.yml`,
  `packages/ui-lint/tim-kit.mjs`, `AGENTS.md`, `_acceptance/config.yaml` (chú thích `dieu_phoi`), `docs/README.md`,
  `docs/tri-thuc/TRI-THUC.md`, `docs/plan/lo-trinh.json` (chú thích), bốn `docs/plan/dot-*/README.md`,
  `docs/product/tham-chieu.md` (dòng 19/11 của §12).
- Cách: `git apply` bản vá của `chuyen-kho.mjs --soan` (K1–K3), rồi sửa tay: dòng 86 của `ghim-lai-ban-that.yml` sang
  `$CLAUDE_PLUGIN_ROOT/../feature-loop/`, khoá sổ cài của `tim-kit.mjs`, thẻ và tên kit ở `AGENTS.md`, tên lệnh mới (K5).
- Verify: `chuyen-kho.mjs --kho .` in ĐẠT cho K1–K5; ca AC-1..AC-5 của `thu/chuyen-cho.test.mjs` xanh.
- Phục vụ: E1–E5.

## T2 — Sửa phép đo của hồ sơ cũ đọc vật vừa đổi

- Files: đúng các tệp đo liệt ở mục «Ghim lại — kết quả» của hợp đồng.
- Cách: chỉ đổi chỗ phép đo đọc vật vừa đổi (thẻ, kho kit, đường lõi, bố cục `feature-loop`), giữ nguyên ca và đối
  chứng của nó; như tiền lệ `eaa7d540`.
- Verify: lệnh eval của từng hồ sơ ấy thoát 0 trên cây sửa; cùng lệnh trên nhánh chính chưa sửa đối chiếu được.
- Phục vụ: E7.

## T3 — Khai lệnh đo của vòng, vẽ lại tệp sinh

- Files: `_acceptance/config.yaml` (`executors.script.cc30_thu`, `executors.script.cc30_doi_chung`), `LO-TRINH.html`,
  `PRODUCT-MAP.md`, bài đo trong hồ sơ.
- Verify: `node --test _acceptance/chuyen-cho-delivery-loop-3-0/thu/*.test.mjs` xanh (trừ E7 trước T4);
  `product-map.mjs --check` của kit 3.0.0 xanh; `npm run typecheck && npm run lint`.
- Phục vụ: E6, E6b, E8, E8b.

## T4 — Ghim lại

- Sau khi T1–T3 commit: một lượt `repin-lane.mjs --write` của kit 3.0.0 cho các hồ sơ ở T2, tại HEAD sạch.
- Verify: làn xanh, `recheck-evidence.cjs` tự kiểm xanh; ca AC-7 xanh.
- Phục vụ: E7.

## Sau T4

Hợp đồng sang `implemented`, chấm S4 bằng workflow `acceptance-verify.js` của kit 3.0.0. Trước khi trình Cổng Bằng chứng:
phép thử phiên thật `chuyen-kho.mjs --phien` trên nhánh.
