## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Địa chỉ gõ không dấu phẩy bị cắt sai đoạn khi tên phường có chữ «Thành» (ví dụ phường Bến Thành)**
  Người dùng thấy gì: Khi người dùng gõ địa chỉ liền một dòng, không có dấu phẩy, và tên phường có chữ «Thành» như Bến Thành, hệ thống không nhận ra phường và báo thiếu. Gõ có dấu phẩy thì đọc đúng.
  Căn cứ: Hậu quả nhẹ: hệ thống báo thiếu chứ không ghi nhầm, không mất dữ liệu, người dùng thêm dấu phẩy hoặc chọn phường là xong, và sửa sau không đắt.
  file: `packages/core/src/address/doc-dia-chi.ts`
  severity: low
  Đề xuất: known-limits

- **«Đường số N» bị đọc thành số nhà: tên đường mất số, khoá trùng giữa các đường khác nhau mà vẫn báo «chuẩn»**
  Người dùng thấy gì: Địa chỉ có tên đường dạng «Đường số 5» và «Đường số 7» có thể ra cùng một khoá, và hệ thống vẫn báo là chuẩn. Khi hàng sau dùng khoá này để kiểm trùng, hai căn khác nhau có thể bị coi là một.
  Căn cứ: Hậu quả nặng vì kiểu tên đường này rất hay gặp ở TP.HCM và lỗi im lặng, có thể làm gộp nhầm hai căn khi kiểm trùng; hiện chưa lưu khoá ở đâu nên sửa bây giờ còn rẻ.
  file: `packages/core/src/address/chuan-hoa.ts`
  severity: high
  Đề xuất: new-contract

- **Chuỗi không dấu phẩy: TU_KHOA_TACH so khớp theo tiền tố nên cắt «Bến Thành» thành «Bến» | «Thành», một phường có trong danh mục bị báo là chưa có**
  Người dùng thấy gì: Địa chỉ gõ liền không dấu phẩy có phường Bến Thành bị báo là phường chưa có trong danh mục, dù phường này có trong danh mục. Người dùng phải gõ lại có dấu phẩy.
  Căn cứ: Hậu quả nhẹ đến vừa: chỉ báo thiếu, không ghi sai, người dùng tự gỡ được bằng cách gõ lại, nhưng nên sửa chung với lỗi cắt chữ «Thành» vì cùng một gốc.
  file: `packages/core/src/address/doc-dia-chi.ts`
  severity: medium
  Đề xuất: known-limits

- **Chữ Unicode tổ hợp (NFD) làm TIEN_TO_XA chỉ bỏ chữ «P», tên phường bị cắt hỏng**
  Người dùng thấy gì: Nếu địa chỉ được gõ hoặc dán bằng kiểu mã hoá chữ tổ hợp, như một số bộ gõ hay máy Mac sinh ra, phường bị đọc hỏng và hệ thống báo thiếu phường.
  Căn cứ: Hậu quả nhẹ: chỉ báo thiếu chứ không ghi sai, gõ lại hoặc chọn tay là xong, nhưng có thể gặp khi dán địa chỉ từ nguồn khác.
  file: `packages/core/src/address/doc-dia-chi.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (ma trận toàn phần): AC-6 tuyên «mọi dòng trangThai thieu, khoa null» nhưng các dòng tỉnh lạ nằm ngoài ma trận và assert yếu hơn; bộ đếm không bao giờ đỏ**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào hôm nay; chỉ là bộ kiểm có vài chỗ lỏng nên nếu sau này có người làm hỏng việc đọc tỉnh lạ thì bộ kiểm có thể không báo.
  Căn cứ: Không ảnh hưởng người dùng hiện tại, kết quả đọc đã đúng, chỉ làm giảm khả năng bắt lỗi về sau; siết lại rẻ khi có dịp.
  file: `packages/core/src/address/doc-dia-chi.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): đối chứng xanh của kiemTrongTinh chạy rỗng, nên phép đo «xã đọc ngoài tỉnh» chỉ có ca đỏ**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng; chỉ là một phép kiểm phụ trong bộ thử chưa có ca đối chứng đúng.
  Căn cứ: Mức nhẹ nhất: kết quả đọc đã đúng và đã có lưới kiểm khác che, nên sửa không đáng công.
  file: `packages/core/src/address/doc-dia-chi.test.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
