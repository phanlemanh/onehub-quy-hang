## Trong hợp đồng

- **Cửa kiểm phần tử vẫn bỏ sót agentName và returnReason, nên một phần tử sai khuôn còn làm vỡ cả trang (AC-2)**
  file: `apps/web/src/app/(app)/leads/mine/nguon-that.tsx:14`
  severity: medium
  AC: AC-2
  source: conventions
  detail: Chú thích của `laLead` và quyết định d-20261109T141035Z-9 đều nói một lead phải đủ mọi trường mà `DongLead` dựng dòng từ đó. Thực tế `laLead` không kiểm `agentName` và `returnReason`, dù `lead-da-nhap.tsx` đưa thẳng hai trường này vào JSX: `tenDauChu` trả `l.agentName` để render, và dòng lead bị trả lại có `{l.agentName ?? "Đầu chủ"} trả lại: «{l.returnReason}»`.

  Đã chạy thử `nguon.lay()` với lead đúng khuôn, chỉ đổi một trường: `agentName: {a:1}` và `returnReason: {a:1}` đều qua được kiểm, không trả `null`. Cũng đã chạy `renderToString` một phần tử có con là object: React ném «Objects are not valid as a React child». Lỗi đó xảy ra lúc dựng, nên toàn route rơi vào `(app)/error.tsx` thay vì một khối báo lỗi có «Thử lại» trong vùng, đúng điều AC-2 cấm («trang không vỡ»).

  Cùng lớp lỗi, không vỡ trang nhưng hiện sai và không báo: `agentName: 1` lọt qua; `feeInclusion: "la"` lọt qua vì chỉ kiểm là chuỗi, và `understoodPrice` sẽ in «chưa bao phí»; `awaitingRouting: "x"` lọt qua và làm nhãn thành «Chờ chia». `feeInclusion` đã có danh sách giá trị của lõi là `FEE_INCLUSIONS`.

  Bảng SAI trong `nguon-that.test.ts` không có các trường này nên bộ kiểm vẫn xanh. Hướng sửa: `agentName` và `returnReason` phải là chuỗi hoặc null, `awaitingRouting` phải là boolean, `feeInclusion` theo danh sách của lõi, và thêm các ca tương ứng vào SAI.

- **Cửa kiểm vẫn cho qua phần tử có agentName hoặc returnReason sai kiểu, màn vỡ lúc dựng hoặc hiện «undefined»**
  file: `apps/web/src/app/(app)/leads/mine/nguon-that.tsx:13`
  severity: medium
  AC: AC-2
  source: bugs
  detail: Chú thích của `laLead` cam kết đủ các trường `DongLead` dựng dòng từ đó, không để màn hiện chữ rác hay vỡ lúc dựng (AC-2). Bản sửa vẫn không kiểm hai trường `DongLead` đưa thẳng ra màn: `agentName` và `returnReason`.

  Đã chạy `nguon.lay()` với fetch giả, cả ba phần tử sau đều qua cửa kiểm (không trả null):
  (1) `{...LEAD, agentName: {a:1}}`
  (2) `{...LEAD, stage: "returned", returnReason: {a:1}}`
  (3) `{...LEAD, stage: "returned"}` đã bỏ khoá `returnReason`

  Hậu quả suy từ mã, chưa dựng màn thật:
  - Ca (1): `tenDauChu` trả về chính object, được đặt làm JSX child ở `{moc} · {tenDauChu(l)}`. React ném «Objects are not valid as a React child», đúng kiểu vỡ trang AC-2 cấm.
  - Ca (2): `«{l.returnReason}»` ở dòng phụ của lead bị trả lại vỡ theo cùng cách.
  - Ca (3): React không in undefined ở JSX child nên dòng phụ thành «Đầu chủ trả lại: «»», lý do trống và không có khối báo lỗi. Với `stage: "resubmitted"`, `ghiChu` dùng template string nên in đúng chữ «Trả lại vì «undefined»».

  Bảng 17 ca trong `nguon-that.test.ts` không có dòng nào cho hai khoá này, nên bộ kiểm xanh mà vẫn hở. API hiện tại luôn trả đúng hai trường này (`myLeadView`), nên chỉ lộ khi nội dung phản hồi hỏng, đúng phạm vi hàng vá.

  Hướng sửa: thêm `(l.agentName === null || typeof l.agentName === "string")` và điều kiện tương tự cho `returnReason`, kèm dòng trong bảng SAI.

- **feeInclusion chỉ kiểm là chuỗi, giá trị lạ hiện thành «chưa bao phí» không báo lỗi**
  file: `apps/web/src/app/(app)/leads/mine/nguon-that.tsx:23`
  severity: low
  AC: AC-2
  source: bugs
  detail: `laLead` kiểm `need` và `stage` theo danh sách của lõi, nhưng `feeInclusion` chỉ kiểm `typeof === "string"`. Trong khi đó `understoodPrice` coi mọi giá trị khác `"included"` là chưa bao phí.

  Đã chạy: `{...LEAD, feeInclusion: "la"}` qua cửa kiểm, và `understoodPrice(3200000000, "la")` trả «3,2 tỷ, chưa bao phí». Phần tử sai khuôn vì thế hiện thành một khẳng định nghiệp vụ nghe hợp lý về giá, không có khối báo lỗi. Đây là fallback ngầm, trái mục tiêu của `laLead`. Cột DB có check `included`/`excluded` nên chỉ lộ khi phản hồi hỏng.

  Bảng SAI của bài kiểm chỉ có `["feeInclusion", 1]`, không có chuỗi lạ. Hướng sửa: kiểm theo `FEE_INCLUSIONS` của lõi như `need` và `stage`, thêm dòng chuỗi lạ vào bảng.

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): ma trận «phần tử sai khuôn» chép theo khoá bộ kiểm đang xét, không theo toàn bộ khoá màn đọc**
  file: `apps/web/src/app/(app)/leads/mine/nguon-that.test.ts:60`
  severity: medium
  AC: AC-2
  source: measurement
  detail: Bảng `SAI` (dòng 60-73, ghim `assert.equal(dem, 17)` ở dòng 80) là danh sách khoá viết tay, trùng đúng 14 khoá mà `laLead` đang kiểm. Lời hứa ở `nguon-that.tsx` là «Đủ các trường màn dựng dòng từ đó; một phần tử sai thì cả lần đọc là hỏng, không để màn hiện chữ rác hay vỡ lúc dựng».

  `DongLead` trong `lead-da-nhap.tsx` còn đọc `returnReason` (in vào «Trả lại vì «…»» và «trả lại: «…»»), `agentName`, `awaitingRouting`. `LeadDaNhap` đọc thêm `resubmittedLeadId`. Lõi có sẵn danh sách đủ khoá `MY_LEAD_VIEW_KEYS`, nhưng ma trận không rút từ đó, nên con số 17 chỉ xác nhận độ dài của chính mảng viết tay.

  Đã thử trên bản sao cây với lead `stage` = resubmitted, thiếu `returnReason` hoặc `returnReason` = 1, `agentName` = 1, `awaitingRouting` = "x": cả bốn đều qua cửa (`nguon.lay()` không trả null). Với `returnReason` thiếu, theo mã dựng dòng màn sẽ in «Trả lại vì «undefined»», đúng loại chữ rác lời hứa cấm, mà ma trận vẫn đủ 17/17.

  Ma trận cũng chỉ thay giá trị, không có dòng xoá khoá, nên chiều thiếu khoá của từng trường không được đo riêng; chỉ có `{"a":1}` thiếu mọi khoá, và ca đó bị loại ngay ở `id`.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): chiều nhận của cửa đọc chỉ thử một lead duy nhất, không có ma trận giá trị hợp lệ**
  Người dùng thấy gì: Bộ kiểm tự động mới thử một kiểu lead mẫu, nên nếu sau này ai đó vô tình siết cửa kiểm quá chặt thì telesales có lead trả lại hay cho thuê có thể thấy báo lỗi thay cho cả danh sách mà bộ kiểm vẫn xanh.
  Căn cứ: Hiện tại người dùng chưa gặp lỗi nào, chỉ là lưới an toàn cho các lần sửa sau còn mỏng, và bổ sung bộ kiểm sau này rẻ, không mất dữ liệu.
  file: `apps/web/src/app/(app)/leads/mine/nguon-that.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Fixture «lead đủ trường» thực ra thiếu nửa số khoá và nấc sai, ép kiểu che mất (r1 · tệp đã đổi)**
  Người dùng thấy gì: Dữ liệu mẫu trong bài kiểm không giống một lead thật, nên bài kiểm chứng minh yếu hơn mô tả. Người dùng không gặp lỗi nào ở màn hình.
  Căn cứ: Không ảnh hưởng người dùng và không mất dữ liệu; chỉ làm bằng chứng kiểm thử kém chặt, ghi lại rồi sửa sau khi siết cửa kiểm là rẻ.
  file: `apps/web/src/app/(app)/leads/mine/nguon-that.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Lead mẫu của ca «phản hồi đúng» không đủ trường như E4 khai, và mang trạng thái sai (r1 · tệp đã đổi)**
  Người dùng thấy gì: Lead mẫu trong bài kiểm thiếu nhiều trường so với lead thật, nên bài kiểm chưa chứng minh trọn một lead thật đi qua được. Người dùng không thấy lỗi.
  Căn cứ: Chỉ là độ chặt của bằng chứng kiểm thử, không làm hỏng màn hình hay mất dữ liệu; sửa sau rẻ và không gấp.
  file: `apps/web/src/app/(app)/leads/mine/nguon-that.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5: tuyên quét lớp «phần tử sai khuôn» nhưng chỉ có điểm-case, thiếu ma trận toàn phần theo từng trường và vị trí phần tử (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bộ kiểm chưa thử đủ các kiểu phần tử sai nên có thể bỏ sót lỗi sau này. Người dùng không thấy gì khác đi hôm nay.
  Căn cứ: Là chỗ hở của lưới an toàn chứ không phải lỗi người dùng đang gặp; ghi lại để bù khi mở rộng kiểm thử, không làm mất dữ liệu.
  file: `apps/web/src/app/(app)/leads/mine/nguon-that.test.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
