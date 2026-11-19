# Chuyển kit nghiệm thu sang chợ delivery-loop v3.0.0 — thiết kế

Hồ sơ: `_acceptance/chuyen-cho-delivery-loop-3-0/` · hạng T3 · ngày 19/11/2026.

## 1. Vì sao

Từ 18/11 nguồn của kit là kho `phanlemanh/delivery-loop` (thẻ `v3.0.0`); kho cũ `phanlemanh/acceptance-gate-kit` đóng
băng ở `v2.39.0` và sẽ lưu trữ. Kho này còn kéo kit cũ ở hai chỗ: job `gate` của CI và luồng «Ghim lại hồ sơ cần bản
thật»; phiên Claude Code còn bật sáu plugin của chợ cũ. Cài chợ mới lên máy không tự chuyển kho: nó chỉ thêm sáu plugin
mới cạnh plugin cũ, và phiên nào mở trong kho vẫn nạp bản cũ. Đây là chặng II.2 của «chuyển nhà giai đoạn 2» (chủ kho
duyệt kế hoạch 19/11); Inventory đã chuyển bằng commit cài `47d52b06` và là mẫu của vòng này.

Luật của chặng: một vòng, một PR, mốc cài `v3.0.0`, **không ghép chuyển chợ với đổi hành vi nào**.

Đối chiếu ngành (ADR-0022, `.claude/rules/thiet-ke-doi-chieu.md`): không áp — vòng không có năng lực hay đối tượng sản
phẩm nào, không danh sách nào thành dữ liệu của sàn; chỉ đổi nguồn của công cụ nghiệm thu.

## 2. Năm phần của PR

| Phần | Tệp | Đổi gì |
|---|---|---|
| Phía CI | `.github/workflows/ci.yml`, `.github/workflows/ghim-lai-ban-that.yml` | kéo `phanlemanh/delivery-loop`, `KIT_TAG: v3.0.0`, `CLAUDE_PLUGIN_ROOT=$RUNNER_TEMP/kit/plugins/acceptance-gate` (kit 3.0 đặt lõi ở `plugins/acceptance-gate`) |
| Phía phiên | `.claude/settings.json` | chợ `delivery-loop` ghim `ref: v3.0.0`, sáu plugin `<tên>@delivery-loop: true` |
| Tắt đích danh | `.claude/settings.json` | sáu khoá `<tên cũ>@acceptance-gate-kit: false` |
| Quét tên cũ | `packages/ui-lint/tim-kit.mjs`, `AGENTS.md`, `_acceptance/config.yaml` (một chú thích), bốn README gói đợt, `docs/README.md`, `docs/tri-thuc/TRI-THUC.md`, `docs/plan/lo-trinh.json` (chú thích), `docs/product/tham-chieu.md` (dòng 19/11 của §12) | tên lệnh mới; `tim-kit.mjs` đọc mục `acceptance-gate@delivery-loop` của sổ cài; Tham chiếu ghi việc chuyển nguồn kit |
| Ghim lại | `_acceptance/<hồ sơ>/run-log.jsonl`, `evidence-report.md` | xem mục 4 |

`LO-TRINH.html` vẽ lại vì `lo-trinh.json` đổi (một chú thích + hàng của vòng); `PRODUCT-MAP.md` vẽ lại khi hồ sơ ký.

Bản vá phần chung (ba tệp đầu) lấy nguyên từ công cụ kiểm chuyển kho (`chuyen-kho.mjs --soan`, kit giữ đợt); phần tìm kit
và quét tên sửa tay theo chỗ công cụ nêu (K4, K5).

### Vì sao sáu dòng `false`, không xoá khoá

Khoá vắng ở mức kho thì mức người dùng thắng: máy còn bật chợ cũ ở `~/.claude/settings.json` sẽ nạp lại sáu plugin cũ cạnh
sáu plugin mới (đo ở Inventory 18/11: chín bản kit cùng nạp). Khoá `false` ở mức kho thắng `true` mức người dùng — đo ở
Inventory 18/11: sáu bản `@delivery-loop` 3.0.0, không bản cũ nào, không lỗi nạp. Ba khoá `dieu-phoi`, `road-map`,
`tri-thuc` tắt cả khi máy không cài — khoá cho plugin không cài không gây lỗi nạp (đo cùng lượt).

### Vì sao `tim-kit.mjs` thuộc vòng này

Năm lệnh executor của kho (`san_m1`, `design_floor`, `product_map_kit`, `design.floor`, `design.khuon`) và năm bài đo của
hồ sơ cũ tìm kit qua `tim-kit.mjs` khi tác tử chấm không có `CLAUDE_PLUGIN_ROOT`. Tệp đọc đích danh khoá
`acceptance-gate@acceptance-gate-kit` của sổ cài; sau khi máy gỡ chợ cũ nó im lặng không in gì và các lệnh ấy đỏ. Đổi khoá
là một dòng; hàm chọn bản cài (`chonBanCai`) không đổi. `installPath` của bản cài 3.0 trỏ thẳng thư mục plugin
(`…/delivery-loop/acceptance-gate/3.0.0`), có `scripts/` như bản cũ — nên `$R/scripts/…` của các lệnh giữ nguyên nghĩa.

## 3. Không đổi hành vi — đo thế nào

- Kit 3.0.0 so với 2.39.0 trên nhánh chính chưa sửa (`f1d123ee`), `--recheck-all`: cả hai 172 OK, 0 VIOLATION, cùng tập
  hồ sơ (đo trước Cổng Phạm vi).
- Kit 3.0.0 trên bản sửa, `--recheck-all`: 172 OK giống nhau; dòng VIOLATION duy nhất là `[PR]` đòi hồ sơ cho
  `t3_paths` — chính là hồ sơ này.
- `product-map --check` của 2.39.0 và 3.0.0 cùng xanh trên nhánh chính.
- Diff chỉ chạm tệp của bảng mục 2, tệp vẽ lại, và tệp của hồ sơ này cùng các hồ sơ ghim lại.

## 4. Ghim lại

Ứng viên: mọi hồ sơ mà phép đo đọc vật vừa đổi — hai luồng CI, `tim-kit.mjs`, `AGENTS.md`, `lo-trinh.json`/`LO-TRINH.html`,
`docs/README.md` (36 hồ sơ, 35 `signed-off`, 1 `machine-cleared`). Làn ghim lại của kit 3.0.0 chạy khô (`--tung-ho-so`,
không `--write`) trên bản sửa để biết hồ sơ nào đỏ, và trên nhánh chính — bằng đúng kit CI đang dùng (`v2.39.0`, đặt
`CLAUDE_PLUGIN_ROOT`, không qua `tim-kit.mjs` vì sổ cài của máy chỉ có bản 2.38.1) — để tách đỏ có từ trước. Bốn nhánh:

| Bản sửa | Nhánh chính | Làm gì |
|---|---|---|
| đỏ | xanh | sửa phép đo đúng chỗ đọc vật vừa đổi rồi ghim lại bằng làn máy, giữ chữ ký — **Hỏi-1** (như tiền lệ `eaa7d540`) |
| đỏ | đỏ | nợ có từ trước vòng: để nguyên, liệt tên — **Hỏi-2** |
| xanh | đỏ | việc chuyển chợ vô tình chữa một đỏ cũ: liệt tên, không ghim |
| xanh | xanh | không ghim (ghim không đổi phán quyết nào, chỉ thêm bản ghi) |
| đỏ vì đo diff của nhánh | xanh | eval so diff hay lưới PR với nhánh chính (`ranh-gioi.mjs`, `pham-vi.mjs`, `--luoi`): đỏ trên mọi nhánh có thay đổi. Chứng bằng bản sau gộp giả — bản sao của HEAD có `origin/main` trỏ về HEAD — chạy lại đúng các eval ấy phải xanh; liệt tên, không ghim |

Đo trước Cổng Phạm vi: 2 hồ sơ phải sửa và ghim · 7 đo diff của nhánh · 23 đỏ cả hai bên (cùng eval) · 4 xanh cả hai · 0 xanh-sửa đỏ-chính.
Phân loại cuối chạy lại trên HEAD sau khi sửa xong (cùng 36 ứng viên, `--tung-ho-so`, cộng bản sau gộp giả), kết quả ghi
`_acceptance/chuyen-cho-delivery-loop-3-0/evidence/phan-loai-ghim.json` kèm `sha`; E7 đối chiếu hợp đồng với tệp ấy.
Kết quả đo: mục «Ghim lại — kết quả» của hợp đồng.

## 5. Ngoài vòng

- Phép thử phiên thật (K6: phiên nạp đủ sáu plugin 3.0, 0 plugin chợ cũ) — máy chạy trên nhánh trước khi gộp và trên
  nhánh chính sau khi gộp bằng `chuyen-kho.mjs --phien`; không phải eval vì tốn một lượt gọi model và chỉ đo được máy
  đang chạy.
- Cài đặt mức người dùng, gỡ chợ cũ khỏi máy — việc của người trên từng máy (II.4).
- PR #192 (đứng từ 08/11) — không chạm.
- Không đổi lệnh, cờ hay luật nào kit 3.0 mới có (không bật khoá mới).
