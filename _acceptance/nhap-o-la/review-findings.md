## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bài kiểm của packages/core giờ nhập thẳng mã apps/web (hoiOLa, chayOng): lõi phụ thuộc ngược vào app**
  Người dùng thấy gì: Người dùng không thấy gì khác đi: tính năng đề xuất ô lạ chạy đúng. Chỉ có điều bộ kiểm của phần lõi giờ dính vào mã màn Nhập, nên sửa màn có thể làm bộ kiểm lõi đỏ oan.
  Căn cứ: Không ảnh hưởng người dùng và không mất dữ liệu; chỉ gây phiền cho người làm kho, tự lộ ra ngay khi bài kiểm đỏ và dời sau cũng không đắt hơn.
  file: `packages/core/src/import/ai/o-la/do-o-la.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hai ảnh «cận ô» ở khổ 1440 giống nhau từng byte: ô về tay và ô trạng thái lạ dùng chung một ảnh (r2 · tệp đã đổi)**
  Người dùng thấy gì: Hai ảnh minh hoạ ở khổ máy tính trông như hai bằng chứng riêng nhưng thực ra là một, nên người xem hồ sơ có thể tưởng đã kiểm kỹ hơn thực tế. Màn hình dùng thật không bị ảnh hưởng.
  Căn cứ: Chỉ ảnh hồ sơ bị trùng, không mất hay lộ dữ liệu của người dùng, chụp lại sau lúc nào cũng được và rẻ.
  file: `_acceptance/nhap-o-la/thu/chup-o-la.mjs`
  severity: medium
  Đề xuất: known-limits

- **Lần chặn thứ hai ở máy chủ yếu hơn lần chặn ở trình duyệt: họ tên giữa câu và họ tên trong `lyDoMa` lọt (r1)**
  Người dùng thấy gì: Nếu có người gửi yêu cầu không qua màn hình thường, một họ tên chủ nhà nằm giữa câu có thể bị gửi sang bên AI. Người dùng bình thường qua màn hình thì đã được lọc.
  Căn cứ: Có thể làm lộ tên chủ nhà ra ngoài công ty nhưng chỉ khi đi đường vòng, và gửi đi rồi thì không rút lại được; sửa khá rẻ nên nên đăng việc riêng.
  file: `packages/core/src/import/ai/o-la/quet.ts`
  severity: medium
  Đề xuất: new-contract

- **Quét ở máy chủ yếu hơn bộ lọc trình duyệt: họ tên nằm giữa câu và nhãn [Tên] không bị chặn (r1)**
  Người dùng thấy gì: Một ô có tên chủ nhà kèm chữ khác, như «chủ [Tên] giữ», có thể qua cổng máy chủ nếu yêu cầu không đi từ màn hình thường, rồi tới bên AI.
  Căn cứ: Lộ tên chủ nhà ra ngoài công ty là nặng và không rút lại được, nhưng chỉ xảy ra khi đi đường vòng; sửa rẻ nên đăng việc riêng.
  file: `packages/core/src/import/ai/o-la/quet.ts`
  severity: medium
  Đề xuất: new-contract

- **Ô «chủ nhận về X» bỏ qua kiểm luật 12: đề xuất giá nào đọc được cũng qua (r1)**
  Người dùng thấy gì: Với ô kiểu «chủ nhận về 3,95 tỷ», máy có thể đề xuất một giá sai mà vẫn hiện ra cho người bấm «Dùng».
  Căn cứ: Người vẫn phải tự bấm «Dùng» và sửa tay được, nên không mất dữ liệu; chỉ thiếu một lớp kiểm cho một cách viết.
  file: `packages/core/src/import/ai/o-la/kiem.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 (âm tính một mình): 'sàn chưa bật thì không gọi khách' kiểm một bộ đếm không nối vào đâu (r1)**
  Người dùng thấy gì: Bài kiểm không chứng minh chắc là màn không gọi AI khi sàn tắt; chức năng thật có thể vẫn đúng.
  Căn cứ: Không ảnh hưởng người dùng trực tiếp, chỉ làm bài kiểm yếu; có thể củng cố sau.
  file: `apps/web/src/lib/nhap/o-la.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình 3 (kiểm 'có mặt' trong khi lời hứa là quan hệ): ma trận 6 mẫu × 3 chỗ không ghim loại trúng theo mẫu (r1)**
  Người dùng thấy gì: Sổ chi phí có thể ghi sai loại dữ liệu cá nhân bị chặn, dù việc chặn vẫn xảy ra.
  Căn cứ: Dữ liệu vẫn được chặn nên không lộ; chỉ sai nhãn thống kê, sửa sau được.
  file: `packages/api/src/imports/ai/cells/quet.ro-ri.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 (kiểm 'có mặt' trong khi lời hứa là quan hệ): 'thứ tự cột rồi dòng' chỉ xem hai phần tử đầu của một cột (r1)**
  Người dùng thấy gì: Với tệp có hơn 300 ô lạ, chưa chắc máy chọn đúng 300 ô theo thứ tự mong muốn.
  Căn cứ: Chỉ xảy ra với tệp rất lớn, ô bị bỏ vẫn sửa tay được và không mất dữ liệu.
  file: `packages/core/src/import/ai/o-la/goi.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 (âm tính một mình): đối chứng E4c không ghim lý do dòng bị bỏ (r1)**
  Người dùng thấy gì: Bài kiểm có thể xanh dù dòng bị bỏ vì lý do khác, nên chưa chứng minh chặt rằng ô giá cần người mới là nguyên nhân.
  Căn cứ: Không đổi hành vi với người dùng, chỉ làm bài kiểm lỏng; sửa sau rẻ.
  file: `apps/web/src/lib/nhap/test-db/o-la.db-test.mts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
