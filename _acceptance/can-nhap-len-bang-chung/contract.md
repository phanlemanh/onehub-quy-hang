---
schema_version: 1
feature: "Đầu chủ nhập bảng hàng cũ từ Sheet và căn mà file ghi «còn hàng» lên ngay bảng hàng chung dù file thiếu pháp lý hay tình trạng sử dụng; mục thiếu hiện ở mức đủ và thành việc ở Hôm nay"
slug: can-nhap-len-bang-chung
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui]
status: approved
design_doc: docs/superpowers/specs/2026-11-08-can-nhap-len-bang-chung-design.md
approved_by: Manh Phan
approved_at: 2026-11-08
---

# Acceptance Contract: can-nhap-len-bang-chung

## Context

Cửa nhập file chưa đọc pháp lý, tình trạng sử dụng (hàng `chuan-hoa-moi-cua` cố ý không làm), nên mọi căn file ghi
«còn hàng» nằm lại Chưa đủ để rao và bảng hàng chung rỗng sau lần chuyển nhà từ Sheet. Chủ kho chốt 06/11 (Tham chiếu §12
«Căn chuyển từ Sheet lên bảng chung ngay»): chỉ ở cửa nhập, căn «còn hàng» vào Đang bán dù thiếu hai mục ấy; mục thiếu hiện
ở mức đủ và thành việc ở Hôm nay của đầu chủ giữ căn. Giá kèm điều kiện phí vẫn là điều kiện ở mọi cửa. Hạng T3 vì đổi luật
trạng thái ở lõi (`packages/core/src/listing/**`). Không migration. Thiết kế:
`docs/superpowers/specs/2026-11-08-can-nhap-len-bang-chung-design.md`.

Dữ liệu mẫu: `[Tên]`, `0900 000 0xx`, `[Tên sàn]`.

## Criteria

- **AC-1 — Luật trạng thái của lõi biết cửa nhập.** Given căn có mã, giá kèm điều kiện phí và đủ ảnh theo tối thiểu của
  sàn, When xét lên Đang bán với cửa vào «nhập», Then ma trận viết trước pháp lý {có, thiếu} × tình trạng sử dụng {có,
  thiếu} đều không còn điều thiếu; When cùng căn xét không kèm cửa vào, Then thiếu đúng các mục vắng như hôm nay; When cửa
  «nhập» mà thiếu giá, điều kiện phí, mã căn, hay ảnh dưới tối thiểu, Then vẫn thiếu đúng các mục ấy.
- **AC-2 — Dòng nhập «còn hàng» lên Đang bán.** Given sàn mới và file có dòng tạo mới ghi trạng thái «Đang bán», đủ mã, giá,
  điều kiện phí, không có pháp lý, tình trạng sử dụng, When ghi lần nhập, Then căn ở Đang bán với đúng một sự kiện
  `status_changed` tới Đang bán mang mã lần nhập, và lý do dòng nêu bằng nhãn rằng căn còn thiếu pháp lý, tình trạng sử
  dụng, không chứa mã thô. (cross-layer)
- **AC-3 — Dòng «Đã cọc» đi qua Đang bán.** Given dòng tạo mới ghi «Đã cọc» thiếu pháp lý, When ghi lần nhập, Then căn ở
  Đang giao dịch, có sự kiện tới Đang bán rồi tới Đang giao dịch. (cross-layer)
- **AC-4 — Giá vẫn chặn ở cửa nhập.** Given dòng «còn hàng» thiếu giá hay thiếu điều kiện phí, hoặc sàn đặt tối thiểu 1 ảnh
  mà căn 0 ảnh, When ghi lần nhập, Then căn ở Chưa đủ để rao và lý do dòng nêu đúng mục thiếu bằng nhãn. (cross-layer)
- **AC-5 — Cửa khác vẫn đòi pháp lý, tình trạng sử dụng.** Given căn đủ giá kèm điều kiện phí, mã, thiếu pháp lý, When đưa
  lên Đang bán bằng lệnh của nút «Sẵn sàng bán», ô Trạng thái có mạng, ô Trạng thái ghi lúc mất mạng, hay lệnh sửa hàng loạt,
  Then mỗi lệnh bị từ chối với điều thiếu chứa pháp lý; When căn tạo từ lead thiếu pháp lý được đưa lên Đang bán, Then cũng
  bị từ chối như vậy; When người gọi gửi lệnh công khai kèm khoá mã lần nhập, Then lệnh bị
  từ chối vì khoá lạ, căn không đổi. (cross-layer)
- **AC-6 — Đầu khách thấy cả 50 căn nhập.** Given một lần nhập 50 dòng «còn hàng» thiếu pháp lý của một đầu chủ, When đầu
  khách của sàn đọc danh sách hàng, Then thấy đủ 50 căn ở Đang bán; đầu khách của sàn khác không thấy căn nào. (cross-layer)
- **AC-7 — Mục thiếu thành việc ở Hôm nay của người giữ căn.** Given căn nhập lên Đang bán thiếu pháp lý, tình trạng sử
  dụng, When đọc mức đủ của căn, Then mục thiếu chứa pháp lý và tình trạng sử dụng; When dựng Hôm nay bằng bộ nhóm mặc định
  cho đầu chủ giữ căn (người file ghi, hay người nhập khi file không ghi), Then căn ở nhóm «Thiếu thông tin»; đầu chủ khác
  không thấy căn trong Hôm nay của mình. (cross-layer)
- **AC-8 — Hoàn tác lần nhập gỡ căn đã lên Đang bán.** Given lần nhập vừa đưa căn lên Đang bán, When hoàn tác cả lần nhập,
  Then căn bị gỡ khỏi danh sách hàng, đầu khách không còn thấy. (cross-layer)
- **AC-9 — Người dùng thấy trên màn.** Given dãy G chạy bản dev và một lần nhập như AC-2, When đầu chủ mở kết quả lần nhập,
  Hôm nay, hồ sơ căn và Bảng hàng, Then dòng nhập hiện «Đang bán» với lời còn thiếu pháp lý, tình trạng sử dụng; căn nằm
  trong nhóm «Thiếu thông tin» của Hôm nay; mức đủ hiện hai mục còn thiếu; tóm tắt lần nhập đếm các căn ấy là đã lên Đang
  bán, dòng không mang tông lỗi; ở khổ 1440 và 375.
- **AC-10 — Điền dần mục thiếu không đẩy căn khỏi bảng chung.** Given căn nhập lên Đang bán thiếu pháp lý, tình trạng sử
  dụng, When đầu chủ giữ căn lần lượt điền pháp lý, đổi giá kèm điều kiện phí, rồi điền tình trạng sử dụng, Then mỗi lệnh
  được nhận, căn vẫn ở Đang bán, và mức đủ bớt đúng mục vừa điền sau mỗi bước. (cross-layer)

## Coverage

Quét bằng skill `morphological-scan` (preset entity-feature + risk-premortem). Đối tượng: một căn đi lên Đang bán.

| Trục | Giá trị | Thước CE |
| --- | --- | --- |
| Cửa lên | nhập — dòng tạo · nhập — dòng cập nhật · «Sẵn sàng bán» · ô Trạng thái (có mạng, mất mạng) · sửa hàng loạt · căn tạo từ lead · lệnh công khai giả mã lần nhập | Tham chiếu §12 dòng 06/11; `packages/api/src/imports/store.ts:386`, `packages/api/src/listings/routes.ts:43` |
| Trạng thái file | Đang bán · Đã cọc · Tạm ngừng · trống | `packages/core/src/import/dictionaries.ts` |
| Điều kiện thiếu | pháp lý · tình trạng sử dụng · cả hai · giá · điều kiện phí · mã căn · ảnh dưới tối thiểu | `packages/core/src/listing/status.ts:96` |
| Chỗ thấy | lý do dòng nhập · mức đủ · Hôm nay · Bảng hàng · đầu khách | câu giao hàng lộ trình |
| Đảo | hoàn tác lần nhập | ADR-0011 quyết định 8 |
| Sau lần nhập | điền pháp lý · đổi giá · điền tình trạng sử dụng | `packages/api/src/listings/store.ts:269` (luật trạng thái chỉ xét ở lệnh đổi trạng thái) |

Core ↔ AC: cửa × điều kiện ở lõi → AC-1; nhập-tạo × trạng thái file × điều kiện → AC-2, AC-3, AC-4; các cửa khác → AC-5;
chỗ thấy → AC-6, AC-7, AC-9; đảo → AC-8; sau lần nhập → AC-10. Nhập — dòng cập nhật, Tạm ngừng ở «Out of scope».

## Đường đo

- 50 căn «còn hàng» thiếu pháp lý vào bảng chung, đầu khách thấy · số từ ca 50 dòng của bộ kiểm API trên Postgres (đếm căn Đang bán đầu khách đọc được) · AC-6
- Hàng tạo tay và từ lead giữ điều kiện pháp lý, tình trạng sử dụng · số từ ca các cửa khác bị từ chối · AC-5
- Mỗi căn thiếu có việc ở Hôm nay của đầu chủ giữ căn · số từ ca nhóm «Thiếu thông tin» trên căn nhập · AC-7

## Out of scope

- Đọc cột pháp lý, tình trạng sử dụng từ file (cần tập giá trị chuẩn và từ điển — `chuan-hoa-moi-cua` đã gác).
- Đổi trạng thái căn có sẵn qua dòng cập nhật của lần nhập (Hỏi-1).
- Cài đặt cho sàn bật lại «cửa nhập đòi pháp lý, tình trạng sử dụng» (Hỏi-2).
- Nhóm Hôm nay riêng cho căn nhập thiếu pháp lý — «Thiếu thông tin» đã là việc ấy.
- Dòng file ghi «Tạm ngừng»: lên Tạm ngừng như hôm nay (không đòi pháp lý), không đổi.

## Notes

- Ca «ảnh không còn chặn ở cửa nhập» của hồ sơ `anh-khong-chan-ban` (E2c) đang ghim vế «dòng vẫn ở Chưa đủ để rao» — vế
  ấy chính là điều hàng này đổi (hồ sơ kia ghi rõ chờ hàng này). Hàng này sửa ca ấy giữ vế «lý do không nêu ảnh», đổi vế
  trạng thái thành «căn lên Đang bán»; E2 của hồ sơ này chạy lại đích danh ca ấy.
