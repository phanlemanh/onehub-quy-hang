# Review findings: nhap-loi-tat-dinh (round 1)

## Trong hợp đồng

- **validatePlan ném lỗi khi gặp khoá tham số trùng tên thuộc tính của Object.prototype, thay vì trả về lỗi theo đường**
  file: packages/core/src/import/plan.ts:62
  severity: medium
  AC: AC-6
  source: conventions
  detail: Trong kiemPhep có `const nhan = cho[k]`, với `cho = TRANSFORM_PARAMS[name]` là object literal thường. Khi khoá là `toString`, `constructor` hay `hasOwnProperty`, `cho[k]` lấy hàm kế thừa từ prototype nên được coi là truthy, rồi `nhan.includes(v)` ném TypeError. Đã chạy thử: kế hoạch có `transform: {name:"status", params:{toString:"x"}}` làm validatePlan ném `nhan.includes is not a function`. Hàm này là cửa kiểm cho kế hoạch đến từ bên ngoài (tác tử hàng 68, người ở màn xem trước). Khuôn của kho (ADR-0008, validatePayload) yêu cầu khoá lạ ra lỗi `{path, reason: "khoá lạ"}`, không được làm sập. AC-6 cũng đòi «mỗi kế hoạch hỏng ra lỗi nêu đúng đường». Cách sửa: tra bằng `Object.hasOwn(cho, k)`, hoặc đổi bảng tham số sang Map hay object `Object.create(null)`.
  rationale: AC-6 đòi kế hoạch hỏng (khoá lạ ở phép, tham số sai) ra lỗi nêu đúng đường; ở đây kiểm khuôn sập thay vì trả lỗi.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **applyPlan sập khi một ô trong file trùng tên thuộc tính của prototype, ở cột có valueMap**
  Người dùng thấy gì: Nếu trong file khách tải lên có một ô chỉ ghi đúng một vài từ đặc biệt của hệ thống (ví dụ «constructor») ở cột đã có bảng quy đổi giá trị, cả lần nhập bị hỏng thay vì chỉ đánh dấu ô đó cần người xem.
  Căn cứ: Hiếm gặp trong file thật nhưng khi gặp thì hỏng trọn lần nhập, không mất dữ liệu đã lưu vì lõi chưa ghi gì, người dùng nhập lại sau khi sửa ô được; sửa sớm rẻ hơn nhiều so với sửa sau khi đã có đường ghi.
  file: `packages/core/src/import/normalize.ts`
  severity: medium
  Đề xuất: new-contract

- **Kiểm khuôn nhận kế hoạch có hai cột cùng một trường chuẩn, nên cột thứ hai thoát luật cấp dòng**
  Người dùng thấy gì: Nếu một kế hoạch ghép hai cột của file vào cùng một trường (ví dụ hai cột mã căn), cột thứ hai không bị đối chiếu danh mục hay kiểm trùng, nên có thể lọt giá trị chưa được soát.
  Căn cứ: Kế hoạch do máy dựng từ từ điển đã tự tránh trường hợp này, và hiện chưa có bước ghi nên chưa có dữ liệu sai nào được lưu; cần xử lý trước khi cho tác tử hay người tự chỉnh kế hoạch.
  file: `packages/core/src/import/plan.ts`
  severity: medium
  Đề xuất: known-limits

- **Kiểm khuôn không đối chiếu lớp của cột với lớp của đích, nên cột nguồn có thể được ghép vào trường có trần ra ngoài**
  Người dùng thấy gì: Một cột chứa thông tin chủ nhà có thể bị ghép nhầm vào trường được phép chia sẻ ra ngoài, và hệ thống chưa tự chặn việc ghép đó ở bước kiểm kế hoạch.
  Căn cứ: Đây là lớp thông tin chủ nhà không được rời công ty nên hậu quả có thể nặng khi bước ghi dữ liệu ra đời; hiện chưa rò vì chưa có bước ghi, nên xử lý được gọn trong việc ghi dữ liệu kế tiếp.
  file: `packages/core/src/import/plan.ts`
  severity: low
  Đề xuất: new-contract

- **Đọc bảng nuốt mất dòng dữ liệu đầu tiên vì tưởng là tầng tiêu đề thứ hai (mọi CSV có một ô tiêu đề trống)**
  Người dùng thấy gì: Khi file có một cột không đặt tên ở dòng tiêu đề, dòng hàng đầu tiên có thể bị nhận nhầm là tiêu đề và biến mất khỏi danh sách mà không báo, kéo theo các cột bị ghép sai.
  Căn cứ: Mất lặng lẽ một căn hàng và hỏng cách nhận cột là hậu quả nặng, mà người dùng khó phát hiện; file có cột không tên khá phổ biến nên nên sửa bằng việc riêng trước khi cho nhập thật.
  file: `packages/core/src/import/grid.ts`
  severity: high
  Đề xuất: new-contract

- **Điều kiện phí tách từ ô Giá đáy ghi đè điều kiện phí của Giá chào, không báo xung đột**
  Người dùng thấy gì: Khi giá chào và giá đáy cùng ghi điều kiện phí khác nhau, phí của căn có thể lấy theo giá đáy của chủ nhà thay vì giá chào, và không có cảnh báo cần người xem.
  Căn cứ: Chỉ xảy ra khi cả hai ô giá cùng kèm điều kiện phí khác nhau, và người soát ở màn xem trước vẫn sửa lại được; sai lệch nằm ở một ô phí chứ không lan sang dữ liệu khác.
  file: `packages/core/src/import/apply.ts`
  severity: medium
  Đề xuất: known-limits

- **validatePlan chấp nhận hai cột cùng một đích và phép không hợp với trường; áp kế hoạch vẫn ra «giữ nguyên» với giá trị sai kiểu**
  Người dùng thấy gì: Kế hoạch ghép sai, như hai cột cùng một trường hoặc dùng cách đọc không hợp với trường, vẫn được chấp nhận và ô ra giá trị chữ ở chỗ đáng lẽ là số mà không báo cần người.
  Căn cứ: Kế hoạch do máy dựng từ từ điển không rơi vào ca này; chỉ lộ ra khi tác tử hay người tự chỉnh kế hoạch, và hiện chưa lưu gì nên tự gỡ được bằng cách làm lại.
  file: `packages/core/src/import/plan.ts`
  severity: medium
  Đề xuất: known-limits

- **Phép tầng và phòng ngủ: đường chữ không kiểm khoảng, cùng giá trị cho kết quả khác đường số**
  Người dùng thấy gì: Số tầng hay số phòng ngủ vô lý viết dạng chữ (ví dụ tầng 250) được nhận như đúng, còn viết dạng số thì được đánh dấu cần người xem.
  Căn cứ: Giá trị vô lý nhưng hiếm, chỉ sai ở một ô và không ảnh hưởng thông tin chủ nhà; người dùng sửa được ở màn xem trước và sửa sau rẻ.
  file: `packages/core/src/import/transforms.ts`
  severity: medium
  Đề xuất: known-limits

- **Giá dạng chữ vượt 1.000 tỷ hay bằng 0 ra «cần người» thay vì «chặn» như đường số**
  Người dùng thấy gì: Giá ghi bằng chữ quá lớn hoặc bằng 0 được chuyển cho người xem lại thay vì bị chặn thẳng như giá ghi bằng số.
  Căn cứ: Giá sai vẫn không đi tiếp mà được người xem lại nên không có hậu quả thật cho người dùng; chỉ khác cách gắn nhãn, chi phí sửa không đáng.
  file: `packages/core/src/import/transforms.ts`
  severity: low
  Đề xuất: wont-fix

- **Số nền bỏ qua dòng bị mất: dòng đáp án không có trong kết quả áp kế hoạch không bị tính lỗi**
  Người dùng thấy gì: Các con số đo chất lượng nhập dùng để quyết định bước sau có thể đẹp hơn thực tế nếu có dòng bị mất trọn khi đọc file, vì dòng mất không bị tính là lỗi.
  Căn cứ: Không ảnh hưởng dữ liệu người dùng, chỉ làm số đo có thể lạc quan; trên các file thử hiện tại chưa mất dòng nào nên số hiện có vẫn tin được.
  file: `packages/core/test/import/do.ts`
  severity: medium
  Đề xuất: known-limits

- **Nhánh nhận số điện thoại mất số 0 đầu là mã chết; ô ấy bị gắn nhãn số giấy tờ**
  Người dùng thấy gì: Số điện thoại bị mất số 0 đầu vẫn được nhận là thông tin cá nhân nhưng bị ghi nhầm loại là số giấy tờ.
  Căn cứ: Ô vẫn bị chặn như thông tin cá nhân nên không lộ gì; chỉ lời giải thích hiện cho người dùng có thể ghi nhầm loại, sửa sau rẻ nhưng ít giá trị.
  file: `packages/core/src/import/detect.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình 5 (đếm không viết trước): ca «áp kế hoạch dùng cùng bộ» có mẫu số do chính mã đang kiểm quyết định, phép đếm luôn bằng nhau**
  Người dùng thấy gì: Phép kiểm tự động chưa chắc bắt được trường hợp ai đó viết riêng một cách đọc giá khác cách đọc chung, nên khó phát hiện nếu hai nơi dần lệch nhau.
  Căn cứ: Không ảnh hưởng người dùng hôm nay vì hiện hai nơi đang dùng chung một bộ; rủi ro là về sau thay đổi mã mà không bị kiểm bắt, sửa bộ kiểm lúc nào cũng rẻ.
  file: `packages/core/src/import/normalize.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình 3 (assert khuôn chữ thay cho quan hệ): ca «danh mục lệch và trùng mã» nhận cả hai toà, kể cả chính giá trị sai của file**
  Người dùng thấy gì: Phép kiểm tự động chấp nhận lý do cảnh báo ghi cả hai toà mà không so với toà đúng trong danh mục, nên có thể không bắt được lời giải thích sai.
  Căn cứ: Hành vi hiện tại vẫn đúng trên ca thử; chỉ là lưới an toàn thưa, không mất dữ liệu người dùng và gia cố sau rẻ.
  file: `packages/core/src/import/apply.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 (assert «có mặt» thay cho quan hệ đếm): danh sách cấm của hồ sơ cột chỉ được kiểm bằng some(), không bằng con số tính từ đáp án**
  Người dùng thấy gì: Phép kiểm tự động chỉ xác nhận có vài mẫu thông tin chủ nhà bị chặn, chưa chắc mọi mẫu đã cấy đều được kiểm.
  Căn cứ: Vì liên quan thông tin chủ nhà nên đáng gia cố, nhưng chưa có bằng chứng rò thật và có một phép đo riêng đang đếm số lọt; sửa bộ kiểm rẻ.
  file: `packages/core/src/import/profile.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 1 (đo đáp án thay vì đầu ra): ca «bộ thử: chỉ dữ liệu mẫu» kiểm tên người trên đáp án chứ không trên file sinh ra**
  Người dùng thấy gì: Phép kiểm chưa soi trực tiếp file thử được tạo ra, nên nếu có tên người thật lọt vào file thử thì có thể không bị phát hiện.
  Căn cứ: Chưa có bằng chứng tên thật nào đã lọt vào; hậu quả chỉ tới kho nội bộ và sửa bộ kiểm rẻ, nhưng chạm vào quy tắc không dùng dữ liệu cá nhân thật.
  file: `packages/core/src/import/bo-thu.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 5 (tuyên quét cả lớp nhưng chỉ kiểm vài điểm) kèm hình 4 (không có đối chứng dương): ca «bộ sinh không nhập mã đang kiểm»**
  Người dùng thấy gì: Phép kiểm bảo đảm bộ tạo file thử độc lập với mã đang kiểm chỉ quét hai tệp cố định, nên tệp thử thêm sau này có thể không bị quét.
  Căn cứ: Không ảnh hưởng người dùng; chỉ là lưới an toàn thưa cho người phát triển, sửa sau rẻ.
  file: `packages/core/src/import/bo-thu.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 (assert «có mặt» thay cho quan hệ): «target cho mọi cột» chỉ kiểm mảng không rỗng, không so với số cột của file**
  Người dùng thấy gì: Phép kiểm chưa đếm xem đáp án có đủ đích cho mọi cột, nên đáp án thiếu vài cột cuối vẫn có thể lọt.
  Căn cứ: Không ảnh hưởng người dùng; chỉ làm bộ thử kém chặt, và sửa bằng một phép đếm đơn giản lúc nào cũng được.
  file: `packages/core/src/import/bo-thu.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình 4 (kiểm âm tính một mình): ca «phân loại: cột hai file mẫu» xanh rỗng khi không tìm thấy file mẫu nào**
  Người dùng thấy gì: Nếu sau này tên hai file mẫu đổi hay bị bỏ, phép kiểm phân loại cột sẽ vẫn báo xanh dù không kiểm gì.
  Căn cứ: Hôm nay phép kiểm vẫn chạy đủ nên không có hậu quả; chỉ là rủi ro về sau, thêm một phép đếm là xong.
  file: `packages/core/src/import/classify.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
