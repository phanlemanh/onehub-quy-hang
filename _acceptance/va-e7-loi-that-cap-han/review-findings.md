# Review findings: va-e7-loi-that-cap-han (round 2)

## Trong hợp đồng

- **Hình dạng 3: kiểm chuỗi có mặt trong khi lời hứa là quan hệ (thân phản hồi khung 3 lấy từ GET thật)**
  file: `_acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs:44`
  severity: medium
  AC: AC-3
  source: measurement
  detail: AC-3 hứa một quan hệ: thân phản hồi PATCH ở khung 3 phải lấy từ GET thật. Nhánh --nguon chỉ kiểm từng chuỗi riêng lẻ có trong mã nguồn chay-ui.mjs: `/await api\(\)/.test(nguon)` (dòng 45, gọi là đối chứng dương), `/__thanTuGet/.test(nguon)` (dòng 52), cộng một danh sách cấm gồm `__traGia` và chuỗi chứa «— cặp về mặc định» (dòng 44). Không có kiểm nào nối hai thứ lại, tức là không thấy giá trị gán cho `window.__thanTuGet` được dựng từ kết quả `api()`. Đối chứng dương `await api()` đã đúng sẵn nhờ những lời gọi không liên quan ở khung 1 (`const g1 = await api();`, dòng 144 của chay-ui.mjs) và khung 2 (dòng 168). Ví dụ cụ thể: `window.__thanTuGet = JSON.stringify({items: [], errors: ["lead_routing.first_call_minutes 10 không nhỏ hơn …"]})` là câu lỗi gõ tay không chứa «— cặp về mặc định», nhưng vẫn qua --nguon với «nguồn ĐẠT». Lượt chạy thật E1 cũng không bù được: kiem-e7 chấm `k3.errorsTuGetThat`, mà giá trị này do chính chay-ui tự in ra từ biến `getThat` (dòng 187). Không có lần ghi lại nào cái thân thật sự được trả cho trang để so với GET, vì `__phanHoi` không ghi khi `__thanTuGet` được đặt (dòng 42–44 của chay-ui.mjs). Chiều đỏ E3b chỉ đỏ được nhờ tên biến cũ `__traGia`; đổi tên biến là thước này không còn phân biệt được.
  rationale: AC-3 đòi thân phản hồi khung 3 lấy từ GET thật, mà phép kiểm chỉ dò chuỗi riêng lẻ nên một câu lỗi gõ tay không chứa chuỗi cấm vẫn qua, tức lời hứa quan hệ của AC-3 chưa được chứng minh.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Phản hồi PATCH thật được ghi vào window.__phanHoi trong try/catch rỗng nhưng không chỗ nào đọc lại; comment đầu tệp hứa có bản ghi này**
  Người dùng thấy gì: Bằng chứng của bài kiểm có một câu mô tả hứa lưu lại phản hồi thật của máy chủ, nhưng thực tế không lưu. Người đọc hồ sơ có thể tưởng có bản ghi đó, còn kết luận đạt hay không đạt thì không bị ảnh hưởng.
  Căn cứ: Chỉ gây hiểu nhầm nhẹ khi đọc hồ sơ bằng chứng, không làm sai kết luận chấm và không ảnh hưởng người dùng cuối; sửa sau rẻ nhưng không gấp.
  file: `_acceptance/luat-chia-lead-cap-han-hong/thu/chay-ui.mjs`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
