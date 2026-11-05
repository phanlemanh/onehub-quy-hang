# Review findings: luat-chia-lead (round 2)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bộ bắt tín hiệu mới thoát ngay, bỏ qua bước trả lại cơ sở dữ liệu: chỗ thử dãy D bị hỏng âm thầm cho mọi lượt sau**
  Người dùng thấy gì: Không ảnh hưởng người dùng thật. Nếu lượt chấm bị ngắt giữa chừng, chỗ thử có thể còn sót quyền sai và các lượt chấm sau báo lỗi giả như thể sản phẩm hỏng.
  Căn cứ: Chỉ ảnh hưởng chỗ thử nội bộ, không mất dữ liệu thật, và người chấm tự dựng lại chỗ thử được nên ghi lại hạn chế là đủ.
  file: `_acceptance/luat-chia-lead/thu/chay-ui.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 6 (đường hardcode, đo cây khác): chỗ thử dùng lại bất kỳ máy dev nào đang nghe cổng 3495 mà không kiểm nó chạy từ cây đang chấm**
  Người dùng thấy gì: Kết quả chấm có thể đến từ bản mã của nhánh khác nếu máy đó đang chiếm sẵn cổng, nên bằng chứng nghiệm thu có thể không phản ánh đúng bản đang kiểm.
  Căn cứ: Không ảnh hưởng người dùng thật nhưng làm bằng chứng kém tin cậy; tránh được bằng cách tắt máy dev khác trước khi chấm.
  file: `_acceptance/luat-chia-lead/thu/dung-d.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert «chuỗi có mặt» trong khi lời hứa là quan hệ): E10b dò tên đầu chủ trên cả trang thay vì trong ô Đầu chủ của căn đã gán**
  Người dùng thấy gì: Phép kiểm cột Đầu chủ có thể báo đạt dù ô của căn đúng vẫn hiện «…», nên một lỗi hiển thị có thể lọt qua kiểm thử.
  Căn cứ: Là lỗ hổng của phép kiểm chứ chưa phải lỗi người dùng thấy; sửa phép đo không đắt nhưng không chặn việc phát hành.
  file: `_acceptance/luat-chia-lead/thu/chay-ui.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert «chuỗi có mặt» trong khi lời hứa là quan hệ): E5b ca 400 không ghi lại lý do máy chủ trả nên không đối chiếu được với chữ trong dòng**
  Người dùng thấy gì: Bằng chứng chưa chứng minh chữ báo lỗi trên màn đúng là lý do máy chủ trả, nên nếu màn tự đặt câu báo khác thì phép kiểm vẫn qua.
  Căn cứ: Rủi ro chỉ ở độ chắc của bằng chứng, người dùng thật không mất gì; bổ sung đối chứng sau là rẻ.
  file: `_acceptance/luat-chia-lead/thu/chay-ui.mjs`
  severity: medium
  Đề xuất: known-limits

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

⚠ Cụm ngoài vùng phủ: 4/4 lỗi rơi vào file không bộ đo nào phủ (_acceptance/luat-chia-lead/thu/chay-ui.mjs, _acceptance/luat-chia-lead/thu/dung-d.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
