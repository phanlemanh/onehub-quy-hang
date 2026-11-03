# Review findings: so-do-hai-tuan-thu (round 1)

## Trong hợp đồng

- **Lead routed after the period end is counted as already routed instead of not yet routed**
  file: packages/core/src/metrics/lead.ts:35
  severity: medium
  AC: AC-5
  source: conventions
  detail: thoiLuongLead splits the not-yet-reached leads 'at den' into three groups (AC-5: 'số lead chưa tới mốc tại den tách ba phần'). The returned group is checked against the period: `l.returnedAt !== null && Date.parse(l.returnedAt) < ky.den`. The not-routed vs routed split uses the current value `l.matchedAgentUserId === null` and never compares `routedAt` with `den`. A lead created inside the period but routed after `den` is counted as routed (daChia) when it should be not routed (chuaChia) at `den`. That breaks the half-open period rule the same function follows for its other timestamps (AC-10), and the 'chưa chia' part, which shows where intake is stuck, comes out too low when the measure is computed after the period. Lead-routing rules (migration 011) set `matched_agent_user_id` and `routed_at` together, but owner_has_agent leads get `matchedAgentUserId` at creation without `routedAt`. The check therefore has to be something like `matchedAgentUserId === null || (routedAt !== null && Date.parse(routedAt) >= ky.den)`, not a switch to `routedAt` alone.
  rationale: AC-5 đòi số lead chưa tới mốc «tại den» tách đúng ba phần chưa chia/đã chia/đã trả lại; lead chia sau den bị tính là đã chia thì phần tách sai ngay tại den.

- **The 'not yet reached' breakdown at `den` mixes current state (routing, discard) with state as of `den`**
  file: packages/core/src/metrics/lead.ts:31
  severity: medium
  AC: AC-10
  source: bugs
  detail: The contract (AC-5 and AC-10) asks for leads that have not reached their milestone *at `den`*, and counts only work done in [tu, den). The code checks `returnedAt` against `den` (`Date.parse(l.returnedAt) < ky.den`). But it splits chưa chia / đã chia with `l.matchedAgentUserId === null`, which is the lead's current value, not its value at `den`. `routedAt` is never checked. A lead with outcome `new` that was routed after `den` is therefore counted as `daChia`, though nobody had it at `den`. In the same way, `leadCanGoi` drops any lead with `discardedAt !== null`, even when it was discarded after `den`. Such a lead disappears from the period's cohort (`n` and `chua` both shrink). Re-running a past period later gives different numbers for `lead_to_first_call` and `lead_to_ready`, which breaks the contract's guarantee that events from `den` onward do not change the numbers. Fix: use `routedAt < den` (or `matchedAgentUserId` only for `owner_has_agent` leads) and `discardedAt < den`. The test helper `lead()` defaults `matchedAgentUserId` to a value with `routedAt: null`, so this case is never exercised.
  rationale: AC-10 đòi việc từ den trở đi không đổi số; lead bị bỏ hay chia sau den làm đổi n và chưa/đã chia khi tính lại kỳ cũ.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The 'daBo' case does not test the discarded-lead exclusion: it is also a duplicate-unit lead**
  Người dùng thấy gì: Nếu sau này ai đó vô tình bỏ luật loại lead đã bỏ khỏi số đo, bài kiểm hiện tại vẫn báo xanh nên lỗi có thể lọt qua mà không ai biết.
  Căn cứ: Số đo hôm nay vẫn đúng, chỉ là lưới bảo vệ về sau yếu hơn; không mất dữ liệu và bổ sung ca kiểm sau này rất rẻ.
  file: `packages/core/src/metrics/so-do.test.ts`
  severity: medium
  Đề xuất: known-limits

- **E9 reads the real seed loader nap-ban-that.ts, but the eval's paths do not list that file**
  Người dùng thấy gì: Nếu bộ nạp dữ liệu mẫu đổi, cổng nghiệm thu có thể không nhận ra bằng chứng của ca kiểm này đã cũ.
  Căn cứ: Chỉ ảnh hưởng độ nhạy của cổng kiểm, người dùng cuối không thấy gì; sửa là thêm một dòng bất cứ lúc nào.
  file: `_acceptance/so-do-hai-tuan-thu/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **The test helper copies the owner-confirmation rule by hand instead of calling confirmsWithOwner**
  Người dùng thấy gì: Dữ liệu dựng tay trong bài kiểm có thể ghi nhận một lần xác nhận với chủ nhà mà hệ thống thật không bao giờ ghi, nên ca kiểm mới thêm sau này có thể ra ngày xác nhận sai.
  Căn cứ: Hiện không số nào sai và người dùng không bị ảnh hưởng; rủi ro chỉ nằm ở các ca kiểm thêm sau, sửa rẻ.
  file: `packages/core/src/metrics/so-do.test.ts`
  severity: low
  Đề xuất: known-limits

- **lead_to_ready (and lead_to_first_call) disagree with the existing §11 measure app.lead_board_metric for leads that were returned and resubmitted**
  Người dùng thấy gì: Một chủ nhà bị trả lại rồi nộp lại có thể bị đếm hai lần, và thời gian đến lúc sẵn sàng bán ngắn hơn con số mà bảng số đo cũ báo, nên hai nơi cho hai con số khác nhau cho cùng một việc.
  Căn cứ: Chỉ lệch số đo trong hai tuần thử với số ít lead nộp lại, không mất dữ liệu và tính lại được; nhưng cần quyết định định nghĩa chung nên đáng làm thành việc riêng.
  file: `packages/core/src/metrics/lead.ts`
  severity: medium
  Đề xuất: new-contract

- **Hình 2 (fixture viết tay đúng khuôn bên đọc): bộ chuyển chép tay hằng của bộ nạp, ca gác chỉ so thứ tự tên lệnh**
  Người dùng thấy gì: Nếu dữ liệu mẫu của bộ nạp đổi nội dung nhưng giữ thứ tự lệnh, các số ghim của hai tuần thử có thể vẫn báo xanh trong khi đo trên dữ liệu khác bản thật.
  Căn cứ: Không ảnh hưởng người dùng thật hay dữ liệu, chỉ làm lưới kiểm lỏng hơn; bộ nạp ít đổi và sửa sau không đắt.
  file: `packages/core/src/metrics/mau.fixture.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 (assert «có mặt/bằng số» thay cho quan hệ): đối chiếu freshness chỉ so tổng đếm, không so từng hàng**
  Người dùng thấy gì: Nếu số đo đếm nhầm căn này thay căn kia nhưng tổng vẫn khớp, bài kiểm sẽ không phát hiện.
  Căn cứ: Số hiện đúng và các ca ranh 13/14 ngày đã được ghim riêng; chỉ là lưới yếu hơn lời hứa, không ảnh hưởng người dùng.
  file: `packages/core/src/metrics/so-do.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 5 (tuyên quét lớp nhưng chỉ có điểm-case): đối chiếu nhomCuaCan của E7 chỉ chạy cho một sự kiện**
  Người dùng thấy gì: Việc kiểm rằng căn nào được đếm là «nên gọi điều chỉnh giá» chỉ làm với một căn, nên khi ngưỡng đổi thì một căn khác có thể lọt mà không bị bắt.
  Căn cứ: Số đo hiện đúng theo các ca đã ghim; chỉ là lưới kiểm hẹp, người dùng không mất gì và mở rộng ca kiểm rẻ.
  file: `packages/core/src/metrics/so-do.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 5 (tuyên quét lớp nhưng chỉ có điểm-case): ca «sự kiện thêm qua khuôn chặt» chỉ kiểm hai sự kiện**
  Người dùng thấy gì: Phần lớn sự kiện dựng trong các ca kiểm không được soi xem có đúng khuôn sự kiện thật hay không, nên một ca kiểm có thể chạy trên dữ liệu mà hệ thống thật sẽ từ chối.
  Căn cứ: Chỉ ảnh hưởng độ tin cậy của bài kiểm, không động tới dữ liệu hay người dùng; bộ mẫu chính đã được quét toàn phần.
  file: `packages/core/src/metrics/so-do.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 (assertion âm tính một mình): kiểm khoá SOURCE_KEYS không có đối chứng dương**
  Người dùng thấy gì: Bài kiểm «không lộ thông tin chủ nhà» chưa được chứng minh là sẽ báo đỏ khi thông tin đó thật sự lọt ra, nên có thể yên tâm hơn mức nó đáng được.
  Căn cứ: Hiện đầu vào không chứa thông tin chủ nhà nên không có rò rỉ thật; thêm ca đối chứng sau là việc rẻ nhưng nên làm vì liên quan thông tin nhạy cảm.
  file: `packages/core/src/metrics/so-do.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 2 (fixture viết tay đúng khuôn bên đọc): helper `them` tự viết luật confirmedWithOwner, lệch confirmsWithOwner của lõi**
  Người dùng thấy gì: Một ca kiểm dựng tay ghi một lần xác nhận với chủ nhà mà hệ thống thật không bao giờ ghi, có thể làm ngày xác nhận trong ca kiểm đó sai.
  Căn cứ: Không số ghim nào bị ảnh hưởng và người dùng thật không gặp; chỉ là rủi ro cho ca kiểm viết thêm sau này, sửa rẻ.
  file: `packages/core/src/metrics/so-do.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
