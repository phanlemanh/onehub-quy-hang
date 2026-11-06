---
schema_version: 1
feature: "Bộ đọc địa chỉ nhận ra phường khi người gõ thiếu một phần dấu (ví dụ «Phường Tan Định», «Phường Đong Ba») mà không dựng lại lỗi khớp nhầm tên giữa tỉnh (Tân Định ↔ Tân Dĩnh)"
slug: doc-xa-thieu-mot-phan-dau
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [sdk]
status: implemented
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-11-06T15:06:53Z
design_doc: docs/superpowers/specs/2026-11-06-doc-xa-thieu-mot-phan-dau-design.md
---

# Acceptance Contract: doc-xa-thieu-mot-phan-dau

## Context

Ngoài-1 của hàng danh-muc-xa-day-du: người gõ có chữ mũ/móc/đ ở một chữ nhưng thiếu ở chữ khác thì bộ đọc không ra xã
và báo «chưa có trong danh mục». Chủ kho chọn mở hợp đồng mới ở Cổng Bằng chứng 06/11. Làm trước hàng 76 vì 76 lưu khoá
địa chỉ. Bất biến chạm: không (lõi thuần, dữ liệu công).

Source input: `docs/plan/lo-trinh.json` hàng doc-xa-thieu-mot-phan-dau · `_acceptance/doc-xa-thieu-mot-phan-dau/opportunity.md` ·
`_acceptance/danh-muc-xa-day-du/review-findings.md` (Ngoài-1) · `_acceptance/danh-muc-xa-day-du/decisions.jsonl`
(d-20261106T043914Z-19, d-20261106T070204Z-21) · `packages/core/src/address/doc-dia-chi-loi.ts`.

Từ dùng trong tiêu chí: **chữ mũ/móc/đ** là â ă ê ô ơ ư đ; **dạng thiếu** của một tên là tên ấy giữ nguyên chữ mũ/móc/đ
đầu tiên, các chữ mũ/móc/đ còn lại đổi về chữ gốc (â ă → a, ê → e, ô ơ → o, ư → u, đ → d), dấu thanh giữ nguyên.

## Criteria

- AC-1: Given ma trận viết trước — mỗi tỉnh trong 34 tỉnh một xã mới: loại các xã có xã khác cùng tỉnh cùng dạng bỏ dấu,
  rồi lấy mã nhỏ nhất trong các xã có từ hai chữ mũ/móc/đ — When đọc «12 Đường Mẫu 1, <Loại> <dạng thiếu của tên>, <tên
  tỉnh>», Then mọi dòng ra «chuan» với khoá bằng khoá khi đọc tên đủ dấu; và hai ca có tên: «12 Lê Lợi, Phường Tan Định,
  Thành phố Hồ Chí Minh» ra 26737 Tân Định, «12 Lê Lợi, Phường Đong Ba, Thành phố Huế» ra phường
  mới nhận phường cũ Đông Ba (19753 Phú Xuân), kết quả ghi tên cũ Đông Ba.
- AC-2: Given mỗi tỉnh mới một xã cũ (mã cũ nhỏ nhất trong các xã cũ có từ hai chữ mũ/móc/đ, huyện cũ dạng «Quận …» hay
  «Huyện …», đúng một xã mới nhận, không xã cũ nào khác cùng tỉnh cùng huyện cũ cùng dạng bỏ dấu), When đọc «12 Đường Mẫu
  1, <Loại cũ> <dạng thiếu của tên cũ>, <huyện cũ>, <tên tỉnh mới>», Then mọi dòng ra «chuan», xã đọc ra là xã mới nhận,
  kết quả ghi tên cũ.
- AC-3: Given mọi cặp có thứ tự xã mới (A, B) ở hai tỉnh khác nhau có cùng dạng bỏ dấu mà khác chữ mũ/móc/đ (rút từ danh
  mục), chia trước khi chạy theo luật viết sẵn: nhóm «trái» — A có ít nhất một chữ mũ/móc/đ khác chữ của B ở cùng chỗ;
  nhóm «thiếu» — A chỉ khác B ở chỗ A để gốc; When đọc tên A gõ đủ dấu kèm tỉnh của B — cả dạng có «Phường/Xã» đứng trước
  lẫn dạng không có — Then nhóm «trái» không dòng nào ra xã B bằng tên xã mới (đọc qua tên một xã cũ trỏ vào B là đọc đúng; đóng lỗi «Tân Định, Bắc Ninh» khớp «Tân Dĩnh»), nhóm
  «thiếu» ra «chuan» theo luật trong tỉnh B — xã của tỉnh B trùng nguyên văn tên A nếu có, không thì xã B (gõ thiếu dấu
  một tên của tỉnh đã chọn); hai nhóm cộng lại bằng số cặp; đối chứng dương: tên A
  kèm tỉnh của A ra xã A.
- AC-4: Given cặp xã mới cùng tỉnh có cùng dạng bỏ dấu mà khác chữ mũ/móc/đ (rút từ danh mục), When đọc tên đủ dấu của
  từng xã trong cặp, Then ra đúng xã ấy «chuan» (tên trùng nguyên văn thắng); và When đọc dạng chung (giữ chữ mũ/móc/đ
  hai tên trùng ở cùng chỗ, đổi về gốc chỗ khác), Then dạng chung khác cả hai tên ra «cần người chọn» với tập ứng viên
  bằng đúng hai xã ấy, dạng chung trùng nguyên văn một tên ra tên ấy.
- AC-5: Given xã của ma trận AC-1, When đọc tên ấy với một chữ trái danh mục — chữ gốc đầu tiên (a, o, u, e, d) mà danh
  mục để gốc được gõ thành chữ mang mũ/móc/đ — Then không dòng nào ra xã đó; đoạn tên vào «chưa có trong danh mục» khi
  không xã nào khác của tỉnh khớp.
- AC-6: Given tỉnh đã biết, When đoạn không có «Phường», «Xã» đứng trước là dạng thiếu của tên một xã thuộc tỉnh ấy (ma
  trận AC-1 bỏ tiền tố), Then đoạn ấy đọc thành xã đó; còn đoạn trùng tên xã của tỉnh khác vẫn không bị đọc thành xã như
  hàng trước.
- AC-7: Given 86 cách viết của bộ thử hàng 73 và ảnh khoá `anh-truoc-va.json`, When đọc bằng lõi sau vòng này, Then mọi
  cách viết ra đúng số nhà, tên đường, khoá và trạng thái của ảnh; ma trận AC-1 gõ đủ dấu và gõ bỏ hết dấu ra cùng kết quả
  như bộ đọc trước vòng (công tắc `soDau: "giu"`); bộ kiểm của hàng 75, va-duong-so-n và danh-muc-xa-day-du vẫn xanh trong
  cùng lượt.

## Coverage

Quét không gian (skill morphological-scan, preset entity-feature). Chân sản phẩm: Ngoài-1 hàng trước và bộ đọc hiện có
[SUY-TỪ-REPO: _acceptance/danh-muc-xa-day-du/review-findings.md, packages/core/src/address/doc-dia-chi-loi.ts]. Chân
ngành: chuẩn hoá về dạng chính thức nhưng không nới khi chữ người gõ trái dạng chính thức [NGÀNH: design doc §Đối chiếu
ngành].

- Trục A — đơn vị: xã mới | xã cũ. [thước CE: hai chỉ mục tên `xaBo`/`cuBo` của bộ đọc]
- Trục B — cách người gõ dấu: đủ dấu | thiếu một phần | bỏ hết | sai chữ mũ/móc/đ. [thước CE: ba giá trị của `soDau` và một ca sai]
- Trục C — chỗ đứng của tên: có tiền tố «Phường/Xã» | không tiền tố. [thước CE: hai nhánh tìm xã của `docDiaChiVoi`]
- Trục D — kết quả so: một xã | nhiều xã cùng tỉnh | trùng tên khác tỉnh | không xã nào. [thước CE: nhánh của `docXa`]

Core: A(mới)×B(thiếu)×C(tiền tố) ở AC-1 · A(cũ)×B(thiếu) ở AC-2 · D(khác tỉnh)×B(đủ, thiếu)×C(cả hai) ở AC-3 · D(nhiều cùng
tỉnh)×B(đủ, thiếu) ở AC-4 · B(sai) ở AC-5 · C(không tiền tố)×B(thiếu) ở AC-6 · B(đủ, bỏ hết) ở AC-7. Later: sửa lỗi gõ sai chữ (đ thành
d) bằng gợi ý. Never: lui về so bỏ dấu khi giữ chữ không khớp.

## Đường đo

- Thước: gõ thiếu một phần dấu ra đúng phường trong tỉnh đã chọn · số từ: ma trận 34 tỉnh × xã mới và xã cũ · bảo đảm bởi:
  AC-1, AC-2, AC-6
- Thước: hai phường khác tỉnh chỉ khác dấu không khớp nhầm · số từ: mọi cặp khác tỉnh của danh mục · bảo đảm bởi: AC-3, AC-5
- Thước: bộ thử danh mục xã cũ vẫn xanh · số từ: bộ kiểm danh-muc-xa-day-du và ảnh khoá hàng 73 · bảo đảm bởi: AC-7

## Out of scope

- Sửa lỗi gõ sai chữ có mũ/móc/đ (đ thành d, ơ thành â) — chữ trái danh mục vẫn ra «chưa có trong danh mục».
- Lui về so bỏ dấu khi so giữ chữ không khớp — dựng lại lỗi khớp nhầm giữa tỉnh (d-20261106T043914Z-19).
- Suy tỉnh từ tên phường khi người không gõ tỉnh — giữ luật hàng 75 (d-20261105T122556Z-9).
- Đọc tên tỉnh, tên huyện cũ — đã so bỏ dấu, không có lỗi này.

## Notes
