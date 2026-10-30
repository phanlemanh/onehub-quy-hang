---
schema_version: 1
feature: Link trang khách dán vào Zalo hiện ảnh xem trước, và lượt Zalo tự lấy ảnh không bị tính là khách mở
slug: bai-thu-zalo
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, cli]
status: signed-off
design_doc: _acceptance/bai-thu-zalo/design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-30T02:17:46Z
---

# Acceptance Contract: bai-thu-zalo

## Context

Bài thử (c) của Kiến trúc §9 bước 1: trước khi dựng trang khách và luồng Gửi, đo hành vi thật của Zalo — ảnh xem trước
của link, lượt Zalo tự lấy trang, chia sẻ ảnh + tin từ web iPhone, kéo ảnh từ Zalo máy tính vào trình duyệt. Mã thử là
một máy chủ Node thuần trong hồ sơ; kết quả là số đo và một ADR chọn cách làm.

Source input: `docs/plan/lo-trinh.json` hàng 3 · `_acceptance/bai-thu-zalo/opportunity.md`

## Criteria

- AC-1: Given máy chủ thử đang chạy, When một máy gọi `GET /s/<mã>` mà không chạy JS, Then HTML trả về đã có
  `og:title`, `og:description`, `og:image`, `og:url`, `og:type` và `twitter:card`; `og:image` và `og:url` là URL tuyệt đối
  theo host và giao thức của yêu cầu (đi qua đường hầm thì theo `x-forwarded-proto`/`x-forwarded-host`).
- AC-2: Given máy chủ thử đang chạy, When gọi `GET /og/<mã>.png`, Then nhận PNG hợp lệ 1200×630, `content-type:
  image/png`, dưới 300 KB.
- AC-3: Given một mã có lượt tải trang và tải ảnh từ bất kỳ UA nào nhưng không có lượt báo từ JS, When đếm, Then số mở của
  mã là 0; thêm một lượt báo từ JS của UA người thì số mở là 1; hai lượt báo cùng phiên vẫn là 1.
- AC-4: Given lượt báo từ JS mang UA lớp máy hoặc đầu yêu cầu prefetch, When đếm, Then lượt đó không vào số mở mà vào «mở
  bị loại» kèm lý do; mọi lượt tải trang đều ghi UA và lớp để thước UA tính lại được.
- AC-5: Given trang chia sẻ, When người bấm «Gửi ảnh + tin», Then trình duyệt chia sẻ được tệp thì gọi `navigator.share`
  với tệp ảnh + tin; không chia sẻ được tệp thì gửi link + tin; không có `navigator.share` thì hiện lời báo rõ; mọi kết
  cục (đã gửi, người huỷ, lỗi, không hỗ trợ) ghi vào nhật ký.
- AC-6: Given trang kéo ảnh, When thả hoặc dán một tệp ảnh, Then trang hiện ảnh và ghi kiểu, cỡ và danh sách kiểu của
  dữ liệu kéo vào nhật ký; thả thứ không có tệp ảnh thì ghi «không có tệp ảnh» kèm các kiểu nhận được.
- AC-7: Given chủ kho chạy một lệnh, When lệnh khởi động, Then máy chủ lên cổng 3463, mở đường hầm công khai (có
  `cloudflared` thì dùng, không thì localhost.run qua `ssh`) hoặc báo rõ vì sao không mở và chạy trên máy; in link các mã
  và các bước thử; nhật ký nằm dưới `.acceptance-runs/`, không chứa IP thô — kể cả IP đến qua `x-forwarded-for` hay `cf-connecting-ip`; dừng bằng `Ctrl+C` thì ghi tóm tắt.
- AC-8: Given mọi trang của máy chủ thử, When quét HTML, Then chỉ có dữ liệu mẫu mang nhãn «Mẫu»: không mẫu số điện thoại
  Việt Nam, không chữ «giá đáy», «chủ nhà», «sổ».
- AC-9: Given nhật ký phiên thử với Zalo thật, When ghi kết quả, Then `ket-qua.md` chứa đúng bảng đếm và bảng kết luận
  mà `tom-tat.mjs` tính từ `nhat-ky-zalo.jsonl` (bản sạch: không băm IP, không IP thô); kết luận từng vế do luật viết trước
  trong `tom-tat.mjs` quyết, không chép tay — vế 2 chỉ đạt khi mã K có ít nhất một lượt tải trang hoặc ảnh mà số mở = 0,
  và mã A, I có số mở ≥ 1.
- AC-10: Given `ket-qua.md`, When đọc ADR mới của bài thử, Then ADR ở trạng thái «đề xuất» và với bốn việc — cách đếm
  lượt mở, thẻ và cỡ ảnh xem trước, cách chia sẻ trên iPhone, cách nhận ảnh từ Zalo máy tính — nêu khuyến nghị, lối khác và
  giá, mỗi điều trỏ số trong `ket-qua.md`; vế nào không đạt thì nêu các đường đi vòng để chủ kho chọn. (judgment)

## Coverage

Quét bằng morphological-scan (preset test-matrix) — chi tiết trong `design.md` mục «Không gian đã quét».

- Trục A — bề mặt: Zalo Android | Zalo iPhone | Zalo máy tính | Safari iPhone [thước CE: Kiến trúc §7]
- Trục B — hành vi: xem trước | mở | chia sẻ ra | nhận ảnh vào [thước CE: bốn vế `bat_khi` hàng 3]
- Trục C — ai gọi trang: máy Zalo lấy xem trước | người mở | prefetch/quét link | máy khác [thước CE: ngành Open Graph;
  UA của Zalo chưa biết — chính là điều bài thử đo, nhật ký phiên thật là thước]
- Trục D — kết cục: đạt | không đạt | không hỗ trợ có đường lui [thước CE: W3C Web Share API Level 2]

## Đường đo

- Thước: ảnh xem trước hiện trên Zalo Android, iPhone · số từ: câu trả lời `quan-sat` người thử bấm trên trang `/s/<mã>`
  cùng lượt `tai-anh` của mã · bảo đảm bởi: AC-1, AC-2, AC-9
- Thước: lượt tự lấy không vào số mở · số từ: bảng đếm theo mã (tải trang, tải ảnh, mở, mở bị loại) của mã K (chỉ dán,
  không bấm) và mã A, I · bảo đảm bởi: AC-3, AC-4, AC-9
- Thước: chia sẻ ảnh + tin từ web iPhone mở được bảng chia sẻ · số từ: sự kiện `chia-se` và câu trả lời `quan-sat` trên
  `/chia-se` · bảo đảm bởi: AC-5, AC-9
- Thước: kéo ảnh từ Zalo máy tính vào trình duyệt · số từ: sự kiện `nhan-anh` trên `/keo-anh` · bảo đảm bởi: AC-6, AC-9

## Out of scope

- Trang khách thật trong `apps/web/src/app/s/**` — đi hàng dựng sau ADR.
- Chia sẻ trên Android, xem trước trên Zalo máy tính, web đã cài trên iPhone (Later của bản quét).
- Đăng nhập, đọc hay gửi tin Zalo; Zalo OA (bất biến 3, Kiến trúc §8).
- Chốt cách làm cho trang khách: ADR của bài thử chỉ đề xuất; chủ kho chốt sau (sổ quyết định, dòng 13).

## Notes

- Mã thử nằm trong `_acceptance/bai-thu-zalo/thu/` theo luật đợt 5; không thành mã sản phẩm.
- Phiên với Zalo thật cần chủ kho cầm điện thoại: gom thành một yêu cầu `can-nguoi` (luật đợt 16).
- Known limits — chọn ở Cổng Bằng chứng 2026-10-30:
  - Ngoài-1: Khi đường hầm nối muộn quá 45 giây, lệnh chạy thử có thể in một dòng «link công khai đã đóng» gây khó hiểu.
  - Ngoài-2: Một ca kiểm còn dùng số điện thoại dạng số thật thay vì số mẫu 0900 000 0xx.
  - Ngoài-3: Máy chủ thử nhận dữ liệu trang báo về lỏng hơn các đường khác; nhật ký cần được xem lại trước khi đưa vào kho.
  - Ngoài-4: Phần lời của ket-qua.md kể hai lượt «Gửi link + tin» là từ iPhone, trong khi nhật ký ghi từ trình duyệt máy tính; bảng số vẫn đúng.
  - Ngoài-5: Cùng chỗ lệch trên: chưa có lượt «Gửi link + tin» nào đo trên iPhone, điều «iPhone chỉ nhận link» chỉ dựa vào lời chủ kho.
  - Ngoài-6: Câu trả lời «Zalo nhận tin» trên trang chia sẻ không gắn với từng cách gửi, nên không tách được cách nào làm mất tin.
  - Ngoài-7: Bài kiểm loại lượt của máy rút danh sách từ chính mã, nên bỏ bớt một loại máy khỏi danh sách sẽ không làm bài kiểm đỏ.
  - Ngoài-8: Bài kiểm đếm so phép tính với chính nó, không bắt được lỗi ở bước lập bảng.
  - Ngoài-10: Một ca kiểm dựng dòng nhật ký bằng tay thay vì qua máy chủ thật.
  - Ngoài-11: Bài kiểm «nhật ký sạch không có băm IP» thiếu đối chứng dương rằng bản thô có khoá đó.
  - Ngoài-12: Luật kết luận vế 3 (chia sẻ iPhone) chỉ có ca đạt, chưa có ca không đạt.
  - Ngoài-13: Lời báo «không mở được đường hầm» chưa có bài kiểm đo đầu ra.
