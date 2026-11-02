# Review findings: va-che-vung-anh (round 2)

## Trong hợp đồng

- **E4 chấm ĐẠT nhưng không lưu số đo màu điểm ảnh nào ở bốn điểm dò; báo cáo nhắc tới «số đo pixel ở bên dưới» mà con số đó không có ở đâu**
  file: `_acceptance/va-che-vung-anh/evidence/E4-network.txt:1`
  severity: medium
  AC: AC-4
  source: bugs
  detail: Kết quả mong đợi của E4 (evals.yaml) cần: s < 1, ghi lại điểm dò phân biệt được bản đúng với bản lỗi, và giá trị RGBA đọc bằng getImageData tại các điểm 0,5 · 0,78 · 0,82 · 0,15 (0,5 và 0,78 phải đen với R,G,B ≤ 10; 0,82 và 0,15 không đen). Trong evidence của E4 chỉ có E4-network.txt và ba ảnh PNG (E4-step1, E4-step2, E4-keo). Không có tệp số đo, không có RGBA, không ghi s, cũng không ghi điểm dò phân biệt. Đã grep cả .acceptance-runs/va-che-vung-anh (s4-args-r1/r2): cũng không có. Phần observed của E4 trong evidence-report.md kết bằng «Mép đen khớp với số đo pixel ở bên dưới», nhưng bên dưới không có số đo nào. Cả lần chấm dựa vào việc ước toạ độ trên ảnh chụp, khoảng 386–638 × 215–551. Bản lỗi sẽ cho khối đen lệch khoảng 6px (s ≈ 420,5/450 ≈ 0,93), nên mắt khó phân biệt qua ảnh chụp, đúng kiểu sai mà getImageData ở điểm 0,78 được đặt vào để bắt. Hệ quả là E4 ĐẠT trong khi phần số đo bắt buộc vắng hẳn, và câu trong báo cáo khẳng định có số đo là sai sự thật. Cần chạy lại E4 và lưu RGBA bốn điểm cùng s vào evidence (ví dụ E4-measure.json).

- **E2 chấm ĐẠT mà không lưu số đo khung nào, trong khi kết quả mong đợi gồm các mục chỉ kiểm được bằng con số**
  file: `_acceptance/va-che-vung-anh/evidence/E2-network.txt:1`
  severity: medium
  AC: AC-2
  source: bugs
  detail: Các bước của E2 yêu cầu, với từng ảnh, ghi lại khung chữ nhật của hộp, canvas và nút «Lưu bản che», cùng canvas.width × canvas.height và tỉ lệ hiển thị so với tỉ lệ ảnh. Kết quả mong đợi gồm: tỉ lệ khớp trong sai số 1%, đáy canvas ≤ đỉnh nút, hộp nằm trọn trong cửa sổ, hộp rộng hơn 384px, ảnh nhỏ hiện đúng 400×300; mỗi ảnh × mỗi mục phải có một dòng đạt/trượt. Evidence của E2 chỉ có sáu ảnh PNG và E2-network.txt (danh sách request, không có phần console). Không có tệp số đo như E3-measure.json hay E5-raw.json. Phần observed trong evidence-report.md ghi «canvas 800×600», «960×192», «400×300»: đây là chữ in sẵn trên ảnh thử hoặc ước từ ảnh chụp, không phải số đo bằng getBoundingClientRect. Bảng đạt/trượt theo từng ảnh × từng mục cũng không có. Ngoài ra, ngay lượt trước đã có một finding cho biết đo bằng getBoundingClientRect sẽ ra 402×302 cho ảnh nhỏ (vì cộng viền 2px), nhưng E2 vẫn ghi ĐẠT mà không có con số nào cho thấy mục đó đã được đo hay đã nới chuẩn. Hệ quả: các mục tỉ lệ 1% và «ảnh nhỏ không phóng to» được chấm ĐẠT mà không có dữ liệu. Ngoài ra, E2-network.txt không chụp console, nên dòng «network_observed: clean» không có căn cứ cho phần lỗi console.

- **Hình dạng 3 (assert sự có mặt thay vì quan hệ): E4 kết luận ĐẠT mà không có RGBA, không có hệ số co s, không ghi điểm dò tách bản đúng với bản lỗi**
  file: `_acceptance/va-che-vung-anh/evidence/E4-network.txt:1`
  severity: medium
  AC: AC-4
  source: measurement
  detail: evals.yaml:50 đặt lời hứa của E4 là quan hệ giữa các con số: s = r.width/canvas.width < 1; RGBA tại bốn điểm dò 0,5 · 0,78 · 0,82 · 0,15 (theo phân số × canvas.width/height), trong đó 0,5 và 0,78 phải đen (R,G,B ≤ 10), 0,82 và 0,15 không đen; thêm bước dò trước phải ghi lại điểm tách được bản đúng với bản lỗi «không chia tỉ lệ», không thì trượt với «thước không phân biệt được». Bằng chứng E4 trong cây chỉ có E4-network.txt (danh sách request), E4-step1.png, và E4-keo.png = E4-step2.png (hai tệp trùng byte, cùng 26839 B). Không tệp nào chứa getImageData/RGBA, canvas.width × canvas.height, rect của canvas hay s. Phần observed của E4 (evidence-report.md:69-71) chỉ ước lượng bằng mắt trên ảnh chụp («khoảng x 386–638 và y 215–551»), chép «1 vùng che», rồi viết «Mép đen khớp với số đo pixel ở bên dưới», nhưng bên dưới không có số đo nào. Như vậy phép đo co lại thành «có một khối đen và có chữ 1 vùng che», trong khi lời hứa là vị trí của vùng che so với cỡ vẽ. Bước đối chứng phân biệt (gap-probe P1, «fixed») cũng không để lại dấu vết. Đây chính là chỗ gap-probe đã cảnh báo lệch khoảng 20px có thể lọt qua: mép phải của bản lỗi ở khoảng 0,743 và của bản đúng ở 0,8, tức chỉ chênh khoảng 24px trên màn. Bằng chứng cũng không cho thấy ảnh dùng ở E4 là ảnh dọc 1500×2000 của E2 như bước 1 đòi: E2 chạy trên căn A-04.06, còn E4 mở ảnh e59c887b của căn B-15.05 và không ghi kích thước canvas.

- **Hình dạng 3 (assert sự có mặt thay vì quan hệ) lẫn hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E2 không ghi rect nào; «hiện 400×300» và cỡ canvas lấy từ nhãn vẽ sẵn trong ảnh thử và thuộc tính canvas.width**
  file: `_acceptance/va-che-vung-anh/evidence/E2-nho.png:1`
  severity: medium
  AC: AC-2
  source: measurement
  detail: evals.yaml:26 hứa các quan hệ hình học cho cả bốn ảnh: canvas trọn trong hộp theo bốn cạnh; đáy canvas ≤ đỉnh nút «Lưu bản che»; hộp trọn trong cửa sổ; tỉ lệ hiển thị rect.width/rect.height bằng tỉ lệ ảnh với sai số 1%; ảnh nhỏ hiện đúng 400×300; hộp rộng hơn 384px. Yêu cầu là một đạt/trượt cho mỗi cặp ảnh × mục, và bước 2 bắt ghi getBoundingClientRect của hộp, canvas và nút. Bằng chứng E2 trong cây chỉ có sáu PNG và E2-network.txt. Không có tệp đo nào kiểu E2-measure.json, trong khi E3 có E3-measure.json, nên không có rect nào để kiểm các quan hệ trên. Observed của E2 (evidence-report.md:47-48) dựa vào hai nguồn không phải đầu ra hiển thị. (1) Chữ «nho 400x300», «ngang 2000x1500», «doc 1500x2000», «rong 3000x600» được vẽ sẵn lên chính ảnh thử (thấy rõ trên E2-nho.png), nên luôn hiện bất kể canvas có bị phóng to hay không. Câu «canvas «nho 400x300» hiện 400×300 (không phóng to)» vì vậy đọc lại nhãn của fixture chứ không đo cỡ hiển thị. (2) Các số «800×600», «450×600», «960×192» là canvas.width × canvas.height, tức cỡ vẽ, không phải rect hiển thị. Vì thế phép so tỉ lệ hiển thị với sai số 1%, quan hệ đáy canvas ≤ đỉnh nút và «hộp > 384px» không được đo, chỉ được xác nhận bằng mắt với câu «khớp Expected». Không có bảng đạt/trượt cho từng ảnh × mục. E2-step2.png cũng trùng byte với E2-ngang.png (cùng 58361 B).

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Trần cao khung vẽ dùng dvh, trong khi kho đang dùng svh cho trần cao theo màn (r1)**
  Người dùng thấy gì: Trên điện thoại, hộp che có thể đổi cỡ một chút khi thanh địa chỉ của trình duyệt hiện hoặc ẩn lúc đang mở. Che vùng vẫn dùng được và không mất dữ liệu.
  Căn cứ: Hậu quả nhẹ, chỉ là khung đổi cỡ nhẹ theo thanh địa chỉ. Không mất dữ liệu, người dùng không cần làm gì để dùng tiếp, và trình che sẽ chuyển sang ngăn nổi ở hàng sau nên không đáng sửa riêng.
  file: `apps/web/src/app/(app)/units/photos/redact/trinh-che.tsx`
  severity: low
  Đề xuất: known-limits

- **Kiểm ranh giới bỏ sót tệp ngoài vùng khi tệp đó bị dời (rename) vào trong vùng (r1)**
  Người dùng thấy gì: Công cụ kiểm có thể báo đạt dù một tệp ngoài phạm vi bị dời vào vùng được phép. Người dùng không thấy ảnh hưởng nào, chỉ là lưới an toàn nội bộ hở một góc.
  Căn cứ: Không ảnh hưởng người dùng cuối và hiện không có tệp nào bị dời như vậy. Người duyệt PR vẫn nhìn thấy thay đổi, nên ghi lại là đủ.
  file: `_acceptance/va-che-vung-anh/thu/ranh-gioi.mjs`
  severity: low
  Đề xuất: known-limits

- **E2 đo ảnh nhỏ bằng getBoundingClientRect (tính cả viền) nhưng đòi đúng 400×300, nên sẽ trượt oan (r1)**
  Người dùng thấy gì: Bài kiểm có thể chấm trượt oan một bản vá đúng vì đo cả viền 2 điểm ảnh. Người dùng không thấy gì khác, chỉ là người chấm phải tự nới chuẩn khi đo.
  Căn cứ: Không ảnh hưởng người dùng cuối. Chỉ có thể gây một lần chấm trượt oan, và người chấm tự nhận ra rồi chạy lại hoặc nới chuẩn được.
  file: `_acceptance/va-che-vung-anh/evals.yaml`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 4/4 lỗi rơi vào file không bộ đo nào phủ (_acceptance/va-che-vung-anh/evidence/E4-network.txt, _acceptance/va-che-vung-anh/evidence/E2-network.txt, _acceptance/va-che-vung-anh/evidence/E2-nho.png) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
