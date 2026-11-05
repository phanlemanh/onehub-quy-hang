# Review findings: luat-chia-lead (round 2)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Kiểm 'máy dev đúng cây này' cho lọt khi chạy từ bản checkout chính, vì các worktree nằm trong cây của nó**
  Người dùng thấy gì: Khi chấm lại từ bản chính của kho, lượt chấm có thể đo nhầm mã của một bản làm việc khác. Người dùng cuối không bị ảnh hưởng, chỉ độ tin cậy của số đo chấm.
  Căn cứ: Chỉ ảnh hưởng công cụ chấm nội bộ, không mất hay lộ dữ liệu của sàn, và chỉ xảy ra khi chạy từ bản chính; người chấm tự tránh được.
  file: `_acceptance/luat-chia-lead/thu/dung-d.mjs`
  severity: medium
  Đề xuất: known-limits

- **A save that fixes only one half of a broken deadline pair returns 200 and shows a success toast, but the stored setting still doesn't apply**
  Người dùng thấy gì: Khi sàn có cặp hạn sai từ trước và quản trị chỉ sửa một hạn, màn báo đã lưu nhưng luật vẫn chạy theo mặc định. Quản trị tưởng đã đổi mà lead mới vẫn theo hạn cũ.
  Căn cứ: Gây hiểu nhầm có thật nhưng chỉ với sàn đã có dữ liệu cặp hạn hỏng, không mất dữ liệu, và quản trị sửa được bằng cách lưu cả hai hạn; sửa cần thêm luật màn nên nên làm việc riêng.
  file: `apps/web/src/app/(app)/settings/lead-routing/luat-chia-lead.tsx`
  severity: medium
  Đề xuất: new-contract

- **If reading the Hôm nay group set fails, the error is swallowed and the two thresholds unlock as if the default set were in use**
  Người dùng thấy gì: Nếu không đọc được bộ nhóm Hôm nay của sàn, hai ô ngưỡng vẫn mở sửa và không có báo gì. Sàn có bộ nhóm riêng có thể lưu ngưỡng mà không có tác dụng.
  Căn cứ: Cần đồng thời đọc hỏng và sàn có bộ nhóm riêng, hiếm gặp; không mất dữ liệu và tải lại là thấy đúng trạng thái.
  file: `apps/web/src/app/(app)/settings/lead-routing/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm-tính-một-mình) cộng hình dạng 1 (đo mã nguồn thay vì đầu ra): bài E10a coi việc không có hẹn giờ là bằng chứng hook không tự thử lại**
  Người dùng thấy gì: Bài kiểm có thể không bắt được nếu sau này Bảng hàng tự đọc lại danh bạ liên tục khi hỏng. Hiện người dùng chưa thấy lỗi nào.
  Căn cứ: Chỉ là lưới an toàn yếu hơn mong muốn, hành vi hiện tại không sai với người dùng; gia cố bài kiểm rẻ và làm sau được.
  file: `apps/web/src/app/(app)/inventory/danh-ba.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét cả lớp nhưng chỉ có vài ca): bài E8b nói màn không viết nhãn riêng nhưng chỉ dò 3 trên 7 nhãn**
  Người dùng thấy gì: Bài kiểm chỉ canh được một phần các nhãn trên màn, nên sau này ai đó viết tay thêm một nhãn riêng có thể không bị phát hiện. Hiện nhãn trên màn vẫn đúng.
  Căn cứ: Không ảnh hưởng người dùng hôm nay, chỉ giảm độ canh về sau; bổ sung dò nhãn rẻ và làm lúc nào cũng được.
  file: `apps/web/src/app/(app)/settings/lead-routing/luat.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (chỉ kiểm chuỗi có mặt trong khi lời hứa là một quan hệ): E10b kiểm tên đầu chủ có ở đâu đó trên trang, không kiểm ô của căn đã gán**
  Người dùng thấy gì: Lượt chấm có thể báo đạt dù ô Đầu chủ của căn đích vẫn hiện «…», miễn tên xuất hiện ở chỗ khác trên trang. Người dùng cuối chưa thấy lỗi.
  Căn cứ: Chỉ làm bằng chứng chấm lỏng, không mất dữ liệu và không đổi hành vi; siết kịch bản đo là việc rẻ nhưng không cản bàn giao.
  file: `_acceptance/luat-chia-lead/thu/chay-ui.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc, không lấy từ nguồn): danh sách sáu khoá của bài 403 chép tay từ KHOA_MAN và không có phép so**
  Người dùng thấy gì: Nếu sau này màn thêm hay đổi một mục luật, bài kiểm quyền vẫn xanh trên danh sách cũ. Người dùng hôm nay không bị ảnh hưởng.
  Căn cứ: Rủi ro chỉ có khi màn đổi về sau và lúc đó đã phải xem lại bài kiểm; chi phí theo dõi vượt hậu quả.
  file: `packages/api/test-db/luat-chia-lead.test.ts`
  severity: low
  Đề xuất: wont-fix

- **E2b: eval ghi lý do có dấu hai chấm, còn bài kiểm lặng lẽ nới khuôn thành «dấu cách hoặc hai chấm» (r1)**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào: lý do báo lỗi vẫn hiện đúng dòng. Chỉ có tài liệu nghiệm thu mô tả lệch chút so với bài kiểm.
  Căn cứ: Không ảnh hưởng người dùng và không mất dữ liệu; chỉ là lệch lời mô tả trong hồ sơ, sửa sau rẻ nhưng không đáng mở việc riêng.
  file: `packages/api/test-db/luat-chia-lead.test.ts`
  severity: medium
  Đề xuất: wont-fix

- **Phần đọc danh bạ chỉ kiểm thân là mảng, không kiểm từng phần tử, dù bài kiểm gọi ca đó là «thân sai khuôn» (r1)**
  Người dùng thấy gì: Nếu máy chủ trả danh bạ sai dạng (rất hiếm), Bảng hàng có thể vỡ thay vì báo lỗi kèm Thử lại.
  Căn cứ: Rủi ro thấp vì máy chủ đã kiểm khuôn dữ liệu; nếu xảy ra thì tải lại trang là gỡ được, nhưng bản sai có thể còn giữ trên máy.
  file: `apps/web/src/app/(app)/inventory/danh-ba.ts`
  severity: low
  Đề xuất: known-limits

- **If loading the Today group set fails, the screen hides it and leaves both queue thresholds editable (r1)**
  Người dùng thấy gì: Khi không đọc được bộ nhóm Hôm nay riêng của sàn, quản trị vẫn sửa được hai ngưỡng và thấy «Đã lưu», nhưng giá trị không có hiệu lực.
  Căn cứ: Hậu quả vừa: quản trị tưởng đã đổi mà không áp, nhưng không mất dữ liệu và chỉ xảy ra khi lần đọc phụ hỏng; tải lại là thấy lại khoá.
  file: `apps/web/src/app/(app)/settings/lead-routing/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **chuNguon labels a current member with a blank name as «Đã rời sàn» (r1)**
  Người dùng thấy gì: Quản trị đang ở sàn nhưng chưa đặt tên sẽ bị ghi là «Đã rời sàn» ở dòng nguồn của luật.
  Căn cứ: Chỉ sai chữ ở dòng thông tin, không ảnh hưởng giá trị hay việc lưu; người dùng tự đặt tên là hết.
  file: `apps/web/src/app/(app)/settings/lead-routing/luat.ts`
  severity: medium
  Đề xuất: known-limits

- **The «Đầu chủ» column still concludes «Đã rời sàn» for a newly added member once a server read has happened (moi=true) (r1)**
  Người dùng thấy gì: Căn gán cho người vừa vào sàn có thể tạm ghi «Đã rời sàn» cho tới khi danh bạ đọc lại xong; nếu đọc lại hỏng thì chữ sai còn nằm đó kèm báo lỗi.
  Căn cứ: Sai chữ tạm thời ở một ô, không mất dữ liệu, thường tự đúng sau khi đọc lại hoặc bấm Thử lại.
  file: `apps/web/src/app/(app)/inventory/danh-ba.ts`
  severity: low
  Đề xuất: known-limits

- **E2b's expected text describes a reason format the server and the test do not produce (r1)**
  Người dùng thấy gì: Người dùng không thấy gì khác; chỉ mô tả trong hồ sơ nghiệm thu lệch với cách máy chủ báo lý do.
  Căn cứ: Không có hậu quả với người dùng hay dữ liệu; sửa chữ trong hồ sơ rẻ nhưng không cần mở việc.
  file: `_acceptance/luat-chia-lead/evals.yaml`
  severity: low
  Đề xuất: wont-fix

- **Đo chỉ dẫn thay vì đầu ra, kèm assertion âm tính một mình: lời hứa "không tự thử lại" được đo bằng cách grep mã nguồn tìm setTimeout/setInterval (r1)**
  Người dùng thấy gì: Hiện Bảng hàng không tự thử lại danh bạ, nhưng nếu sau này ai đó đổi cách đọc thì bài kiểm có thể không bắt được.
  Căn cứ: Không ảnh hưởng người dùng hôm nay; chỉ là lưới an toàn cho thay đổi tương lai còn mỏng.
  file: `apps/web/src/app/(app)/inventory/danh-ba.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Assert chuỗi có mặt trong khi lời hứa là quan hệ giữa các giá trị: E8b đo nhãn lấy từ lõi bằng cách tìm tên định danh trong mã nguồn (r1)**
  Người dùng thấy gì: Nhãn trên màn hiện đúng, nhưng sau này nếu ai viết tay một nhãn lệch thì bài kiểm có thể không bắt được.
  Căn cứ: Không có sai lệch thật với người dùng hôm nay; rủi ro chỉ là chữ lệch dần về sau, sửa dễ khi gặp.
  file: `apps/web/src/app/(app)/settings/lead-routing/luat.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Assert chuỗi có mặt trong khi lời hứa là quan hệ giữa các giá trị: E10b xét "ô Đầu chủ hiện tên" bằng tên có mặt ở bất kỳ đâu trong trang (r1 · tệp đã đổi)**
  Người dùng thấy gì: Kịch bản thử có thể báo đạt dù ô Đầu chủ của đúng căn chưa chắc hiện tên.
  Căn cứ: Không phải lỗi của sản phẩm với người dùng; chỉ là bằng chứng nghiệm thu chưa chặt, bổ sung khi chạy lại chỗ thử.
  file: `_acceptance/luat-chia-lead/thu/chay-ui.mjs`
  severity: medium
  Đề xuất: known-limits

- **Cột Đầu chủ vẫn ghi «Đã rời sàn» cho người giữ mới khi lần đọc lại danh bạ đang chờ hoặc bị lỗi (r1)**
  Người dùng thấy gì: Khi một căn vừa gán cho người mới vào sàn, cột Đầu chủ có thể ghi nhầm «Đã rời sàn» trong lúc danh bạ đang đọc lại hoặc đọc lại bị lỗi. Tải lại trang hoặc bấm Thử lại thì hiện đúng tên.
  Căn cứ: Chỉ sai chữ tạm thời ở một ô, không mất hay lộ dữ liệu, người dùng tự gỡ được bằng cách tải lại, và chỉ xảy ra với người vừa mới vào sàn.
  file: `apps/web/src/app/(app)/inventory/danh-ba.ts`
  severity: medium
  Đề xuất: known-limits

- **Hằng DA_ROI_SAN bị khai lần thứ hai thay vì dùng lại chỗ đã có (r1)**
  Người dùng thấy gì: Chữ «Đã rời sàn» được khai ở hai nơi nên sau này sửa chữ ở một màn có thể lệch với màn kia. Hiện người dùng chưa thấy khác biệt nào.
  Căn cứ: Không ảnh hưởng người dùng lúc này, chỉ có nguy cơ lệch chữ về sau và sửa rất rẻ khi cần.
  file: `apps/web/src/app/(app)/settings/lead-routing/luat.ts`
  severity: low
  Đề xuất: known-limits

- **Câu báo lỗi của phép kiểm nói ngược với điều đang được kiểm (r1)**
  Người dùng thấy gì: Nếu bài kiểm này đỏ, dòng báo lỗi sẽ nói ngược ý, làm người sửa hiểu nhầm. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ gây hiểu nhầm cho người bảo trì khi bài kiểm đỏ, không đụng người dùng, và sửa một dòng chữ bất cứ lúc nào.
  file: `packages/api/test-db/luat-chia-lead.test.ts`
  severity: low
  Đề xuất: wont-fix

- **When the saved pair of deadlines is invalid, saving one deadline shows 'Đã lưu' even though the value is not applied, or brings back an old bad value the user never saw (r1)**
  Người dùng thấy gì: Khi sàn đang có cặp hạn lưu sai từ trước, quản trị sửa một hạn vẫn thấy «Đã lưu» dù luật không được áp, hoặc một giá trị ẩn bất ngờ có hiệu lực. Quản trị có thể tưởng đã sửa xong trong khi lead mới vẫn chia theo hạn mặc định.
  Căn cứ: Gây hiểu lầm về luật đang chạy cho lead thật, nhưng chỉ xảy ra khi dữ liệu đã hỏng từ trước và màn vẫn đang hiện báo mặc định; cần thiết kế cách xử lý riêng.
  file: `apps/web/src/app/(app)/settings/lead-routing/luat-chia-lead.tsx`
  severity: medium
  Đề xuất: new-contract

- **If reading the Hôm nay group set fails, the two queue thresholds are silently unlocked, with no notice (r1)**
  Người dùng thấy gì: Nếu việc đọc bộ nhóm Hôm nay lỗi mà sàn có bộ nhóm riêng, hai ngưỡng vẫn mở sửa và báo «Đã lưu» nhưng không có tác dụng. Quản trị không được báo gì về lần đọc lỗi.
  Căn cứ: Chỉ xảy ra khi sàn có bộ nhóm riêng và lần đọc đó lỗi đúng lúc; không mất dữ liệu, tải lại sẽ thấy ngưỡng bị khoá đúng.
  file: `apps/web/src/app/(app)/settings/lead-routing/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **chuNguon shows 'Đã rời sàn' for a current member whose name is blank (r1)**
  Người dùng thấy gì: Thành viên còn trong sàn nhưng chưa đặt tên sẽ hiện là «Đã rời sàn» ở dòng người đổi luật. Chỉ là nhãn sai ở dòng thông tin phụ.
  Căn cứ: Rất hiếm, chỉ sai một nhãn phụ, không ảnh hưởng luật hay dữ liệu, người dùng đặt tên là hết.
  file: `apps/web/src/app/(app)/settings/lead-routing/luat.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 3 — kiểm «chữ có mặt» trong khi lời hứa là quan hệ giữa các giá trị (E10b: tên đầu chủ hiện ở đúng ô của căn được gán) (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài thử giao diện có thể báo đạt dù ô Đầu chủ của căn được gán vẫn hiện «…», vì nó chỉ tìm tên ở bất kỳ đâu trên trang. Người dùng không bị ảnh hưởng trực tiếp, nhưng bằng chứng nghiệm thu yếu hơn.
  Căn cứ: Chỉ làm bằng chứng kém chặt chứ sản phẩm không sai, và sửa bài thử không tốn nhiều.
  file: `_acceptance/luat-chia-lead/thu/chay-ui.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — kiểm âm tính đứng một mình, không có đối chứng dương (E6a: vai khác không thấy mục trong cột mục lục) (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài thử có thể báo «vai khác không thấy mục Luật chia lead» là đạt dù thực ra nó không tìm đúng chỗ để thấy mục đó. Người dùng không bị ảnh hưởng trực tiếp, nhưng khẳng định về quyền yếu hơn.
  Căn cứ: Là độ tin cậy của bằng chứng, không phải lỗi người dùng gặp; vì liên quan quyền nên nên ghi vết, nhưng việc ẩn mục còn được gác thêm bằng chặn 403 ở máy chủ.
  file: `_acceptance/luat-chia-lead/thu/chay-ui.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (kèm hình dạng 1) — doesNotMatch đứng một mình trên mã nguồn để chứng «nhãn không viết trong màn» (E8b) (r1)**
  Người dùng thấy gì: Bài kiểm có thể bỏ sót nếu ai đó viết lại nhãn lựa chọn thẳng trong màn theo cách khác, làm chữ trên màn lệch khỏi từ vựng chung. Hiện màn chưa sai chữ.
  Căn cứ: Chỉ là nguy cơ về sau, nhãn hiện tại đúng, và lệch chữ nếu có thì dễ thấy và sửa.
  file: `apps/web/src/app/(app)/settings/lead-routing/luat.test.ts`
  severity: medium
  Đề xuất: wont-fix

- **Hình dạng 1/4 — đo mã nguồn thay vì hành vi cho lời hứa «không tự thử lại theo nhịp» (E10a) (r1)**
  Người dùng thấy gì: Bài kiểm có thể không phát hiện nếu danh bạ sau này tự đọc lại liên tục khi bị lỗi. Hiện không thấy vòng thử lại tự động nào.
  Căn cứ: Đã có bài giao diện đếm số lần gọi bù lại, và sản phẩm hiện đúng nên chi phí sửa không đáng.
  file: `apps/web/src/app/(app)/inventory/danh-ba.test.ts`
  severity: low
  Đề xuất: wont-fix

## Chưa adversarial-verify (refuter chết)

⚠ Cụm ngoài vùng phủ: 2/7 lỗi rơi vào file không bộ đo nào phủ (_acceptance/luat-chia-lead/thu/dung-d.mjs, _acceptance/luat-chia-lead/thu/chay-ui.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
