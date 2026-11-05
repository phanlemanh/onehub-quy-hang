# Review findings: nhap-tac-tu-ke-hoach (round 1)

## Trong hợp đồng

- **The ai_processing agreement is rebuilt with hardcoded fields instead of the DB row, so mayFlow's validity, kind and direction checks prove nothing**
  file: `packages/api/src/imports/ai/store.ts:55`
  severity: medium
  AC: AC-4
  source: conventions
  detail: `docTinhTrang` selects only `id, status, data_classes, valid_from, approved_by`. `giaTriQuaThoaThuan` then builds the `Agreement` with hardcoded `validUntil: null`, `direction: "outbound"`, `counterparty: "anthropic"`, `kind: "ai_processing"` and `specialTerms: false`. That means the `kind`, `direction` and `validUntil` checks inside `mayFlow` always pass by construction. The existing pattern in `packages/api/src/catalog/feeds.ts` (lines 63-91) reads the full row (`valid_until`, `direction`, `counterparty`, `special_terms`) and passes the real record to `mayFlow`. As a result, an `ai_processing` agreement whose `valid_until` has passed still lets values flow to Anthropic. In addition, routes.ts:88 gates only on `status === 'active'`, and `mayFlow` runs only for columns that carry values. A package with only headers and shapes leaves the company without the agreement's validity window ever being checked. This breaks the rule that every connection is an agreement (ADR-0017), which mayFlow is supposed to enforce in full.
  rationale: AC-4 đòi chỉ gọi Claude khi thoả thuận đang hiệu lực và mỗi cột qua mayFlow đầy đủ; thoả thuận hết hạn vẫn cho dữ liệu đi là làm AC-4 thất bại.

- **Khuôn gói ở máy chủ cho lọt khoá kế thừa từ prototype (toString/constructor/__proto__): dữ liệu tuỳ ý trong hinhDang tới Claude mà không qua lần quét thứ hai**
  file: `packages/core/src/import/ai/goi.ts:95`
  severity: high
  AC: AC-3
  source: bugs
  detail: kiemKhuonGoi kiểm khoá lạ bằng toán tử `in` trên object literal: `!(x in KHOA_HINH)` (dòng 95) và `!(c.lop in LOP_COT)` (dòng 89). Mọi khoá có trong Object.prototype vì thế đều qua kiểm, gồm 'toString', 'constructor', 'valueOf', 'hasOwnProperty' và '__proto__' (JSON.parse tạo '__proto__' thành khoá riêng của đối tượng). Vòng lặp KHOA_HINH chỉ kiểm kiểu của 8 khoá đã biết, nên khoá thừa mang được chuỗi bất kỳ. quetGoi chỉ quét tieuDe và giaTri, không quét hinhDang. giaTriQuaThoaThuan chỉ xét cột có giaTri. Sau đó claude.ts gửi nguyên `JSON.stringify(goi)` sang Anthropic. Đã chạy thử bằng tsx: gói {cot:[{cot:0,tieuDe:'A',lop:'constructor',hinhDang:{...8 khoá hợp lệ..., toString:'0900000001 Nguyen Van A'}}]} được kiemKhuonGoi nhận, quetGoi trả 0 chỗ trúng. Như vậy cả khuôn chặt lẫn lần chặn thứ hai ở máy chủ (AC-3, bất biến 2) đều bị vượt khi trình duyệt gửi sai hay có người cố ý dựng gói. Cách sửa: kiểm bằng Object.hasOwn(KHOA_HINH, x) / Object.hasOwn(LOP_COT, c.lop), hoặc dùng mảng hay Set.
  rationale: AC-3 đòi gói có khoá lạ bị 400 và lần chặn thứ hai không để dữ liệu cá nhân tới khách AI; finding chứng minh vượt được.

- **Lỗi ném ra sau khi đã bật dangHoi làm dải «Máy đang đề xuất» kẹt và khoá nút Tiếp vĩnh viễn, kèm báo sai «Không đọc được tệp»**
  file: `apps/web/src/app/(app)/imports/new/man-nhap.tsx:133`
  severity: medium
  AC: AC-8
  source: bugs
  detail: Trong nap, hàm gọi setDx({...ttDau, dangHoi:true}) rồi mới gọi hoiDeXuat. hoiDeXuat → deXuatGhep → goi() chỉ bắt lỗi của fetch: `return (await res.json()) as T` (goi-api.ts dòng 49) không có catch, nên thân 200 hỏng hay mạng đứt giữa lúc đọc thân sẽ ném lỗi. gopDeXuat/apLai cũng có thể ném. Lỗi rơi vào catch chung của nap. Catch này chỉ setLoiTep('Không đọc được tệp này…') dù tệp đã đọc xong và đã setS(sau), và không gỡ dx.dangHoi. coTheTiepGhepAi trả ok:false khi dangHoi, nên nút Tiếp ở bước 2 khoá mãi và dải chờ hiện mãi cho tới khi chọn lại tệp. Điều này trái AC-8 («không làm hỏng việc nhập khi AI không dùng được»). Cách sửa: bọc lời hỏi AI trong try riêng, khi lỗi thì đặt baoTatDinh và gỡ dangHoi.
  rationale: AC-8 đòi khi khách AI lỗi vẫn nhập được tới bước ghi với một dòng đúng lý do; nút Tiếp khoá vĩnh viễn trái trực tiếp.

- **Sàn đã bật AI nhưng hết trần, thiếu khoá, hay không đọc được trạng thái: màn Nhập im lặng, không có dòng lý do**
  file: `apps/web/src/lib/nhap/de-xuat.ts:24`
  severity: medium
  AC: AC-8
  source: bugs
  detail: canHoi trả false khi `!ai || !ai.bat || !ai.sanSang || !ai.conTran`. Khi đó nap đi thẳng tới setDx(ttDau(...)) với baoTatDinh = null, nên màn không hiện câu nào. Lý do «Hết trần AI tháng này» hay «AI chưa sẵn sàng trên máy chủ» chỉ hiện khi máy chủ được gọi, mà ở đây máy chủ không bao giờ được gọi. Khi docTrangThaiAi lỗi, man-nhap.tsx gán setAi(null) và nuốt lỗi, AI tắt lặng lẽ. Cột chưa ghép vẫn là «Giữ làm ghi chú» mà người dùng không biết vì sao máy không đề xuất. Điều này trái AC-8 («màn nói một dòng lý do») và trái chính docstring của de-xuat.ts («Mọi ca không dùng được AI: … một dòng báo nói lý do»).
  rationale: AC-8 đòi màn hiện một dòng nói đúng lý do cho ca thiếu khoá API và các ca không dùng được AI.

- **Hình dạng 4 (một assertion âm tính đứng một mình, không ghim thông điệp): regex «hoặc» cho phép ca chặn nguồn đậu nhờ một ràng buộc khác**
  file: `packages/db/tests/isolation.test.mjs:3077`
  severity: medium
  AC: AC-4
  source: measurement
  detail: `await assert.rejects(them("{catalog,source}"), /agreements_never_source|agreements_mot_thoa_thuan_ai/)` chạy ngay sau `await them("{catalog,shareable_listing}")`, tức là sàn A đã có một thoả thuận ai_processing. Vì vậy chỉ mục duy nhất `agreements_mot_thoa_thuan_ai` (035) chắc chắn từ chối lần chèn này, bất kể lớp nào được liệt kê. Thông điệp mong đợi lại chấp nhận cả tên ràng buộc ấy. Hệ quả: nếu `agreements_never_source` bị gỡ hay nới, assert vẫn xanh. Ca này mang tên «vẫn chặn nguồn» nhưng không ghim được rằng lớp source bị chặn. Muốn đo đúng thì phải chèn source trước khi có hàng ai_processing (như ai.test.ts E4b làm), hoặc ghim riêng /agreements_never_source/.
  rationale: AC-4 đòi thêm lớp source bị từ chối ở ràng buộc cơ sở dữ liệu; ca kiểm này không chứng minh được điều đó.

- **Hình dạng 4 và 3 (assertion âm tính không có đối chứng dương; lời hứa về quan hệ giữa các giá trị): ca ranh tháng theo giờ Việt Nam không phân biệt được với cách tính theo UTC**
  file: `packages/api/test-db/imports/ai.test.ts:232`
  severity: high
  AC: AC-9
  source: measurement
  detail: Ca chỉ chèn dòng 15 USD lúc `date_trunc('month', now() at time zone 'Asia/Ho_Chi_Minh') - interval '30 minutes'`, tức 23:30 giờ VN ngày cuối tháng trước (khoảng 16:30 UTC cùng ngày), rồi assert rằng dòng ấy KHÔNG được tính (dòng 235). Mốc đầu tháng theo UTC (00:00 UTC ngày 1, tức 07:00 VN) còn muộn hơn, nên một bản cài đặt tính tổng theo UTC cũng loại dòng này và ca vẫn xanh. Chiều đỏ mà evals.yaml E9 tuyên («tính tổng theo UTC → dòng 30/10 23:30 giờ VN sai tháng, ca ranh tháng đỏ») vì thế không xảy ra. Lời hứa là quan hệ giữa ranh tháng và múi giờ, nhưng ca thiếu đối chứng dương: một dòng trong khoảng 00:00–07:00 giờ VN ngày 1 (vẫn thuộc tháng trước theo UTC) phải ĐƯỢC tính. Chỉ dòng như vậy mới làm bản UTC đỏ.
  rationale: AC-9 đòi tính tháng theo giờ Việt Nam và dòng tháng trước không tính; ca kiểm không chứng minh được múi giờ.

- **Hình dạng 4 (một assertion âm tính đứng một mình): ca «quản trị sàn B không đổi được thoả thuận sàn A» không kiểm rằng lời gọi của B có chạy**
  file: `packages/api/test-db/imports/ai.test.ts:159`
  severity: low
  AC: AC-5
  source: measurement
  detail: `await send(APP, "PUT", "/api/v1/imports/ai/agreement", { bat: false }, B.quanTri.cookie)` bỏ qua status trả về, không kiểm hàng của sàn B. Sau đó chỉ assert rằng hàng của sàn A vẫn `active`. Nếu lời gọi của B hỏng hẳn (400, 500, sai cookie) thì assert vẫn xanh. Thiếu đối chứng dương, ví dụ status 204 và hàng ai_processing của sàn B ở trạng thái paused, để chứng rằng lời gọi có chạy và chỉ tác động lên sàn B.
  rationale: AC-5 đòi người sàn khác bật/tắt không tác động được; ca kiểm thiếu đối chứng nên không chứng minh được.

- **Hình dạng 4 (một assertion âm tính đứng một mình): ca «mồi rò» chỉ assert vắng chuỗi, không có đối chứng dương trên cùng gói**
  file: `packages/api/src/imports/ai/goi.ro-ri.test.ts:35`
  severity: low
  AC: AC-2
  source: measurement
  detail: `for (const s of ["0900 000 011", ...]) assert.ok(!goi.includes(s))` chỉ kiểm rằng các chuỗi cấm vắng mặt. Trên cùng gói, ca không kiểm rằng giá trị được phép (ví dụ «A-01.03» của cột Mã căn chưa ghép, hay tiêu đề «Ghi chú») có mặt. Nếu `dungGoiDeXuat` bỏ hết giá trị, hay ô số điện thoại bị cắt vì lý do khác, ca vẫn xanh. Đối chứng dương hiện chỉ có ở tệp khác (ma trận của goi.test.ts), không nằm trong bộ kiểm rò bắt buộc của job ro-ri.
  rationale: AC-2 đòi chứng minh gói không chứa chuỗi cấm; ca kiểm vắng chuỗi mà không có đối chứng dương có thể xanh với gói rỗng.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **New env var ANTHROPIC_API_KEY is missing from .env.example**
  Người dùng thấy gì: Người cài máy chủ thật không có dòng nhắc nào về khoá AI, nên có thể quên đặt và tính năng AI lặng lẽ không chạy, nhập vẫn như cũ.
  Căn cứ: Nhẹ: không mất hay lộ dữ liệu, nhập vẫn chạy, người cài đặt khoá là thấy ngay, và sửa sau rất rẻ.
  file: `packages/api/src/imports/ai/claude.ts`
  severity: medium
  Đề xuất: known-limits

- **Re-enabling AI only changes status: approved_by is not updated and nothing logs who switched it on or off**
  Người dùng thấy gì: Khi một quản trị sàn khác bật lại AI, hồ sơ vẫn ghi người đầu tiên là người duyệt và không có dấu vết ai đã bật hay tắt lúc nào.
  Căn cứ: Trung bình: dữ liệu không bị lộ nhưng thiếu dấu vết kiểm toán cho luồng dữ liệu ra ngoài, không tự khôi phục được sau này, nên cần một việc riêng.
  file: `packages/api/src/imports/ai/store.ts`
  severity: medium
  Đề xuất: new-contract

- **Malformed lucide-react import formatting in second-column.tsx**
  Người dùng thấy gì: Không ảnh hưởng gì tới người dùng; chỉ là dòng khai báo biểu tượng trông lệch trong mã.
  Căn cứ: Không có hậu quả với người dùng, chỉ là thẩm mỹ mã, nên không đáng mở việc.
  file: `apps/web/src/components/shell/second-column.tsx`
  severity: low
  Đề xuất: wont-fix

- **Nhánh bỏ kết quả đọc cũ là mã chết: tệp hay trang tính cũ vẫn được gửi AI và có thể ghi đè ong của lượt đọc mới**
  Người dùng thấy gì: Nếu người dùng đổi trang tính khi máy còn đang đọc, kết quả của trang cũ có thể hiện lẫn vào màn và tốn thêm một lượt AI không cần thiết.
  Căn cứ: Vừa phải: người vẫn phải duyệt trước khi ghi nên không ghi sai âm thầm, và chọn lại tệp là gỡ được; chỉ tốn chút chi phí AI.
  file: `apps/web/src/app/(app)/imports/new/man-nhap.tsx`
  severity: medium
  Đề xuất: known-limits

- **Mọi lỗi máy chủ của /imports/ai/plan (400, 403, 409, 500) bị báo thành «không gửi được tới máy chủ», lý do của máy chủ bị nuốt**
  Người dùng thấy gì: Khi máy chủ từ chối yêu cầu AI vì sai khuôn hay thiếu quyền, người dùng chỉ thấy báo lỗi kết nối chung chung, không biết nguyên nhân thật.
  Căn cứ: Nhẹ: nhập vẫn chạy như không có AI, không mất dữ liệu, chỉ thông báo kém chính xác; sửa sau rẻ.
  file: `apps/web/src/lib/nhap/de-xuat.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo hàm trợ giúp thay vì đầu ra): ca «đổi tệp giữa chừng bỏ kết quả cũ» đo một hàm mà màn Nhập không gọi**
  Người dùng thấy gì: Bài kiểm tự động cho trường hợp đổi tệp giữa chừng không thật sự kiểm màn hình, nên lỗi ở đó có thể lọt mà bài kiểm vẫn xanh.
  Căn cứ: Nhẹ: chỉ làm giảm độ tin của bài kiểm ở một tình huống hiếm, không ảnh hưởng dữ liệu người dùng trực tiếp.
  file: `apps/web/src/lib/nhap/de-xuat.test.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

⚠ Cụm ngoài vùng phủ: 3/14 lỗi rơi vào file không bộ đo nào phủ (apps/web/src/components/shell/second-column.tsx, packages/api/test-db/imports/ai.test.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
