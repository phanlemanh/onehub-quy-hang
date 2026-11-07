---
schema_version: 1
feature: "Bảng hàng cuộn mượt lại trên 5.000 căn: ô tích của sửa hàng loạt không còn làm mọi dòng đang hiện vẽ lại mỗi khung cuộn, nên bài đo cuộn E11 lại đạt; ô tích, chọn hết và thanh hành động giữ nguyên."
slug: va-bang-hang-e11-hieu-nang
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: approved
design_doc: _acceptance/va-bang-hang-e11-hieu-nang/design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-11-07T15:30:00Z
---

# Acceptance Contract: va-bang-hang-e11-hieu-nang

## Context

Hàng vá dãy D (đợt `dau-khach-nhap`), giám sát mở ở D-24 và chốt thiết kế + thước ngày 07/11. Đo xen kẽ từng cặp và chia
đôi cho thấy PR #60 (ô tích từng dòng của sửa hàng loạt) làm Bảng hàng chậm khoảng gấp đôi khi cuộn; nhánh chính vẫn
chậm ~1,9 lần so bản đã ký `028f5636`. «Bản tốt» = commit `028f5636` (bản đã ký của `bang-hang-kieu-sheet`). «Đo cặp» =
lệnh `_acceptance/va-bang-hang-e11-hieu-nang/thu/kiem-e11.sh`: 3 cặp, mỗi cặp đo bản tốt rồi bản xét ngay sau, cùng máy
đo cuộn của E11 (5.000 căn, hiệu chuẩn + đối chứng bận).

Source input: hàng `va-bang-hang-e11-hieu-nang` (`docs/plan/lo-trinh.json`) · thiết kế
`_acceptance/va-bang-hang-e11-hieu-nang/design.md`

## Criteria

- **AC-1** — Cuộn 5.000 căn lại ngang bản tốt.
  Given Bảng hàng 5.000 căn ở bản của vòng (HEAD) và bản tốt,
  When đo cặp 3 lần,
  Then trung vị tỉ số khung > 50 ms (bản vòng / bản tốt) ≤ 1,2 và trung vị khung > 50 ms của bản vòng ≤ 1%.

- **AC-2** — Thước phân biệt được bản chậm và không đỏ oan bản tốt.
  Given nhánh chính trước vòng (`fbdad5ad`) và chính bản tốt `028f5636`,
  When đo cặp bằng đúng lệnh của AC-1 với bản xét lần lượt là hai bản ấy,
  Then bản trước vòng đỏ với «E11 cặp ĐỎ: tỉ số trung vị … > 1,2», còn bản tốt so với chính nó đạt («E11 cặp ĐẠT»).

- **AC-3** — Ô tích vẫn làm đúng việc trên bản đang chạy.
  Given Bảng hàng trên bản build của vòng, lọc ra N căn (N đọc ở ô đếm «N / tổng căn» của bảng),
  When tích một dòng, cuộn xa rồi cuộn về, bỏ tích, bấm «Chọn hết», rồi cuộn tới dòng thứ vài trăm,
  Then thanh hành động đếm 1 khi tích một dòng, dòng ấy vẫn hiện tích sau khi cuộn về, bỏ tích thì thanh về 0 hay ẩn,
  «Chọn hết» chọn đủ N căn sau lọc (thanh đếm N) và dòng cuộn tới sau khi bấm cũng đã tích.

- **AC-5** — Ô tích không vẽ lại theo dòng.
  Given thành phần ô tích của một dòng,
  When nạp mô-đun sửa hàng loạt,
  Then ô tích là thành phần memo (React.memo) — props giữ nguyên thì React bỏ qua vẽ lại; bản trước vòng không phải memo.

- **AC-4** — Không đổi giao diện và chuẩn kho.
  Given cây của vòng,
  When chạy kiểm kiểu, lint (mức nợ giao diện, bài quét khuôn) và bộ test của web,
  Then tất cả xanh, mức nợ 0/0, khuôn 0 lệch.

## Coverage

Bỏ quét không gian — xem dòng sổ «bỏ coverage-scan». Không gian là bản (vòng · trước vòng) × việc (cuộn · tích/bỏ tích ·
chọn hết · đếm trên thanh): cuộn bản vòng ở AC-1, bản trước vòng ở AC-2; tích, cuộn về, bỏ tích, chọn hết và đếm ở
AC-3; ô tích bỏ qua vẽ lại ở AC-5; thước không đỏ oan bản tốt ở AC-2; điều không đổi ở AC-4.

## Out of scope

- Phần chậm thêm ở #55 và #64 đã được kéo lại ở nhánh chính — vòng không đuổi theo, chỉ đưa nhánh chính về ngưỡng.
- Đổi lưới ReUI cài nguyên bản (`components/reui/data-grid`) hay thay ô tích bằng phần tử tự vẽ.
- Nới ngưỡng E11 hay sửa máy đo cuộn của `bang-hang-kieu-sheet`.

## Notes

- Đo cặp cần Postgres dãy D (container `quy-hang-db-dkn-D`, cổng 5575, cơ sở dữ liệu `e11`) và cổng 3575/3585 của dãy D;
  lệnh tự dựng phần thiếu. Tải máy không làm hỏng kết luận vì so trong từng cặp.
