---
schema_version: 1
feature: "Đầu chủ gọi ép giá đợt hai trên máy tính: thấy lịch sử trả giá và giá đáy nội bộ, ghi kết quả bằng phím, hạ giá theo đúng luật sửa giá"
slug: goi-ep-gia-dot-hai
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: signed-off
design_doc: docs/superpowers/specs/2026-11-02-goi-ep-gia-dot-hai-design.md
approved_by: Manh Phan
approved_at: 2026-11-02
---

# Acceptance Contract: goi-ep-gia-dot-hai

## Context

Hàng 29 (dãy D), mã L6, phác thảo KD2 — Tham chiếu §5 (một bộ kết quả gọi), §6 (lớp nguồn), §8 luật 7, 9, 10, 14, 16.
Đứng trên hàng 28 (chế độ cuộc gọi khai thác `/units/call?lead=`), hàng 22 (Hôm nay, nhóm «Nên gọi điều chỉnh giá») và hàng 13
(bộ đồng bộ trên máy). «Đầu chủ» = vai `listing_agent`; «người thấy nguồn» = đầu chủ giữ căn hoặc trưởng nhóm (lõi
`canSeeSource`). Tám chỗ chỉ chủ kho quyết ghi ở sổ (Hỏi-1…Hỏi-8); tiêu chí dưới viết theo khuyến nghị của từng Hỏi.

Source input: `docs/plan/lo-trinh.json` hàng 29 · `_acceptance/goi-ep-gia-dot-hai/opportunity.md`

## Criteria

- AC-1: Given đầu chủ có một căn Đang bán ở nhóm «Nên gọi điều chỉnh giá» của Hôm nay, When bấm «Ghi cuộc gọi» trên dòng căn (Hỏi-8: «Gọi» để dành cho nút quay số sau «Mở số»; nút mở chế độ khai thác trên dòng lead của hàng 28 cũng đổi nhãn thành «Ghi cuộc gọi»), Then trang
  `/units/call?hang=<mã hồ sơ>` mở chế độ ép giá: đầu màn nêu mã căn · toà, nấc, giá hiện tại kèm điều kiện phí, số ngày lên
  bảng và số ngày từ lần đổi giá gần nhất, đọc từ kho trên máy; mã hồ sơ không có trên máy thì trang báo «Không thấy căn này
  trong kho của bạn» kèm «Về Hôm nay»; `/units/call?lead=` của hàng 28 vẫn mở chế độ khai thác như cũ.
- AC-2: Given hồ sơ có dãy sự kiện (tạo, đổi giá, lên Đang bán, «Còn · giữ giá», đổi nấc), When chế độ ép giá mở, Then khối
  «Lịch sử trả giá» liệt mỗi sự kiện giá và nấc thành một dòng, mới nhất trên: ngày giờ, việc («Lên bảng <giá>», «Hạ <cũ> →
  <mới>», «Tăng <cũ> → <mới>», «Đổi điều kiện phí», «Còn · giữ giá», «Đã cọc», «Đã bán <giá chốt>», «Ngừng hẳn — <lý do>»),
  điều kiện phí và «đã xác nhận với chủ» khi sự kiện mang dấu ấy; dòng đầu là «Tạo hồ sơ» (Hỏi-5: chưa có giá lead gốc); đọc từ lịch sử trên máy, mất mạng vẫn hiện bản đã kéo, lịch sử chưa kéo về thì khối nói «Đang tải lịch sử» và tự hiện khi kéo xong.
- AC-3: Given người mở là người thấy nguồn của căn và chủ nhà có giá đáy, When chế độ ép giá mở, Then khối «Giá đáy chủ từng
  nói · nội bộ» hiện giá đáy và phần trăm cách giá về tay hiện tại; chủ nhà chưa có giá đáy thì «Chưa ghi giá đáy»; người
  không thấy nguồn thì khối không hiện; `GET /api/v1/listings/{id}/owner` trả `floorPrice` chỉ cho người thấy nguồn, và trang
  không ghi giá đáy vào kho trên máy hay bộ nhớ trình duyệt. (cross-layer)
- AC-4: Given chế độ ép giá đang mở, When đầu chủ bấm phím H · G · B · K (con trỏ không ở ô chữ), Then đúng kết quả ấy được
  chọn: H mở ô giá mới, G sẵn sàng ghi giữ giá, B mở ba lối, K đóng về Hôm nay; Esc bỏ kết quả đang chọn; phím chữ khi con
  trỏ ở ô chữ không chọn kết quả; mỗi kết quả có thể bấm chuột như phím.
- AC-5: Given kết quả H đang chọn, When đầu chủ gõ giá theo cách nói của nghề, chọn điều kiện phí rồi Enter — chỉ bằng phím,
  Then máy nói lại «Hiểu là <giá> · <phí> · trước <giá cũ> · <phần trăm>» trước khi ghi; đổi quá 20% hay đổi điều kiện phí
  thì hỏi lại kèm cũ → mới; ghi đúng một sự kiện đổi giá qua bộ đồng bộ, tính là vừa xác nhận với chủ nhà (Hỏi-4), và máy
  chủ nhận đúng giá ấy; mất mạng thì lần hạ giá ghi trên máy, chỉ báo nói chưa gửi vì mất mạng và có mạng lại thì máy chủ nhận đúng một lần; máy chủ từ chối (căn vừa đổi ở chỗ khác, «Đã bán» thắng) thì hồ sơ vào Cần xem và chỉ báo nói vì sao; chữ chưa hiểu thì báo dưới ô, không ghi; không câu nào gợi ý mức nên hạ. (cross-layer)
- AC-6: Given kết quả G đang chọn, When đầu chủ Enter, Then ghi đúng một sự kiện «Còn · giữ giá»; mốc xác nhận với chủ nhà
  của hồ sơ trên máy chủ đổi sang lần ghi ấy và căn rời nhóm «Nên gọi điều chỉnh giá» của Hôm nay. (cross-layer)
- AC-7: Given kết quả B đang chọn, When đầu chủ chọn một trong ba lối rồi Enter, Then Đã cọc ghi chuyển sang Đang giao dịch;
  Sàn mình bán ghi chuyển sang Đã bán kèm giá chốt (bắt buộc, đọc theo cách nói của nghề) và ngày bán (mặc định hôm nay);
  Chủ bán nơi khác ghi chuyển sang Ngừng hẳn với lý do chủ bán nơi khác; lối không mở theo bảng chuyển của lõi thì tắt kèm
  lý do; thiếu giá chốt thì báo dưới ô, không ghi; máy chủ nhận đúng nấc ấy. (cross-layer)
- AC-8: Given chế độ ép giá đang mở, When đầu chủ chọn K «Không nghe máy», Then không sự kiện nào được ghi vào hồ sơ (Hỏi-2),
  trang về Hôm nay và căn vẫn ở nhóm «Nên gọi điều chỉnh giá».
- AC-9: Given bố cục «Hồ sơ» của ADR-0024 (Hỏi-1), When mở chế độ ép giá hay chế độ khai thác trên máy tính, Then cả hai dựng
  trong bố cục ấy — đầu màn rồi thân một cột: kết quả gọi (chỉ ép giá) → lịch sử trả giá và giá đáy (chỉ ép giá) → danh sách
  hỏi → tính giá → so giá; bài quét bố cục không còn ngoại lệ có hạn nào cho trang cuộc gọi; khổ 1280 không cuộn ngang; mọi
  bài kiểm và bài chấm máy của hàng 28 vẫn đạt.
- AC-10: Given người vào `/units/call?hang=` không có vai Đầu chủ (telesales, quản trị sàn, trưởng nhóm không vai Đầu chủ — Hỏi-7), When mở trang, Then trang không
  hiện (không thấy); với đầu chủ, trang và mọi lời gọi của nó không mang số chủ nhà hay ảnh sổ, và giá đáy chỉ đi trên đường
  chủ nhà của hàng.

## Coverage

Quét bằng skill morphological-scan, preset entity-feature (đối tượng: một cuộc gọi ép giá trên một hồ sơ căn).

- Trục A — vai người mở: đầu chủ giữ căn · đầu chủ khác · trưởng nhóm (thấy nguồn ở API, không mở màn — Hỏi-7) · telesales · quản trị [thước CE: Tham chiếu §6 lớp trường] → AC-3, AC-10
- Trục B — kết quả gọi: Hạ · Giữ · Đã cọc · Sàn mình bán · Chủ bán nơi khác · Không nghe máy [thước CE: Tham chiếu §5 bộ bốn + ba lối] → AC-4, AC-5, AC-6, AC-7, AC-8
- Trục C — luật sửa giá: dưới 20% · quá 20% · đổi điều kiện phí · chữ chưa hiểu [thước CE: luật 7, `canHoiLai`] → AC-5
- Trục D — dữ liệu nguồn: có giá đáy · chưa giá đáy · không thấy nguồn [thước CE: lõi `ownerView`] → AC-3
- Trục E — lịch sử: có đổi giá · chưa đổi giá · có đổi nấc · chưa kéo về [CE chưa kiểm chứng] → AC-2
- Trục F — mạng: có mạng · mất mạng · máy chủ từ chối [thước CE: bộ đồng bộ hàng 13, 61] → AC-5, AC-6, AC-7
- Trục G — bố cục: ép giá · khai thác · 1280 · dưới lg [thước CE: ADR-0024 ma trận bố cục] → AC-9
- Later: ghi «Không nghe máy» (Hỏi-2), ghi giá đáy mới (Hỏi-3), ô tắt xác nhận (Hỏi-4), đồng hồ và quay số (hàng 30), tin rao công khai.

## Đường đo

- Thước: số căn gọi ép giá đợt hai — ở mức căn, không tách được lần ghi từ màn cuộc gọi với lần sửa ở Bảng hàng hay điện thoại · số từ: căn có sự kiện `price_changed` hay `owner_confirmed` ghi lúc căn ở nhóm «Nên gọi điều chỉnh giá» đợt hai (sự kiện của hồ sơ, đã có) · bảo đảm bởi: AC-5, AC-6 (hai lối ghi) · ngưỡng số và timebox: chủ kho đặt trước khi thử (ô cơ hội còn để trống) · đếm: màn số liệu hàng sau

## Out of scope

- Đồng hồ cuộc gọi, «Mở trên điện thoại», số chủ che một phần, quay số — hàng 30.
- Ghi chú cuộc gọi; tin rao công khai bên ngoài; «chủ còn căn nào khác» — Hỏi-6.
- Dòng giá lead gốc trong lịch sử trả giá — Hỏi-5.
- Ghi «Không nghe máy» thành sự kiện — Hỏi-2, hàng riêng nếu chọn.
- Ghi giá đáy mới kèm câu chủ nói và ngày — Hỏi-3, migration lớp nguồn.
- Ô tắt «vừa xác nhận với chủ nhà» khi hạ giá — Hỏi-4, sửa bộ đồng bộ.
- Lưu định nghĩa bao phí kèm giá; sàn đặt tỉ lệ — hàng 49.
- Chế độ cuộc gọi trên điện thoại (K1–K4).

## Notes

- Không migration, không bảng mới, không API mới.
- Tám Hỏi ở `decisions.jsonl`; người chọn khác khuyến nghị thì tiêu chí liên quan sửa trước khi duyệt.
- Known limits — chọn ở Cổng Bằng chứng 2026-11-03:
  - Ngoài-1: Người dùng cuối không bị ảnh hưởng: tính năng ghi giữ giá hoạt động như đã hứa. Chỉ là hồ sơ nghiệm thu không nói rõ hai bài thử đã dùng nhầm căn của nhau, nên lần chấm sau có thể bị nhiễu và báo xanh chưa chắc chắn.
  - Ngoài-2: Bài thử tự động xác nhận «Enter không ghi nhầm Còn · giữ giá» chỉ chờ 3 giây nên có thể bỏ sót lỗi nếu máy chủ nhận chậm hơn. Người dùng không gặp lỗi mới nào từ đây; chỉ là lưới an toàn của đội kiểm thử kém chặt hơn.
  - Ngoài-3: Nếu một sàn đổi tên nhóm «Nên gọi điều chỉnh giá», màn ghi cuộc gọi vẫn hiện tên mặc định, lệch với tên trên màn Hôm nay. Chỉ lệch chữ, không sai dữ liệu. (Đã sửa ở vòng chấm sau — nhãn nhóm nay lấy tên sàn đặt; dòng giữ theo chọn của chủ kho.)
  - Ngoài-4: Nếu đầu chủ chọn «Giữ giá» rồi dùng phím mũi tên sang lựa chọn khác và nhấn Enter để chọn, máy ghi ngay «Còn · giữ giá» thay vì chuyển lựa chọn. Một sự kiện ghi nhầm có thể phải sửa lại sau. (Đã sửa ở vòng chấm sau — Enter chỉ ghi khi con trỏ ở đúng lựa chọn đang chọn; dòng giữ theo chọn của chủ kho.)
  - Ngoài-5: Bài thử tự động cho thao tác bấm chuột rồi Enter chưa chứng minh được điều nó hứa, nên lỗi bấm lại làm mất lựa chọn có thể lọt qua mà vẫn báo đạt. Người dùng không thấy gì cho đến khi lỗi thật xảy ra. (Đã sửa ở vòng chấm sau — bài thử viết lại bằng chuột và phím thật, đếm sự kiện; dòng giữ theo chọn của chủ kho.)
  - Ngoài-6: Bài thử chỉ kiểm có dòng chữ «Đã ghi» hiện ra, không đếm số lần ghi và không kiểm lựa chọn còn được giữ. Ghi hai lần hay mất lựa chọn vẫn có thể được báo là đạt. (Đã sửa ở vòng chấm sau — bài thử nay đếm owner_confirmed trên máy chủ và kiểm lựa chọn còn giữ; dòng giữ theo chọn của chủ kho.)
  - Ngoài-7: Thẻ trên đầu màn gọi vẫn ghi «Nên gọi ép giá», là chữ cũ đã bỏ, và không theo tên nhóm mà sàn tự đặt. Đầu chủ vẫn gọi và ghi được bình thường, chỉ thấy chữ lệch với màn Hôm nay. (Đã sửa ở vòng chấm sau — nhãn đầu màn không còn chữ «ép giá», lấy tên nhóm sàn đặt; dòng giữ theo chọn của chủ kho.)
  - Ngoài-8: Nếu mở một căn chưa có lịch sử trên máy lúc mất mạng hoặc máy chủ lỗi, khối lịch sử cứ hiện «Đang tải» mà không báo lỗi hay cho thử lại. Có mạng lại và mở lại thì lịch sử hiện đúng.
  - Ngoài-9: Bài kiểm câu «thấp hơn giá về tay» chỉ thử một trường hợp nên có thể bỏ sót việc tính nhầm khi giá đã gồm phí. Người dùng hiện chưa thấy sai số nào.
  - Ngoài-10: Bài kiểm đầu màn dùng dữ liệu căn tự khai chứ không dựng từ chuỗi sự kiện thật, nên nếu cấu trúc dữ liệu đổi sau này bài kiểm có thể vẫn xanh dù đầu màn sai.
