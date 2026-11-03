# Review findings: lien-he-khach (round 1)

## Trong hợp đồng

- Hình 5 (quét LỚP nhưng chỉ có điểm-case): 'vai API không ghi thẳng bốn bảng' thiếu insert share_listings, ma trận không đếm
  AC: AC-2
  file: `packages/db/tests/isolation.test.mjs:2068`
  severity: medium
  source: measurement
  detail: Tên ca và evals.yaml E2 hứa 'insert, update, delete đều permission denied' trên bốn bảng (prospects, prospect_events, shares, share_listings) = 12 ô. Danh sách SQL trong vòng for chỉ có 11 câu: share_listings chỉ có update và delete, KHÔNG có 'insert into share_listings ...'. Vòng lặp cũng không đếm số lần so với số phần tử viết trước (không có assert.equal(số, 12)). Nếu migration 021 lỡ grant insert trên share_listings cho quy_hang_app, ca vẫn xanh. Đây là tuyên bố quét cả lớp (bốn bảng x ba lệnh) nhưng ma trận viết tay thiếu một phần tử và không có phép đếm ghim kích thước.
  rationale: AC-2 nêu rõ vai API không ghi thẳng bốn bảng; ma trận thiếu lệnh insert trên bảng căn của Lần gửi nên không chứng minh được điều AC-2 hứa.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hinh 4 (am-tinh mot minh, khong ghim thong diep): create_share duoi san B chap nhan hai thong diep, dong TN thoat o kiem vai**
  Người dùng thấy gì: Mot phep thu cach ly giua hai san co the xanh vi mot ly do khac, nen khong chac do dung dieu no tuyen bo. Nguoi dung van khong thay khac gi, vi cac phep thu ben canh da bao ve phan con lai.
  Căn cứ: Khong mat hay lo du lieu cua nguoi dung, chi la bai thu chua that chat; sua sau re va co the lam bat cu luc nao.
  file: `packages/db/tests/isolation.test.mjs`
  severity: low
  Đề xuất: known-limits

- **Hinh 4 (am-tinh mot minh, khong ghim thong diep): bang 'Lan gui bi tu choi' chi so ma 400, doi chung duong khong cung nguoi, cung khan gia**
  Người dùng thấy gì: Khi gui bo can bi tu choi, bai thu chi kiem la bi tu choi chu khong kiem dung ly do. Nguoi dung van bi chan dung cac ca khong hop le.
  Căn cứ: Hau qua nhe: khong lo du lieu, nguoi dung van duoc chan dung; chi la bai thu co the bo sot mot ly do tu choi sai, sua sau re.
  file: `packages/api/test-db/lien-he-khach.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hinh 3 (assert 'chuoi co mat' trong khi loi hua la QUAN HE): 'tai lieu khop loi' do dong-xuat-hien tu, khong do quan he**
  Người dùng thấy gì: Bai kiem tai lieu chi xem cac tu khoa co mat, khong xem cau co noi dung dung hay khong. Nguoi dung khong bi anh huong, chi rui ro tai lieu sai y van lot qua.
  Căn cứ: Chi anh huong chat luong tai lieu, khong cham du lieu hay chuc nang; nguoi doc review phat hien duoc va sua re.
  file: `packages/core/src/contacts/prospects.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
