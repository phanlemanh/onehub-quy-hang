# Review findings: bai-thu-luoi-5000-dong (round 2)

## Trong hợp đồng

Không có finding nào map được vào AC ở round này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Vòng chờ máy chủ quay liên tục, không nghỉ và không có trần khi máy chủ trả mã khác 2xx**
  Người dùng thấy gì: Nếu bản dựng thử lỗi hoặc trả trang lỗi, lệnh đo lại có thể treo mãi thay vì báo không dựng được, người chấm phải tự ngắt.
  Căn cứ: Chỉ xảy ra ở tình huống hỏng hiếm, không làm sai số đo nào, người chấm tự ngắt và chạy lại được.
  file: `_acceptance/bai-thu-luoi-5000-dong/thu/do-lai.mjs`
  severity: medium
  Đề xuất: known-limits

- **Chốt chặn «máy chủ đã thoát» không bắt được khi cổng bị chiếm, nên vẫn có thể đo nhầm máy chủ**
  Người dùng thấy gì: Nếu có một máy chủ cũ còn sót trên cổng đo, lệnh đo lại có thể đo nhầm máy chủ đó mà không báo gì, nên số đo có thể không phải của bản vừa dựng.
  Căn cứ: Chỉ gặp khi còn máy chủ sót lại từ lượt trước, người chấm tắt nó rồi đo lại là xong; kết luận đã đo hiện không sai.
  file: `_acceptance/bai-thu-luoi-5000-dong/thu/do-lai.mjs`
  severity: medium
  Đề xuất: known-limits

- **Chú thích đầu tệp do-lai.mjs vẫn ghi cổng 3462, trái với mặc định mới 3468**
  Người dùng thấy gì: Hướng dẫn ở đầu công cụ đo vẫn ghi cổng cũ, ai làm theo nguyên văn có thể đụng cổng với máy chủ dev.
  Căn cứ: Chỉ là dòng chữ hướng dẫn lệch, hậu quả nhẹ, người dùng đọc mặc định là biết và không mất dữ liệu nào.
  file: `_acceptance/bai-thu-luoi-5000-dong/thu/do-lai.mjs`
  severity: low
  Đề xuất: wont-fix

- **Bước E8 vẫn dựng nhánh thử ở cổng 3462, trùng máy chủ dev mà config khai cho ui-check**
  Người dùng thấy gì: Khi người chấm làm theo bước nhìn giao diện, họ có thể tranh cổng với máy chủ dev và nhìn nhầm hoặc tắt nhầm máy chủ.
  Căn cứ: Chỉ làm vướng khâu chấm, không ảnh hưởng người dùng cuối; tự khắc phục bằng cách tắt máy chủ kia rồi chạy lại.
  file: `_acceptance/bai-thu-luoi-5000-dong/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Vòng chờ máy chủ lặp nóng mãi mãi khi máy chủ trả mã khác 2xx: nhánh này bỏ qua cả mốc hết giờ lẫn lệnh ngủ**
  Người dùng thấy gì: Nếu trang thử trả lỗi, lệnh đo lại có thể quay mãi mà không bao giờ báo không dựng được.
  Căn cứ: Chỉ ở tình huống hỏng hiếm của công cụ chấm, không mất dữ liệu, người chấm ngắt và chạy lại được.
  file: `_acceptance/bai-thu-luoi-5000-dong/thu/do-lai.mjs`
  severity: medium
  Đề xuất: known-limits

- **Lần kiểm «cổng bị chiếm» có điều kiện chạy đua: máy chủ mồ côi chiếm sẵn cổng 3468 vẫn bị coi là máy chủ của lệnh**
  Người dùng thấy gì: Nếu còn máy chủ sót từ lượt trước, lệnh đo lại có thể đo nhầm nó và cho số không phải của bản vừa dựng.
  Căn cứ: Chỉ xảy ra khi có máy chủ sót, người chấm tắt đi rồi đo lại được; không ảnh hưởng người dùng cuối.
  file: `_acceptance/bai-thu-luoi-5000-dong/thu/do-lai.mjs`
  severity: medium
  Đề xuất: known-limits

- **Lần kiểm «máy chủ đã thoát giữa lượt đo» trong doMot là mã chết vì cả ba lượt đo chạy đồng bộ liền nhau**
  Người dùng thấy gì: Thông báo riêng cho trường hợp máy chủ chết giữa lúc đo sẽ không bao giờ hiện, nhưng lỗi vẫn lộ ra bằng một thông báo lỗi chung.
  Căn cứ: Hậu quả rất nhẹ vì lỗi vẫn bị báo ra theo đường khác, chỉ khác lời nhắn, sửa không đáng công.
  file: `_acceptance/bai-thu-luoi-5000-dong/thu/do-lai.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc, không round-trip): ca «không cuộn tới dòng 5.000 (khung đều mà nội dung đứng yên)» chỉ đưa một cờ boolean viết tay vào danhGia, phần tính ra cờ ấy ở máy đo không được kiểm**
  Người dùng thấy gì: Bài kiểm chưa bảo vệ được khâu máy đo tính ra việc đã cuộn tới dòng cuối, nên nếu khâu đó hỏng sau này có thể không ai phát hiện.
  Căn cứ: Lần đo hiện tại đúng và đã có cờ cuộn tới cuối, rủi ro chỉ ở lần sửa sau; bổ sung bài kiểm khi cần là đủ.
  file: `_acceptance/bai-thu-luoi-5000-dong/thu/nguong.test.mjs`
  severity: low
  Đề xuất: known-limits

- **Lệnh đo lại gọi sysctl vm.loadavg chỉ chạy được trên macOS, đo xong mới chết và không in JSON (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài đo lặp lại chỉ chạy được trên máy Mac; người chạy trên Linux hay máy chủ CI sẽ đợi đo xong rồi nhận lỗi mà không có kết quả.
  Căn cứ: Chủ kho dùng Mac và kết quả hiện đã có, nên chưa ai bị chặn; ai chạy nhầm máy thì chỉ mất thời gian và thử lại được, không mất dữ liệu.
  file: `_acceptance/bai-thu-luoi-5000-dong/thu/do-lai.mjs`
  severity: medium
  Đề xuất: known-limits

- **Bước chờ máy chủ coi mọi phản hồi HTTP là đã lên, không theo dõi tiến trình next start; cổng 3462 lại trùng với executors.ui-check (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu máy đang có một máy chủ khác chạy sẵn ở cổng đó, bài đo lại có thể đo nhầm máy chủ ấy rồi báo lưới không đạt, thay vì báo không dựng được.
  Căn cứ: Chỉ xảy ra khi người chấm bật sẵn máy chủ khác ở đúng cổng này, tắt máy chủ đó rồi chạy lại là hết; không mất dữ liệu và không đổi kết luận đã ký.
  file: `_acceptance/bai-thu-luoi-5000-dong/thu/do-lai.mjs`
  severity: medium
  Đề xuất: known-limits

- **Mã thoát 2 «không dựng được» chỉ đúng khi lỗi ở tag; npm ci, build hay do.mjs hỏng đều ra mã 1 «kết luận không đạt» (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi cài hoặc dựng nhánh thử hỏng, bài đo lại báo giống như lưới trượt, nên người đọc có thể hiểu nhầm lưới có vấn đề.
  Căn cứ: Lỗi hiện ra to và rõ trên màn hình nên người chạy nhìn là biết là hỏng dựng; chạy lại được, không ảnh hưởng dữ liệu.
  file: `_acceptance/bai-thu-luoi-5000-dong/thu/do-lai.mjs`
  severity: low
  Đề xuất: known-limits

- **Thẻ tiếng sản phẩm ghi «KHÔNG đưa công cụ đo vào main», nhưng PR này đưa máy đo vào main (r1)**
  Người dùng thấy gì: Thẻ người ký đọc nói là công cụ đo không vào main, trong khi thực tế máy đo có vào main; người ký có thể hiểu sai phạm vi.
  Căn cứ: Hậu quả là hiểu nhầm chữ trên thẻ chứ không phải lỗi chạy; sửa một câu là xong nhưng không ảnh hưởng kết quả đo hay dữ liệu.
  file: `_acceptance/bai-thu-luoi-5000-dong/card-plain.json`
  severity: low
  Đề xuất: known-limits

- **trungVi/phanVi cho kết quả phụ thuộc vị trí khi mảng có NaN; cộng với catch nuốt timeout ở thước dán, một lượt hỏng có thể bị che (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu một lượt dán bị hỏng hoặc quá chậm, kết luận có thể vẫn báo đạt hoặc trượt tuỳ lượt hỏng ở thứ tự nào, nên một lượt xấu có thể bị che.
  Căn cứ: Ba lượt đo hiện đều có số hợp lệ nên kết luận đã ký không bị ảnh hưởng; chỉ rủi ro cho các lần đo sau và chạy lại là thấy.
  file: `_acceptance/bai-thu-luoi-5000-dong/thu/nguong.mjs`
  severity: medium
  Đề xuất: known-limits

- **do-lai coi bất kỳ máy chủ nào trên cổng là máy chủ của mình: không bắt máy chủ con chết, stdio bị bỏ, mọi mã HTTP đều tính là đã lên (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu lần chạy trước bị ngắt giữa chừng, máy chủ cũ còn nằm lại và lần chạy sau có thể đo nhầm bản dựng cũ mà vẫn in kết quả như bình thường.
  Căn cứ: Chỉ xảy ra khi bài đo bị ngắt giữa chừng, người chạy tắt tiến trình cũ là xử lý được; không mất dữ liệu nhưng cần biết để không tin số đo sau lần ngắt.
  file: `_acceptance/bai-thu-luoi-5000-dong/thu/do-lai.mjs`
  severity: medium
  Đề xuất: known-limits

- **Lỗi trang (pageerror) được gom rồi bỏ, không vào kết luận (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu lưới báo lỗi trong lúc cuộn, gõ hay dán, lỗi đó không hiện trong kết quả cuối và lưới vẫn có thể được ghi là đạt.
  Căn cứ: Lỗi trang thường kéo theo số đo xấu hoặc ô sai nên đã bị các thước khác bắt gián tiếp; số đo hiện đạt và chạy lại được.
  file: `_acceptance/bai-thu-luoi-5000-dong/thu/do.mjs`
  severity: low
  Đề xuất: known-limits

- **Dựng hoặc cài thất bại thoát mã 1 ('kết luận không đạt') thay vì 2 ('không dựng được') như phần đầu tệp khai (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi cài hoặc dựng nhánh thử hỏng, bài đo báo giống như lưới trượt, người đọc khó phân biệt hai trường hợp.
  Căn cứ: Lỗi vẫn hiện rõ trên màn hình và chạy lại được; không mất dữ liệu, chỉ gây hiểu nhầm nhất thời.
  file: `_acceptance/bai-thu-luoi-5000-dong/thu/do-lai.mjs`
  severity: low
  Đề xuất: known-limits

- **Thiếu --moc-bench thì hiệu chuẩn bài đo JS lặng lẽ so với chính nó (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu ai gọi máy đo trực tiếp mà thiếu mốc so sánh, bước kiểm tải máy luôn qua và không cảnh báo, nên một máy đang bận vẫn có thể cho số đo trông hợp lệ.
  Căn cứ: Đường chạy chính một lệnh luôn truyền mốc nên người dùng thường không dính; nếu số đo lạ thì đo lại được.
  file: `_acceptance/bai-thu-luoi-5000-dong/thu/do.mjs`
  severity: low
  Đề xuất: known-limits

- **Bước E8 trỏ tới worktree không tồn tại (r1)**
  Người dùng thấy gì: Người chấm làm theo hướng dẫn xem bằng mắt sẽ không tìm thấy thư mục bản dựng và phải tự đoán thư mục đúng.
  Căn cứ: Chỉ làm người chấm mất vài phút tìm đúng thư mục, không ảnh hưởng số đo hay dữ liệu, sửa một dòng chỉ dẫn là xong.
  file: `_acceptance/bai-thu-luoi-5000-dong/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi có mặt trong khi lời hứa là quan hệ): ô góc cuối của lô dán chỉ được kiểm là có xuất hiện ở đâu đó (r1 · tệp đã đổi)**
  Người dùng thấy gì: Phép kiểm góc cuối của lô dán chỉ xác nhận giá trị có hiện đâu đó, chưa chắc nằm đúng ô nên lỗi lệch dòng hoặc cột ở cuối lô có thể lọt.
  Căn cứ: Hai ô mẫu còn lại vẫn kiểm đúng vị trí và giá trị là chuỗi riêng rất khó trùng ngẫu nhiên, nên rủi ro thấp; chỉ ảnh hưởng độ chắc của bằng chứng.
  file: `_acceptance/bai-thu-luoi-5000-dong/thu/do.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): AC-1 lấy số cột và số dòng từ biến trang tự khai, không từ lưới đã dựng (r1 · tệp đã đổi)**
  Người dùng thấy gì: Máy chỉ xác nhận trang tự khai có 5.000 dòng và 20 cột, chưa đếm trực tiếp trên lưới đã hiện; nếu lưới ẩn cột thì máy không phát hiện.
  Căn cứ: Dữ liệu và lưới sinh từ cùng một nguồn nên lệch rất khó xảy ra, và bước nhìn bằng mắt vẫn xem được; đây chỉ là độ chắc của bằng chứng.
  file: `_acceptance/bai-thu-luoi-5000-dong/thu/do.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): điều kiện «đối chứng đỏ trượt đủ ba thước» chỉ được test bằng một ca rỗng (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bộ kiểm hàm so ngưỡng chưa thử từng trường hợp thiếu riêng một thước, nên nếu sau này ai sửa nhầm điều kiện thì kiểm có thể vẫn xanh.
  Căn cứ: Bài thử này chạy một lần để ra quyết định và kết quả đã có; thêm ca kiểm chỉ giúp nếu mã còn được sửa về sau, nên chi phí lớn hơn hậu quả.
  file: `_acceptance/bai-thu-luoi-5000-dong/thu/nguong.test.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
