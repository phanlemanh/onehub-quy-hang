# Review findings: lien-he-khach (round 2)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 4 (âm tính đứng một mình): ca ghi xuyên sàn bằng hàm vẫn qua dù bỏ lọc công ty, và không có ca đối chứng dương**
  Người dùng thấy gì: Bài kiểm việc sàn khác không được ghi vào nhu cầu khách của sàn này chưa chứng minh chắc chắn là chính luật cách ly đang chặn. Hiện chưa thấy khách nào bị lộ hay bị ghi nhầm, chỉ là bằng chứng kiểm còn mỏng.
  Căn cứ: Không có dữ liệu nào bị mất hay lộ, chỉ là bài kiểm chưa đủ sắc; bổ sung ca kiểm sau này rẻ và không ảnh hưởng người dùng đang dùng.
  file: `packages/db/tests/isolation.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính đứng một mình): dòng «đầu khách giữ đã mất vai» qua cột Lần gửi–căn mà không cần tới luật, vì không có dữ liệu**
  Người dùng thấy gì: Với đầu khách đã mất vai, bài kiểm chưa thật sự thử xem họ có còn thấy danh sách căn trong Lần gửi hay không vì không có căn mẫu nào để thử. Chưa có dấu hiệu họ thấy được, chỉ là chưa được kiểm chứng ở ô này.
  Căn cứ: Không có hậu quả đã xảy ra với người dùng và các ô khác của ma trận vẫn đo được; thêm dữ liệu mẫu sau này là việc rẻ.
  file: `packages/db/tests/isolation.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hinh 4 (am-tinh mot minh, khong ghim thong diep): create_share duoi san B chap nhan hai thong diep, dong TN thoat o kiem vai (r1 · tệp đã đổi)**
  Người dùng thấy gì: Mot phep thu cach ly giua hai san co the xanh vi mot ly do khac, nen khong chac do dung dieu no tuyen bo. Nguoi dung van khong thay khac gi, vi cac phep thu ben canh da bao ve phan con lai.
  Căn cứ: Khong mat hay lo du lieu cua nguoi dung, chi la bai thu chua that chat; sua sau re va co the lam bat cu luc nao.
  file: `packages/db/tests/isolation.test.mjs`
  severity: low
  Đề xuất: known-limits

- **Hinh 4 (am-tinh mot minh, khong ghim thong diep): bang 'Lan gui bi tu choi' chi so ma 400, doi chung duong khong cung nguoi, cung khan gia (r1)**
  Người dùng thấy gì: Khi gui bo can bi tu choi, bai thu chi kiem la bi tu choi chu khong kiem dung ly do. Nguoi dung van bi chan dung cac ca khong hop le.
  Căn cứ: Hau qua nhe: khong lo du lieu, nguoi dung van duoc chan dung; chi la bai thu co the bo sot mot ly do tu choi sai, sua sau re.
  file: `packages/api/test-db/lien-he-khach.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hinh 3 (assert 'chuoi co mat' trong khi loi hua la QUAN HE): 'tai lieu khop loi' do dong-xuat-hien tu, khong do quan he (r1)**
  Người dùng thấy gì: Bai kiem tai lieu chi xem cac tu khoa co mat, khong xem cau co noi dung dung hay khong. Nguoi dung khong bi anh huong, chi rui ro tai lieu sai y van lot qua.
  Căn cứ: Chi anh huong chat luong tai lieu, khong cham du lieu hay chuc nang; nguoi doc review phat hien duoc va sua re.
  file: `packages/core/src/contacts/prospects.test.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
