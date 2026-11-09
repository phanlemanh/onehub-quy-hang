# Review findings: va-bang-hang-cot-thap-tang-khi-loc-rong (round 2)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Đổi luật bộ cột của Bảng hàng khi lọc ra rỗng nhưng không sửa Tham chiếu**
  Người dùng thấy gì: Tài liệu sản phẩm vẫn ghi cột không dùng thì không hiện, trong khi màn nay giữ cột lúc lọc ra rỗng. Người đọc tài liệu có thể hiểu sai cách bảng hoạt động.
  Căn cứ: Chỉ lệch chữ trong tài liệu, không ảnh hưởng người dùng bảng, không mất dữ liệu và sửa lại rất rẻ bằng một dòng ghi chú.
  file: `apps/web/src/app/(app)/inventory/bang-hang.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): việc màn bỏ bộ cột đang giữ khi áp góc nhìn chỉ được đo bằng tìm chuỗi trong mã nguồn**
  Người dùng thấy gì: Bài kiểm có thể vẫn báo đạt dù sau này việc bỏ bộ cột cũ khi mở góc nhìn bị hỏng. Khi đó người dùng có thể thấy bảng mở ra với bộ cột sai.
  Căn cứ: Hiện màn chạy đúng, rủi ro chỉ xảy ra nếu sau này có người sửa nhầm; người dùng tải lại là hết, và đã có bài nhìn màn đo phía ngoài.
  file: `apps/web/src/app/(app)/inventory/cot-khi-loc-rong.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (viết tay đúng khuôn bên đọc, không round-trip): vòng nhớ `giu` do bài kiểm tự viết, đường ghi nhớ thật của màn không có phép đo nào bắt**
  Người dùng thấy gì: Nếu phần ghi nhớ bộ cột của màn bị mất, bài kiểm vẫn xanh và cột có thể biến mất khi lọc ra rỗng. Người dùng sẽ lại gặp lỗi cũ là ô lọc đang gõ biến mất.
  Căn cứ: Màn hiện đúng nên chưa ai gặp lỗi; nếu hỏng thì người dùng chỉ mất cột tạm thời, xoá bộ lọc là bảng trở lại, không mất dữ liệu.
  file: `apps/web/src/app/(app)/inventory/cot-khi-loc-rong.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): E1 khai «từng phím» nhưng bảng ca nhảy thẳng tới giá trị cuối, không có bước tiền tố nào**
  Người dùng thấy gì: Khi người dùng gõ từng ký tự, có bước giữa chừng cột Tầng biến mất rồi mới rỗng, nhưng bài kiểm không thử các bước đó. Có thể có nháy cột thoáng qua lúc gõ mà chưa ai kiểm.
  Căn cứ: Hậu quả nhẹ và tạm thời, chỉ là cột nháy khi đang gõ, tự hết khi gõ tiếp hoặc xoá; không mất dữ liệu.
  file: `_acceptance/va-bang-hang-cot-thap-tang-khi-loc-rong/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 6 (đo chỗ cố định thay vì cây đang kiểm): E5 nhận bất kỳ máy dev nào đang nghe cổng 3496, không xác minh máy đó chạy từ worktree đang chấm (r1)**
  Người dùng thấy gì: Bài nhìn màn có thể vô tình chụp một bản chạy cũ từ nơi khác, làm kết quả nghiệm thu trông đúng dù bản đang chấm chưa được nhìn. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ ảnh hưởng độ tin cậy của bước kiểm nội bộ, chưa thấy lệch thật, và người kiểm có thể tự tắt máy cũ rồi chạy lại nên nhẹ.
  file: `_acceptance/va-bang-hang-cot-thap-tang-khi-loc-rong/thu/dung.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
