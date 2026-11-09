## Trong hợp đồng

- **Phép đếm của ca AC-6 là hằng số, không đếm số lần so thật nên không thể đỏ**
  file: `packages/connect/src/catalog-confirmation.khoa.test.ts:187`
  severity: low
  AC: AC-6
  source: bugs
  detail: Trong ca «khoá máy cấp: có dấu tách dính chữ bị chặn», `soChan += 7` và `soQua += 7` cộng cứng mỗi vòng, trước khi chạy các phép so. Các phép so hàm dựng lại nằm trong vòng lặp theo `DUONG_DUNG_TOA` và `DUONG_DUNG_UPI`. Vì vậy `assert.equal(soChan, sdt.length * 7)` và `assert.equal(soChan, 84)` luôn đúng khi `sdt.length` là 12, kể cả khi bớt đường dựng hay hai mảng rỗng. Tiêu đề evals.yaml ghi «số lần so đếm bằng biến», và E6 ghi «số lần so bằng 84», nên bằng chứng số 84 của E6/AC-6 không đo được điều nó nêu. Các ca khác trong tệp tăng biến theo từng lần so. Tác động thực tế hạn chế vì `khoa-sdt.test.ts` đếm thật 875 lần trên cùng hai mảng, nên bớt đường dựng vẫn bị ca đó bắt. Cách sửa: tăng biến ngay tại từng phép so, như ở ca «khoá dạng thật qua cả hai tầng». Ngoài finding này, không thấy lỗi đúng-sai hay lỗi bị nuốt nào trong vùng vật: đã chạy thử `MAU_DOAN_SDT` trên các khoá biên và mọi dòng trong bảng thiết kế, kết quả khớp thiết kế; 42 test của core/confirmation và connect/catalog-confirmation đều xanh, kiểm kiểu hai gói không báo lỗi; thay đổi không thêm catch hay fallback.

- **Hình dạng 3 (assert chuỗi/kết quả trong khi lời hứa là QUAN HỆ): đối chứng «cùng hình, 8 chữ số» không được assert, và phần tử 0900-071 sai quan hệ đó**
  file: `packages/core/src/confirmation/nen-thu.fixture.ts:112`
  severity: medium
  AC: AC-1
  source: measurement
  detail: AC-1 và các eval E1, E2, E6 hứa một quan hệ theo cặp giữa DAU_NOI_SDT[i] và DAU_NOI_DOI_CHUNG[i]. Chú thích fixture ở dòng trên ghi «cùng hình, cùng dấu nối, 8 chữ số». Không test nào assert quan hệ này: test chỉ gọi `doc(dc).ok` hoặc `d.dung(...).ok` trên chuỗi viết tay. Đếm chữ số cho thấy phần tử index 2 là `0900-071`, chỉ có 7 chữ số và 1 dấu `-`, trong khi cặp của nó `0900-000-071` có 10 chữ số và 2 dấu `-`. Sáu cặp còn lại đều đúng 8 chữ số và cùng số dấu tách. evals.yaml E1 cũng liệt kê `0900-071` trong danh sách «cùng hình 8 chữ số», nên lời hứa sai ngay trong eval. Hàng này đổi đồng thời số chữ số và số dấu tách, nên không tách được nguyên nhân chặn là độ dài dãy hay hình khoá, đúng điều đối chứng ghép cặp được thêm để đo (gap-probe P1). Phạm vi ảnh hưởng: 50/350 lần so đối chứng ở E1 (25 khoá × 2 nút), 125/875 ở E2 và 14/84 ở E6 (`toa0900-071`, `0900-071x`) không đo mốc 8 chữ số như đã tuyên bố. Test vẫn xanh vì không có assert nào đếm chữ số hay so hình của cặp.

- **Hình dạng 5 (số assert = số phần tử): E6 cộng hằng `+= 7` thay vì đếm lần so thật, nên assert số lần so là hằng đúng**
  file: `packages/connect/src/catalog-confirmation.khoa.test.ts:187`
  severity: low
  AC: AC-6
  source: measurement
  detail: Test «khoá máy cấp: có dấu tách dính chữ bị chặn» chạy `soChan += 7; soQua += 7;` một lần cho mỗi khoá, trước khi các lần so diễn ra, và không tăng biến đếm trong hai vòng `for (const d of DUONG_DUNG_TOA)` và `for (const d of DUONG_DUNG_UPI)`. Vì vậy `assert.equal(soChan, sdt.length * 7)` ở dòng 204 đúng theo cấu tạo. Các assert `soChan, 84` và `soQua, 84` ở dòng 205-206 chỉ nhắc lại `sdt.length === 12`, đã được assert sẵn. Nếu một đường dựng bị bỏ khỏi DUONG_DUNG_TOA hay DUONG_DUNG_UPI, E6 vẫn báo đủ 84 dù số lần so thật ít hơn. Eval E6 hứa «số lần so bằng 84», và đầu evals.yaml ghi «số lần so đếm bằng biến và so với độ dài ma trận». Các test E1, E3, E4, E5 đều tăng biến đếm ngay tại từng lần so; riêng E6 thì không.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Nhánh «có dấu tách» của MAU_DOAN_SDT chặn cả dãy không thuộc luật đã ghi ở ADR-0027**
  Người dùng thấy gì: Một dạng khoá hiếm (số dài dính chữ, kèm đuôi số sau dấu gạch) bị từ chối dù theo luật đã ghi thì phải qua. Khoá thật của Invest hiện không có dạng này.
  Căn cứ: Chỉ lệch về phía chặn thừa trên một dạng khoá chưa từng xuất hiện thật, không lộ dữ liệu nào, và nếu gặp thì Invest đổi khoá là xong.
  file: `packages/core/src/confirmation/dang-dong.ts`
  severity: low
  Đề xuất: known-limits

- **Lỗi báo sai với UPI dáng số điện thoại mất chỉ dẫn «chưa báo sai được, nguồn danh mục phải sửa»**
  Người dùng thấy gì: Khi sàn gặp căn có mã định danh lạ giống số điện thoại, thông báo lỗi không nói rõ là căn này chưa báo sai được và phải chờ nguồn danh mục sửa. Hiện chưa có màn hình nào hiển thị thông báo này.
  Căn cứ: Chỉ thiếu một câu chỉ dẫn trong thông báo lỗi chưa ai nhìn thấy, không mất hay lộ dữ liệu, và bổ sung câu chữ sau này rất rẻ.
  file: `packages/core/src/confirmation/dung.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
