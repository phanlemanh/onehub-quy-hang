# Review findings — bai-thu-luoi-5000-dong (round 1)

## Trong hợp đồng

- **Thước cuộn không kiểm toi_cuoi: cuộn không tới dòng 5.000 (hay không cuộn chút nào) vẫn đạt**
  file:line: `_acceptance/bai-thu-luoi-5000-dong/thu/do.mjs:91`
  severity: medium
  AC: AC-2
  source: bugs
  detail: doCuon tính `toi_cuoi` (scrollTop + clientHeight >= scrollHeight - 2) nhưng giá trị này không vào `trung_vi.cuon` (dòng 181) và `danhGia` trong nguong.mjs chỉ so p95 và ti_le_cham. AC-2 nói rõ 'cuộn từ dòng 1 tới dòng 5.000'. Nếu bánh xe không làm khung cuộn di chuyển (chọn nhầm phần tử trong khungCuon, chuột không nằm trên khung, lưới chặn wheel), rAF vẫn ghi các khung đều khoảng 16,7 ms, nên p95 và tỉ lệ khung chậm đều đạt. Thước cuộn vì thế xanh dù chưa đo việc cuộn. Lần đo hiện tại có toi_cuoi=true ở cả ba lượt, nhưng cổng không chặn được trường hợp xấu. Cách sửa: đưa `toi_cuoi` (kiểm bằng luot.every) và có thể cả so_khung vào trung_vi.cuon, rồi bắt danhGia trượt khi giá trị không phải true.

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): thước cuộn chấm theo lệnh cuộn đã phát, không theo việc lưới đã thật sự cuộn tới cuối**
  file:line: `_acceptance/bai-thu-luoi-5000-dong/thu/do.mjs:91`
  severity: medium
  AC: AC-2
  source: measurement
  detail: doCuon phát 240 lần page.mouse.wheel (dòng 77-81) rồi tính `toi_cuoi` (dòng 86-89), nhưng `toi_cuoi` không đi vào kết luận nào. danhGia (nguong.mjs:46) chỉ xét cuon.p95 và cuon.ti_le_cham, còn trung_vi (do.mjs:181) bỏ hẳn toi_cuoi, và E3 trong evals.yaml cũng không đòi nó. Nhịp khung lấy từ vòng rAF của trang (luoi-thu.tsx, `vong`) và vòng này chạy bất kể có cuộn hay không. Vì vậy nếu bánh xe không cuộn được khung đã chọn (khungCuon lấy nhầm div, hoặc lưới chặn cuộn), trang đứng yên vẫn cho khung đều khoảng 16,7 ms và AC-2 vẫn «đạt». Đối chứng đỏ ?cham=1 không cứu được chỗ này: nó bận 60 ms mỗi khung dù có cuộn hay không, nên chỉ phân biệt được mượt với giật, không phân biệt được có cuộn với không cuộn. Lời hứa «cuộn hết 5.000 dòng» cần đầu ra là vị trí cuộn đã tới cuối, nhưng phép đo chỉ chứng rằng lệnh cuộn đã được gửi. Số trong so-do.json có toi_cuoi = true, nhưng cổng không bắt buộc điều đó.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Lệnh đo lại gọi sysctl vm.loadavg chỉ chạy được trên macOS, đo xong mới chết và không in JSON**
  Người dùng thấy gì: Bài đo lặp lại chỉ chạy được trên máy Mac; người chạy trên Linux hay máy chủ CI sẽ đợi đo xong rồi nhận lỗi mà không có kết quả.
  Căn cứ: Chủ kho dùng Mac và kết quả hiện đã có, nên chưa ai bị chặn; ai chạy nhầm máy thì chỉ mất thời gian và thử lại được, không mất dữ liệu.
  file: `_acceptance/bai-thu-luoi-5000-dong/thu/do-lai.mjs`
  severity: medium
  Đề xuất: known-limits

- **Bước chờ máy chủ coi mọi phản hồi HTTP là đã lên, không theo dõi tiến trình next start; cổng 3462 lại trùng với executors.ui-check**
  Người dùng thấy gì: Nếu máy đang có một máy chủ khác chạy sẵn ở cổng đó, bài đo lại có thể đo nhầm máy chủ ấy rồi báo lưới không đạt, thay vì báo không dựng được.
  Căn cứ: Chỉ xảy ra khi người chấm bật sẵn máy chủ khác ở đúng cổng này, tắt máy chủ đó rồi chạy lại là hết; không mất dữ liệu và không đổi kết luận đã ký.
  file: `_acceptance/bai-thu-luoi-5000-dong/thu/do-lai.mjs`
  severity: medium
  Đề xuất: known-limits

- **Mã thoát 2 «không dựng được» chỉ đúng khi lỗi ở tag; npm ci, build hay do.mjs hỏng đều ra mã 1 «kết luận không đạt»**
  Người dùng thấy gì: Khi cài hoặc dựng nhánh thử hỏng, bài đo lại báo giống như lưới trượt, nên người đọc có thể hiểu nhầm lưới có vấn đề.
  Căn cứ: Lỗi hiện ra to và rõ trên màn hình nên người chạy nhìn là biết là hỏng dựng; chạy lại được, không ảnh hưởng dữ liệu.
  file: `_acceptance/bai-thu-luoi-5000-dong/thu/do-lai.mjs`
  severity: low
  Đề xuất: known-limits

- **Thẻ tiếng sản phẩm ghi «KHÔNG đưa công cụ đo vào main», nhưng PR này đưa máy đo vào main**
  Người dùng thấy gì: Thẻ người ký đọc nói là công cụ đo không vào main, trong khi thực tế máy đo có vào main; người ký có thể hiểu sai phạm vi.
  Căn cứ: Hậu quả là hiểu nhầm chữ trên thẻ chứ không phải lỗi chạy; sửa một câu là xong nhưng không ảnh hưởng kết quả đo hay dữ liệu.
  file: `_acceptance/bai-thu-luoi-5000-dong/card-plain.json`
  severity: low
  Đề xuất: known-limits

- **trungVi/phanVi cho kết quả phụ thuộc vị trí khi mảng có NaN; cộng với catch nuốt timeout ở thước dán, một lượt hỏng có thể bị che**
  Người dùng thấy gì: Nếu một lượt dán bị hỏng hoặc quá chậm, kết luận có thể vẫn báo đạt hoặc trượt tuỳ lượt hỏng ở thứ tự nào, nên một lượt xấu có thể bị che.
  Căn cứ: Ba lượt đo hiện đều có số hợp lệ nên kết luận đã ký không bị ảnh hưởng; chỉ rủi ro cho các lần đo sau và chạy lại là thấy.
  file: `_acceptance/bai-thu-luoi-5000-dong/thu/nguong.mjs`
  severity: medium
  Đề xuất: known-limits

- **do-lai coi bất kỳ máy chủ nào trên cổng là máy chủ của mình: không bắt máy chủ con chết, stdio bị bỏ, mọi mã HTTP đều tính là đã lên**
  Người dùng thấy gì: Nếu lần chạy trước bị ngắt giữa chừng, máy chủ cũ còn nằm lại và lần chạy sau có thể đo nhầm bản dựng cũ mà vẫn in kết quả như bình thường.
  Căn cứ: Chỉ xảy ra khi bài đo bị ngắt giữa chừng, người chạy tắt tiến trình cũ là xử lý được; không mất dữ liệu nhưng cần biết để không tin số đo sau lần ngắt.
  file: `_acceptance/bai-thu-luoi-5000-dong/thu/do-lai.mjs`
  severity: medium
  Đề xuất: known-limits

- **Lỗi trang (pageerror) được gom rồi bỏ, không vào kết luận**
  Người dùng thấy gì: Nếu lưới báo lỗi trong lúc cuộn, gõ hay dán, lỗi đó không hiện trong kết quả cuối và lưới vẫn có thể được ghi là đạt.
  Căn cứ: Lỗi trang thường kéo theo số đo xấu hoặc ô sai nên đã bị các thước khác bắt gián tiếp; số đo hiện đạt và chạy lại được.
  file: `_acceptance/bai-thu-luoi-5000-dong/thu/do.mjs`
  severity: low
  Đề xuất: known-limits

- **Dựng hoặc cài thất bại thoát mã 1 ('kết luận không đạt') thay vì 2 ('không dựng được') như phần đầu tệp khai**
  Người dùng thấy gì: Khi cài hoặc dựng nhánh thử hỏng, bài đo báo giống như lưới trượt, người đọc khó phân biệt hai trường hợp.
  Căn cứ: Lỗi vẫn hiện rõ trên màn hình và chạy lại được; không mất dữ liệu, chỉ gây hiểu nhầm nhất thời.
  file: `_acceptance/bai-thu-luoi-5000-dong/thu/do-lai.mjs`
  severity: low
  Đề xuất: known-limits

- **Thiếu --moc-bench thì hiệu chuẩn bài đo JS lặng lẽ so với chính nó**
  Người dùng thấy gì: Nếu ai gọi máy đo trực tiếp mà thiếu mốc so sánh, bước kiểm tải máy luôn qua và không cảnh báo, nên một máy đang bận vẫn có thể cho số đo trông hợp lệ.
  Căn cứ: Đường chạy chính một lệnh luôn truyền mốc nên người dùng thường không dính; nếu số đo lạ thì đo lại được.
  file: `_acceptance/bai-thu-luoi-5000-dong/thu/do.mjs`
  severity: low
  Đề xuất: known-limits

- **Bước E8 trỏ tới worktree không tồn tại**
  Người dùng thấy gì: Người chấm làm theo hướng dẫn xem bằng mắt sẽ không tìm thấy thư mục bản dựng và phải tự đoán thư mục đúng.
  Căn cứ: Chỉ làm người chấm mất vài phút tìm đúng thư mục, không ảnh hưởng số đo hay dữ liệu, sửa một dòng chỉ dẫn là xong.
  file: `_acceptance/bai-thu-luoi-5000-dong/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi có mặt trong khi lời hứa là quan hệ): ô góc cuối của lô dán chỉ được kiểm là có xuất hiện ở đâu đó**
  Người dùng thấy gì: Phép kiểm góc cuối của lô dán chỉ xác nhận giá trị có hiện đâu đó, chưa chắc nằm đúng ô nên lỗi lệch dòng hoặc cột ở cuối lô có thể lọt.
  Căn cứ: Hai ô mẫu còn lại vẫn kiểm đúng vị trí và giá trị là chuỗi riêng rất khó trùng ngẫu nhiên, nên rủi ro thấp; chỉ ảnh hưởng độ chắc của bằng chứng.
  file: `_acceptance/bai-thu-luoi-5000-dong/thu/do.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): AC-1 lấy số cột và số dòng từ biến trang tự khai, không từ lưới đã dựng**
  Người dùng thấy gì: Máy chỉ xác nhận trang tự khai có 5.000 dòng và 20 cột, chưa đếm trực tiếp trên lưới đã hiện; nếu lưới ẩn cột thì máy không phát hiện.
  Căn cứ: Dữ liệu và lưới sinh từ cùng một nguồn nên lệch rất khó xảy ra, và bước nhìn bằng mắt vẫn xem được; đây chỉ là độ chắc của bằng chứng.
  file: `_acceptance/bai-thu-luoi-5000-dong/thu/do.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): điều kiện «đối chứng đỏ trượt đủ ba thước» chỉ được test bằng một ca rỗng**
  Người dùng thấy gì: Bộ kiểm hàm so ngưỡng chưa thử từng trường hợp thiếu riêng một thước, nên nếu sau này ai sửa nhầm điều kiện thì kiểm có thể vẫn xanh.
  Căn cứ: Bài thử này chạy một lần để ra quyết định và kết quả đã có; thêm ca kiểm chỉ giúp nếu mã còn được sửa về sau, nên chi phí lớn hơn hậu quả.
  file: `_acceptance/bai-thu-luoi-5000-dong/thu/nguong.test.mjs`
  severity: low
  Đề xuất: wont-fix

⚠ Cụm ngoài vùng phủ: 2/15 lỗi rơi vào file không bộ đo nào phủ (_acceptance/bai-thu-luoi-5000-dong/card-plain.json, _acceptance/bai-thu-luoi-5000-dong/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
