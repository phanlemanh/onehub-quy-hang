---
schema_version: 1
feature: Chủ sản phẩm duyệt Cổng Phạm vi của một vòng chạm ô chưa có khuôn trên trang so ba lối — Trong kho, ReUI, Vẽ mới — dựng bằng lệnh, cùng khổ 1440 và 375, mỗi lối một câu đánh đổi, lời khuyên ghim trên trang; vòng có ô chưa có khuôn mà bỏ bước phân kỳ thì bài chấm đỏ, vòng chỉ đi khuôn sẵn thì không cần trang
slug: the-ba-loi
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [lint, docs]
status: signed-off
design_doc: docs/superpowers/specs/2026-11-01-the-ba-loi-design.md
approved_by: Manh Phan
approved_at: 2026-11-01
---

# Acceptance Contract: the-ba-loi

## Context

Hàng 84 (dãy G), CK1 của bản phạm vi cổng chọn khối; ADR-0019 quyết định 1, 2, 5. Cổng Đáng: build (Manh Phan,
`opportunity.md`). Đứng trên hàng 83 (danh mục khối, «Chỗ hở» năm ô). Bộ đối chiếu: `packages/ui-lint/doi-chieu.mjs`;
răng trên cây: `packages/ui-lint/kiem-chuan.mjs` (cuối `npm run lint`). Vật thử: trang ba lối dựng tay của hàng 17
(`_acceptance/cot-ho-so-can/ba-loi/`) và 27 (`_acceptance/lead-bon-nac/ba-loi/`).

Từ ngữ: «ô chưa có khuôn» = so nhánh gốc, vòng thêm nhóm mới ở `design/patterns/`, đổi ô «Khối đích» của một màn ở
`vo-va-ia.md` §2, hay thêm một dòng «Chỗ hở» ở §3. «Đỏ» = lệnh thoát khác 0 với dòng lỗi gọi tên. «Cùng khổ» = ảnh PNG rộng
đúng khổ của nó (1440 hay 375).

## Criteria

**AC-1 — Kế hoạch ba lối.**
Given hồ sơ chưa có thư mục `ba-loi/`
When chạy `doi-chieu.mjs --ba-loi --slug <slug>`
Then lệnh in đúng sáu ảnh phải chụp — `trong-kho`, `reui`, `ve-moi` × 1440, 375, tên `<lối>-<khổ>.png` — và ghi khung
`ba-loi.json`; chạy lại khi khung đã điền thì không đè.

**AC-2 — Dựng trang đủ ba cột.**
Given `ba-loi.json` điền đủ ba lối và sáu ảnh đúng khổ
When chạy `--dung-ba-loi <slug>`
Then `ba-loi/index.html` có lời khuyên ghim đầu trang nêu lối và lý do, ba cột đúng thứ tự Trong kho · ReUI · Vẽ mới, cột
khuyên được đánh dấu, mỗi cột có ảnh 1440 và 375, câu động cơ, câu đánh đổi; ảnh nhúng trong tệp; dựng hai lần ra cùng tệp;
mở ở khổ 1440 và 375, nền sáng và tối, trang không cuộn ngang, ở 375 ba cột xếp một cột, chữ đọc được, lời khuyên thấy ngay.

**AC-3 — Lối không có ứng viên vẫn giữ cột.**
Given một lối khai «không có» kèm điều đã tra
When dựng trang
Then cột ấy vẫn có mặt, ghi «không có» và điều đã tra, không đòi ảnh; lối không khai «không có» mà cũng không có ứng viên
→ đỏ gọi tên lối.

**AC-4 — Trang sai thì đỏ, không ghi trang.**
Given `ba-loi.json` hay ảnh sai một chỗ: thiếu câu động cơ, đánh đổi hay nhãn; thiếu ảnh; ảnh rộng khác khổ; ảnh không phải
PNG; lời khuyên trỏ lối lạ, trỏ lối «không có», hay thiếu lý do; thiếu tên màn
When dựng trang
Then đỏ, mỗi chỗ sai một dòng nêu tên lối (hay «lời khuyên», «màn») và điều sai; không ghi `index.html`.

**AC-5 — Nhận ô chưa có khuôn.**
Given một vòng so nhánh gốc thêm nhóm mới, đổi khối đích của một màn ở §2, hay thêm một dòng «Chỗ hở» ở §3
When chạy `doi-chieu.mjs --kiem-ba-loi --base <ref> --slug <slug>`
Then lệnh in mỗi điều một dòng `ô chưa có khuôn: <loại> <tên>`; đổi cột hay sửa chữ của dòng «Chỗ hở» cũ không tính.

**AC-6 — Ô chưa có khuôn mà bỏ bước phân kỳ thì đỏ.**
Given vòng chạm ô chưa có khuôn
When `design-pass.md` vắng, ghi `divergence: skipped`, hay trang ba lối vắng, sai (AC-4) hoặc sửa tay sau khi dựng
Then `--kiem-ba-loi` đỏ nêu đúng lý do; `divergence: opened` cùng trang hợp lệ thì xanh.

**AC-7 — Vòng chỉ đi khuôn sẵn thì không cần trang.**
Given vòng chỉ sửa màn của nhóm đã có, không đổi khối đích, không thêm «Chỗ hở»
When chạy `--kiem-ba-loi`
Then lệnh in «không cần trang», mã 0, dù `design-pass.md` ghi `skipped` hay vắng.

**AC-8 — Vật thử thật của 17 và 27.**
Given ảnh và chữ của trang ba lối hàng 17 và 27, cùng tệp nhóm `ho-so-can` và `lead-cua-toi` và bảng «Chỗ hở» thật
When dựng trang bằng lệnh và chạy `--kiem-ba-loi` trên kho dựng từ các tệp ấy
Then cả hai trang dựng đủ ba cột cùng khổ; nhóm thật thêm vào ra «nhóm mới <nhóm>»; dòng «Chỗ hở» thật thêm vào ra «chỗ hở
mới»; bảng «Chỗ hở» hai cột như trước hàng 83 (cùng 13 tên «Chỗ») so với bảng năm cột hiện nay không ra điều nào.

**AC-9 — Răng trên cây.**
Given cây thật
When chạy `npm run lint`
Then hồ sơ khai `divergence: opened` mà thiếu `ba-loi/index.html` → đỏ gọi tên hồ sơ; hồ sơ có `ba-loi.json` mà trang sai
→ đỏ gọi tên hồ sơ; trang khác bản dựng lại → đỏ chỉ khi hồ sơ chưa ký (`signed-off`, `machine-cleared` thì giữ nguyên); cây thật xanh với dòng `ba lối: <n> trang`.

**AC-10 — Luật ghi cho người và tác tử. (judgment)**
Given `.claude/rules/giao-dien.md`, `docs/design/vo-va-ia.md` §2 và skill `quy-hang-ui`
When đọc
Then ba chỗ cùng nói: ô chưa có khuôn là ba điều trên; khi đó bước phân kỳ mở (`divergence: opened`) với ba lối tên cố
định, trang dựng bằng `--ba-loi` / `--dung-ba-loi`, gửi kèm thẻ Cổng Phạm vi; bước chấm chạy `--kiem-ba-loi`; màn đi khuôn
sẵn thì `skipped` hợp lệ; khối đích §2 là khuyến nghị đầu vào cho lối ReUI.

## Coverage

Quét Zwicky (preset test-matrix). Chân sản phẩm: `[SUY-TỪ-REPO: docs/adr/0019-cong-chon-khoi.md]` quyết định 1, 2, 5,
`[SUY-TỪ-REPO: docs/plan/pham-vi-cong-chon-khoi.md]` CK1 «Chi tiết cho vòng mở sau»; vật thử
`[SUY-TỪ-REPO: _acceptance/cot-ho-so-can/ba-loi/index.html]`, `[SUY-TỪ-REPO: _acceptance/lead-bon-nac/ba-loi/index.html]`.
Chân ngành: `[NGÀNH: design review «options side by side» — Design Council Double Diamond, pha Develop]` cho so nhiều phương
án cùng khổ trước khi chọn. Thước CE: ngưỡng `bat_khi` của hàng 84.

- Trục A — việc: lập kế hoạch (AC-1) | dựng trang (AC-2, AC-3, AC-4) | nhận vòng (AC-5, AC-6, AC-7) | răng cây (AC-9) |
  luật (AC-10).
- Trục B — trạng thái lối: đủ (AC-2) | không có ứng viên (AC-3) | thiếu chữ, thiếu ảnh, sai khổ, sai định dạng (AC-4).
- Trục C — loại vòng: nhóm mới · đổi khối đích · chỗ hở mới (AC-5, AC-6) | đi khuôn sẵn (AC-7) | đổi cột bảng (AC-5, AC-8).
- Trục D — vật: dữ liệu thử (AC-1…AC-7) | vật thật 17, 27 và lịch sử bảng (AC-8) | cây thật (AC-9).
- Later: ảnh trạng thái thêm trên trang; chạy bài ở CI; nhu cầu và thước chung (CK5).

## Đường đo

- «Vòng có màn đầu nhóm mới: trang dựng đủ ba cột cùng khổ»: AC-2, AC-8 (E2, E8).
- «Cột không có ứng viên ghi «không có» kèm điều đã tra»: AC-3 (E3).
- «design-pass ghi skipped → đỏ»: AC-6 (E6).
- «Vòng chỉ điền khe nhóm có sẵn → không có trang, không đỏ»: AC-7 (E7).

## Out of scope

- Nhu cầu trích từ câu giao, thước chấm chung, dữ liệu ca xấu nhất (CK5) — mục chờ H17.
- Ảnh trạng thái thêm (trống, đang tải, lỗi) trên trang ba lối.
- Chạy bài «ô chưa có khuôn» ở CI mỗi PR — bài chạy ở bước chấm của vòng như bộ đối chiếu.
- Dựng lại hai trang tay của hàng 17 và 27 bằng lệnh (hồ sơ đã ký).
- Đổi khối đích ngoài bảng §2.

## Notes

- Vùng của hàng: `packages/ui-lint/**`, `.agents/skills/quy-hang-ui/**`, `.claude/rules/giao-dien.md`, `docs/design/vo-va-ia.md`.
- Ngoài-1 (máy định tuyến 2026-11-01, đề xuất S4 known-limits): Khi nhánh chính đã đổi khối đích của một màn sau lúc vòng rẽ ra, bài chấm có thể báo nhầm vòng chạm ô chưa có khuôn và bắt làm trang ba lối dù vòng không đụng tới. — `packages/ui-lint/lib/ba-loi.mjs`
- Ngoài-3 (máy định tuyến 2026-11-01, đề xuất S4 known-limits): Khi chấm một bản cũ bằng tuỳ chọn chỉ định điểm đến, kết quả có thể xanh hoặc đỏ sai vì phần hồ sơ và trang lấy từ thư mục đang mở chứ không từ bản đó. — `packages/ui-lint/lib/ba-loi.mjs`
- Ngoài-4 (máy định tuyến 2026-11-01, đề xuất S4 known-limits): Nếu sau này trang ba lối đánh dấu nhầm cột được khuyên khi lời khuyên không phải ReUI, bộ kiểm hiện tại có thể không bắt được. — `packages/ui-lint/tests/ba-loi.test.mjs`
- Ngoài-5 (máy định tuyến 2026-11-01, đề xuất S4 known-limits): Chữ dùng để thử hai trang cũ là bản chép tay, nên nếu chép lệch khỏi trang đã ký thì bài thử vẫn xanh mà không ai biết. — `packages/ui-lint/tests/ba-loi.test.mjs`
- Known limits — chọn ở Cổng Bằng chứng 2026-11-01:
  - Ngoài-1: Khi nhánh chính đã đổi khối đích của một màn sau lúc vòng rẽ ra, bài chấm có thể báo nhầm vòng chạm ô chưa có khuôn cho tới khi gộp nhánh chính vào nhánh việc.
  - Ngoài-3: Chấm một bản cũ bằng tuỳ chọn chỉ định điểm đến thì phần hồ sơ và trang vẫn lấy từ thư mục đang mở, kết quả có thể sai.
  - Ngoài-4: Bộ kiểm chỉ chứng cột được khuyên đánh dấu đúng khi lời khuyên là ReUI.
  - Ngoài-5: Chữ dùng để thử hai trang cũ là bản chép tay, không rút từ trang đã ký.
