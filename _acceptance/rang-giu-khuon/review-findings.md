# Review findings: rang-giu-khuon

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **--base: sửa bản đồ design/patterns/ làm lệch mới ở tệp không đổi bị bỏ qua, chấm theo vòng ra xanh sai**
  Người dùng thấy gì: Khi chỉ sửa luật của một nhóm màn, bước chấm theo vòng có thể báo xanh dù một số màn cũ nay đã lệch luật mới. Lần chạy lint đầy đủ vẫn báo đỏ ở đó.
  Căn cứ: Hậu quả nhẹ vì lần kiểm đầy đủ trước khi phát hành vẫn chặn được, không mất dữ liệu, và chỉ trễ phát hiện chứ không lọt ra ngoài.
  file: `packages/ui-lint/ban-do-khuon.mjs`
  severity: medium
  Đề xuất: known-limits

- **--base: lệch không có dòng thật bị gán dòng 1, nên bị xếp «nợ cũ» dù vòng này gây ra**
  Người dùng thấy gì: Một số kiểu lệch khuôn do chính vòng làm ra có thể bị gắn nhãn nợ cũ nên bước chấm theo vòng vẫn xanh. Lần chạy lint đầy đủ vẫn thấy lệch đó.
  Căn cứ: Chỉ ảnh hưởng vài kiểu lệch hiếm, lưới lint đầy đủ vẫn chặn, và sửa sau không tốn kém nhưng không gấp.
  file: `packages/ui-lint/lib/ban-do.mjs`
  severity: medium
  Đề xuất: known-limits

- **--base: deleting a required slot line in multi-line JSX is labelled old debt and passes**
  Người dùng thấy gì: Nếu chỉ xoá một dòng làm màn thiếu phần bắt buộc, bước chấm theo vòng có thể coi đó là nợ cũ và vẫn xanh. Lần lint đầy đủ vẫn bắt được.
  Căn cứ: Lọt chỉ ở chế độ theo vòng, lưới cuối vẫn đỏ nên không lọt ra sản phẩm; người dùng cuối không bị ảnh hưởng.
  file: `packages/ui-lint/ban-do-khuon.mjs`
  severity: high
  Đề xuất: known-limits

- **--base: when only the pattern map changes, new deviations in unchanged files are dropped silently**
  Người dùng thấy gì: Khi bản đồ khuôn đổi làm vài màn cũ lệch, bước chấm theo vòng không báo gì và ra xanh. Lần chạy lint đầy đủ vẫn báo đỏ.
  Căn cứ: Lỗi nằm ở công cụ kiểm nội bộ, có lưới sau chặn, không mất dữ liệu và người dùng cuối không thấy.
  file: `packages/ui-lint/ban-do-khuon.mjs`
  severity: high
  Đề xuất: known-limits

- **Deviations hard-coded to line 1 are mis-classified as old debt in --base mode**
  Người dùng thấy gì: Một số lệch do vòng hiện tại gây ra bị tính là nợ cũ nên bước chấm theo vòng vẫn xanh. Lint đầy đủ vẫn bắt được.
  Căn cứ: Hiếm gặp, có lưới lint đầy đủ chặn, không ảnh hưởng người dùng cuối và gộp sửa cùng t2 khi có dịp.
  file: `packages/ui-lint/lib/ban-do.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — kiểm im một mình: đối chứng không chứng minh chính ngoại lệ đã làm tệp im**
  Người dùng thấy gì: Một bài tự kiểm có thể vẫn xanh dù việc nhận ngoại lệ của một màn bị hỏng. Người dùng sản phẩm không bị ảnh hưởng.
  Căn cứ: Chỉ làm bài kiểm yếu hơn một chút ở một ca, không ảnh hưởng người dùng, và các ca khác đã phủ phần lớn nên không đáng mở thêm việc.
  file: `packages/ui-lint/tests/rang-giu-khuon.test.mjs`
  severity: low
  Đề xuất: wont-fix

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
