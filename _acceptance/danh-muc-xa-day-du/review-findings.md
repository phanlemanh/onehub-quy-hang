# Review findings: danh-muc-xa-day-du (round 1)

## Trong hợp đồng

- **Hình dạng 3 — lời hứa là QUAN HỆ (số mã tách của bảng bằng đếm của nguồn) nhưng assert chỉ so với một hằng số ghim**
  file: `packages/core/src/address/danh-muc-xa.test.ts:175`
  severity: medium
  AC: AC-2
  source: measurement
  detail: E2 trong evals.yaml hứa «số mã cũ có vao ≥ 2 bằng đếm của nguồn và bằng số ghim 441». Ở dòng 174-175, `tach` được đếm trên du-lieu/xa-cu.json, rồi chỉ có `assert.equal(tach, GHIM.tach, ...)`, tức là so với hằng số 441. Không chỗ nào đếm độc lập số mã cũ bị tách trên XML sheet thô. Hàm `demDongSheetTho()` (dòng 133-161) chỉ trả `dong` và tập `maCu`, không gom mã cũ → tập mã mới để đếm số mã có từ hai xã nhận trở lên. Vế «bằng đếm của nguồn» vì thế chưa được đo. Phép so byte-trùng ở dòng 164 chỉ cho thấy bảng đã commit trùng với đầu ra của chính bộ sinh, nên nếu cách bộ sinh gom `vao` sai (ví dụ phần khử trùng `cu.vao.includes(maMoi)`, hay sửa `dem-so-0-ma-moi` làm hai mã mới gộp lại) thì cả bảng lẫn số đếm cùng lệch như nhau. Lúc đó chỉ con số 441 viết tay chặn được, và con số này cũng được đo bằng chính bộ sinh. Các vế cùng loại khác thì có đối chứng độc lập trên nguồn thô: số dòng ở dòng 169, tập mã cũ ở dòng 170 và 172, đếm loại ở AC-1 dòng 76-77. Riêng vế số mã tách thiếu đối chứng này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Địa chỉ gõ thiếu một phần dấu (có «đ» hoặc chữ có mũ/móc nhưng thiếu ở chữ khác) không còn đọc ra xã: hồi quy, không có đường lui về so bỏ dấu**
  Người dùng thấy gì: Khi người dùng gõ địa chỉ có chữ «đ» hoặc dấu mũ nhưng thiếu dấu ở chữ khác, ví dụ «Phường Tan Định», hệ thống không nhận ra phường. Nó còn báo sai rằng danh mục thiếu phường đó, dù phường có trong danh mục.
  Căn cứ: Lỗi làm địa chỉ đúng bị báo thiếu, nên người dùng gặp ngay. Họ tự gõ lại đủ dấu hoặc bỏ hẳn dấu thì qua được, nên không mất dữ liệu, và sửa sau không đắt.
  file: `packages/core/src/address/doc-dia-chi-loi.ts`
  severity: high
  Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
