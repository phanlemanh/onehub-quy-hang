## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **GET /api/v1/off-compound-units trả mã lỗi «forbidden» không có trong API_ERRORS (r1)**
  Người dùng thấy gì: Người không có quyền xem Bảng hàng vẫn bị từ chối đúng, nhưng màn có thể không hiện được câu báo tiếng Việt chuẩn cho trường hợp này.
  Căn cứ: Hậu quả nhẹ: chỉ lệch câu báo lỗi ở một ca hiếm, không mất hay lộ dữ liệu, và sửa sau không tốn kém.
  file: `packages/api/src/off-compound-units/routes.ts`
  severity: medium
  Đề xuất: known-limits

- **Khuôn công khai /api/v1/catalog đưa khoá tiếng Việt `nhanSan` ra API, lệch tên `blockLabel` mà đường tra lô đang dùng (r1)**
  Người dùng thấy gì: Bên ngoài đọc danh mục sẽ thấy một trường mang tên tiếng Việt, khác tên của cùng trường ở đường tra lô, nên dễ nhầm khi tích hợp.
  Căn cứ: Không ảnh hưởng người dùng cuối và không mất dữ liệu; đổi tên sau khi có bên ngoài dùng thì đắt hơn, nên nên ghi lại để quyết sớm.
  file: `packages/api/src/catalog/doc-ca-danh-muc.ts`
  severity: medium
  Đề xuất: known-limits

- **Bảng nhãn loại hình RESO → nhãn mặc định nằm hai chỗ (r1)**
  Người dùng thấy gì: Nếu sau này đổi chữ gọi một loại hình ở một nơi mà quên nơi kia, Bảng hàng và hồ sơ căn có thể hiện hai chữ khác nhau.
  Căn cứ: Hiện hai nơi đang cùng chữ nên người dùng chưa gặp gì; rủi ro chỉ có khi sửa sau và dễ phát hiện bằng mắt.
  file: `apps/web/src/app/(app)/inventory/loai-hinh.ts`
  severity: low
  Đề xuất: wont-fix

- **Cột thấp tầng biến mất cùng ô lọc của nó khi bảng đã lọc ra rỗng; luật lọc vẫn chạy mà không còn chỗ thấy (r1)**
  Người dùng thấy gì: Khi gõ dở một số vào ô lọc cột đất và bảng ra rỗng, ô đang gõ biến mất, người dùng không thấy chỗ sửa và chỉ còn cách xoá hết mọi bộ lọc.
  Căn cứ: Gây bực khi lọc nhưng không mất dữ liệu và người dùng thoát được bằng nút xoá lọc; sửa cần chốt lại cách hiện cột khi rỗng nên nên làm thành việc riêng.
  file: `apps/web/src/app/(app)/inventory/loai-hinh.ts`
  severity: high
  Đề xuất: new-contract

- **Hồ sơ hàng lô hay ngoài khu: bấm vào mục «Các lần rao» mở ra «không thấy căn» (r1)**
  Người dùng thấy gì: Với căn lô hoặc ngoài khu, bấm vào một lần rao trong hồ sơ làm hồ sơ báo không thấy căn, dù căn vẫn có.
  Căn cứ: Lỗi gây hoang mang nhưng không mất dữ liệu, người dùng quay lại từ Bảng hàng mở lại được; cần sửa trong một việc riêng.
  file: `apps/web/src/app/(app)/units/ho-so/mo-hinh.ts`
  severity: medium
  Đề xuất: new-contract

- **Lỗi dựng chỉ mục lô bị nuốt im: một lô sai làm mọi hàng lô hiện «Chưa rõ», không có báo nào (r1)**
  Người dùng thấy gì: Nếu danh mục có một lô sai, mọi căn lô hiện loại hình «Chưa rõ» mà không có lời báo, trông như chưa có trong danh mục.
  Căn cứ: Chỉ xảy ra khi dữ liệu danh mục hỏng, hiện danh mục lô thật còn rỗng nên chưa ai gặp; sửa dữ liệu rồi tải lại là hết.
  file: `apps/web/src/app/(app)/inventory/ghep-danh-muc.ts`
  severity: low
  Đề xuất: known-limits

- **Đọc danh sách căn ngoài khu lỗi thì bị nuốt (lỗi mạng hay 5xx thành null); máy chưa có bản giữ thì hàng ngoài khu hiện sai mà không báo (r1)**
  Người dùng thấy gì: Lần đầu mở trên máy mới mà mạng lỗi, các căn ngoài khu hiện «Chưa rõ» và vị trí chung chung, không có nút Thử lại để lấy lại.
  Căn cứ: Người dùng tự gỡ được bằng tải lại khi có mạng và không mất dữ liệu, nhưng thiếu báo lỗi dễ gây hiểu nhầm.
  file: `apps/web/src/app/(app)/inventory/danh-muc.ts`
  severity: low
  Đề xuất: new-contract

- **Đầu cột hồ sơ hàng lô lặp tên khu; hàng ngoài khu không mã có tiêu đề trống (r1)**
  Người dùng thấy gì: Hồ sơ căn lô hiện tên khu hai lần ở đầu cột, và căn ngoài khu không mã có tiêu đề trống.
  Căn cứ: Chỉ là lỗi trình bày, không sai dữ liệu và không cản việc dùng; sửa rẻ nhưng không gấp.
  file: `apps/web/src/app/(app)/units/ho-so/mo-hinh.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 — Fixture viết tay đúng khuôn bên đọc: phép nhìn E8 tự viết góc nhìn đã lưu vào kho trình duyệt thay vì đi qua đường lưu thật (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài thử trên màn nạp sẵn góc nhìn đã lưu thay vì tự bấm lưu, nên có thể bỏ sót lỗi ở đường lưu góc nhìn.
  Căn cứ: Không ảnh hưởng người dùng trực tiếp, chỉ làm lưới kiểm lỏng hơn ở một đường; có thể bổ sung sau.
  file: `_acceptance/bang-hang-theo-loai-hinh/thu/chay-ui.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — Tuyên so «từng trường» nhưng ma trận bỏ trường: kiemDong không so unitType với nguồn và không kiểm trường nào ở hai ca chưa rõ (r1)**
  Người dùng thấy gì: Một vài trường của dòng chưa được bài kiểm so với dữ liệu gốc, nên một lỗi nhỏ ở đó có thể lọt qua.
  Căn cứ: Rủi ro nhỏ và chỉ nằm ở phần kiểm, không ảnh hưởng người dùng hiện tại; bổ sung ca sau rất rẻ.
  file: `apps/web/src/app/(app)/inventory/loai-hinh.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 — Fixture viết tay đúng khuôn bên đọc: danh mục «như /api/v1/catalog trả» được tự ráp rồi ép kiểu, không rút từ bên ghi (r1)**
  Người dùng thấy gì: Bài kiểm dùng danh mục tự ráp thay vì lấy từ máy chủ thật, nên nếu máy chủ đổi dạng trả thì bài kiểm không báo kịp.
  Căn cứ: Không ảnh hưởng người dùng hiện tại; chỉ làm lưới an toàn lỏng và có thể siết khi sửa phần máy chủ.
  file: `apps/web/src/app/(app)/inventory/loai-hinh.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 — Assert «chuỗi có mặt» khi lời hứa là quan hệ giá trị: diện tích đất của lô chỉ kiểm hậu tố «m²» (r1)**
  Người dùng thấy gì: Bài kiểm chỉ xem diện tích đất có đuôi «m²», không xem số có đúng lô, nên một số sai vẫn lọt qua.
  Căn cứ: Hiện chưa có bằng chứng số sai, chỉ là bài kiểm lỏng; nâng chặt sau rẻ và không ảnh hưởng người dùng.
  file: `apps/web/src/app/(app)/units/ho-so/loai-hinh.test.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
