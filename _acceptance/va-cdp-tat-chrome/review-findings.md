## Trong hợp đồng

- **Phép kiểm «công cụ in ra stderr (loi)» không bao giờ bắt được gì**
  AC: AC-2
  file: `_acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs:164`
  severity: medium
  source: bugs
  detail: `k.loi.replace(/[\s\S]*?lỗi thử của con[\s\S]*/, "")` khớp lười từ đầu chuỗi tới lần đầu gặp thông điệp, rồi `[\s\S]*` ăn hết phần còn lại. Hễ stderr có thông điệp lỗi là cả chuỗi bị xoá, nên mọi thứ công cụ in ra trước hay sau vết lỗi đều bị nuốt. Đã chạy thử: chuỗi 'TOOL WARNING\n' + vết lỗi Node cho ra "". Khi stderr không có thông điệp thì dòng 165 đã báo đỏ rồi. Vì vậy vế «loi: stderr chỉ có vết của lỗi con tự ném» của E2 không được đo thật, và ca loi xanh dù cdp.mjs có in thêm ra stderr. Cách sửa: chỉ bỏ đúng khối vết lỗi của Node (dòng nguồn + 'Error: lỗi thử của con' + các dòng 'at …' + 'Node.js v…'), rồi đòi phần còn lại rỗng.

- **Hình dạng 4 (kiểm âm tính đứng một mình): kiểm «công cụ in ra stderr (loi)» không bao giờ đỏ được**
  AC: AC-2
  file: `_acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs:164`
  severity: medium
  source: measurement
  detail: Dòng 164: `k.loi.replace(/[\s\S]*?lỗi thử của con[\s\S]*/, "").trim()`. Biểu thức không neo, nên khớp ngay từ vị trí 0: `[\s\S]*?` nuốt mọi thứ đứng trước câu «lỗi thử của con», còn `[\s\S]*` nuốt mọi thứ đứng sau. Hễ stderr có câu lỗi của con (dòng 165 cũng đòi điều này) thì phép thay xoá sạch cả chuỗi, kết quả luôn rỗng. Vì vậy lời hứa ở E2 «loi: stderr chỉ có vết của lỗi con tự ném» không được đo: công cụ có in thêm bất cứ gì vào stderr trước hay sau vết lỗi thì ca vẫn xanh. Cũng không có ca đối chứng nào cho thấy kiểm này đỏ được khi stderr có thêm chữ lạ. Kiểm chỉ kêu được khi stderr thiếu hẳn câu lỗi, mà trường hợp đó dòng 165 đã bắt rồi.

- **Hình dạng 4 (kiểm âm tính không đối chứng): ca (d) của mo-coi không tách được rào «ngoài thư mục tạm»**
  AC: AC-5
  file: `_acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs:225`
  severity: medium
  source: measurement
  detail: Dòng 225 tạo `dirD = path.join(RA, `ngoai-tmp-qh-b-chrome-${process.pid}`)`, tên gốc bắt đầu bằng «ngoai-tmp-» chứ không bằng tiền tố `qh-b-chrome-`. Trong cdp.mjs, `xoaDuoc` đòi đủ hai điều kiện: nằm ngay dưới thư mục tạm của hệ thống VÀ tên mang tiền tố. dirD trượt cả hai, nên chỉ riêng điều kiện tiền tố đã giữ nó lại. Nếu bỏ hẳn điều kiện «nằm dưới thư mục tạm» khỏi cdp.mjs, kiểm ở dòng 250 «xoá đường ngoài thư mục tạm» vẫn xanh. Phép đo tuyên kiểm rào «đường ngoài thư mục tạm» (E5 (d)), nhưng khẳng định «thư mục còn nguyên» không có biến đối chứng: thiếu một thư mục ngoài thư mục tạm mà tên ĐÚNG tiền tố, nên ca không phân biệt được bản thiếu rào này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Phần mở đầu evals.yaml tả bộ đo khác với cách nó chạy thật (con.mjs không in đường sổ; số ca của E7 sai)**
  Người dùng thấy gì: Phần mô tả bộ đo trong hồ sơ nghiệm thu viết lệch so với cách nó chạy thật, nên người ký có thể hiểu sai nhẹ. Kết quả đo không bị ảnh hưởng.
  Căn cứ: Chỉ là chữ mô tả lệch, không mất dữ liệu hay làm hỏng việc tắt Chrome, và sửa sau rất rẻ.
  file: `_acceptance/va-cdp-tat-chrome/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Bước dọn của bộ đo gọi process.kill không bọc try, có thể tự sập vì ESRCH sau khi đã kill cả nhóm**
  Người dùng thấy gì: Bộ đo có thể báo đỏ oan hoặc mất kết quả một số ca khi tiến trình vừa chết đúng lúc dọn. Chạy lại là hết.
  Căn cứ: Chỉ gây đỏ giả hiếm gặp, người ký thử lại được, không ảnh hưởng người dùng sản phẩm.
  file: `_acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs`
  severity: low
  Đề xuất: known-limits

- **Bước dọn của bài đo ném lỗi khi tiến trình vừa chết, làm sập cả lượt đo**
  Người dùng thấy gì: Bộ đo có thể dừng giữa chừng và báo đỏ oan khi Chrome tự thoát đúng lúc dọn. Người ký chạy lại là được.
  Căn cứ: Hậu quả nhẹ, chỉ gây đo lại, không mất dữ liệu và không đụng người dùng cuối.
  file: `_acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs`
  severity: low
  Đề xuất: known-limits

- **await chrome.dong() ở cấp trên cùng có thể làm script thoát sớm (mã 13), bỏ phần code phía sau**
  Người dùng thấy gì: Nếu sau này có chỗ chờ kết quả đóng Chrome ở đầu tệp, chương trình có thể dừng sớm mà không báo lỗi rõ. Hiện chưa chỗ nào dùng cách này.
  Căn cứ: Chưa có ai dính, tự lộ ra ngay khi viết và sửa sau rẻ.
  file: `_acceptance/bang-hang-kieu-sheet/thu/cdp.mjs`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
