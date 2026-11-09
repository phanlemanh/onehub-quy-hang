# Review findings: hom-nay-chiu-loi-tung-phan (round 2)

## Trong hợp đồng

- **Hình dạng 5, tuyên quét LỚP nhưng chỉ có điểm-case: E5b chỉ đo nhánh «chưa có số» của AC-5, nên chấm đạt cả trên bản còn lỗi đã sửa ở lượt 1**
  AC: AC-5
  file: `_acceptance/hom-nay-chiu-loi-tung-phan/evals.yaml:110`
  severity: medium
  source: measurement
  detail: AC-5 hứa cho cả lớp trạng thái: «Given Đội đang báo mất mạng · When mạng trở lại · Then màn tự đọc». Lớp này có hai nhánh, và chính `moTaMatMang` tách chúng ra: có số thì «Số là lần đọc cuối.», chưa có số thì «Máy sẽ tự đọc lại khi có mạng.». E5b chỉ dựng một nhánh. Dòng 110 đặt navigator.onLine false và cắt /api/v1/team/** trước khi mở trang, nên lượt đọc đầu hỏng và `loiHangDoi` bật. Expected ở dòng 113 cũng chỉ ghim câu của nhánh chưa có số. Nhánh mở lúc có mạng, đọc được, rồi mới mất mạng và có lại không có bước nào đo. Đó đúng là đường lỗi lượt 1 nêu ở review-findings.md (AC-5): bản 4328e3c6 có `if (tai.loiHangDoi || tai.loiDauChu) docLai()` nên màn đang có số không đọc lại. Bằng chứng phép đo không phân biệt được: run-log.jsonl dòng 22 ghi E5b exit_code 0 trên chính sha 4328e3c6 đang có lỗi đó. Commit sửa 3cb2bd63 chỉ đổi một dòng ở dashboard.tsx thành `useKhiCoMangLai(docLai)`. Cùng commit, evals.yaml chỉ thêm một dòng cho E10d, và không có tệp test nào đổi giữa 4328e3c6 và HEAD ở phần này. E5 chỉ kiểm câu chữ của `moTaMatMang`, không chạm lời đọc lại. Vì vậy trả dòng này về điều kiện cũ thì E5 và E5b vẫn xanh.
  rationale: AC-5 hứa cả lớp «Đội đang báo mất mạng, mạng trở lại thì màn tự đọc» gồm cả nhánh đã có số; bài đo chỉ dựng nhánh chưa có số nên không chứng minh được vế này của AC-5.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E10d: «Lặp bước 3» trỏ sai màn, kiểm tràn ngang 375 của Lead đã nhập chưa từng chạy và sẽ tiếp tục đạt oan**
  Người dùng thấy gì: Khối báo lỗi của Lead đã nhập chưa được đo trên màn điện thoại hẹp, nên nếu nó bị tràn ngang thì lượt chấm có thể không phát hiện ra. Người dùng điện thoại có thể thấy khối lỗi bị lệch hay cắt chữ ở danh sách Lead đã nhập.
  Căn cứ: Chỉ là chỗ chưa đo chứ chưa thấy hỏng, không mất dữ liệu, người dùng vẫn bấm Thử lại được, và nên ghi lại để đo ở lượt sau thay vì mở việc mới.
  file: `_acceptance/hom-nay-chiu-loi-tung-phan/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hôm nay trên điện thoại còn một nhánh lỗi tự ghép nút «Thử lại», trái luật vừa thêm (r1)**
  Người dùng thấy gì: Người dùng không bao giờ thấy khối lỗi này trên điện thoại, vì lỗi thật đã đi qua khối báo lỗi chung. Chỉ còn một đoạn thừa trong mã có thể bị chép lại về sau.
  Căn cứ: Không ảnh hưởng người dùng nào hiện nay và dọn lúc khác rất rẻ, nên ghi lại là đủ.
  file: `apps/web/src/app/(app)/today/mobile/danh-sach.tsx`
  severity: low
  Đề xuất: known-limits

- **Lead đã nhập treo khung chờ vĩnh viễn khi lời đọc trả 200 mà thân hỏng; lối tự đọc lại mới cũng đi qua chỗ này (r1)**
  Người dùng thấy gì: Ở danh sách Lead đã nhập, nếu máy chủ trả về nội dung hỏng thì màn chờ mãi, không có nút «Thử lại». Người dùng phải tải lại trang mới thoát được.
  Căn cứ: Hiếm gặp và người dùng tự gỡ được bằng cách tải lại trang, nhưng màn treo không lời báo nên đáng sửa trong một việc riêng.
  file: `apps/web/src/app/(app)/leads/mine/nguon-that.tsx`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 5, tuyên quét LỚP nhưng chỉ có điểm-case: «nhóm của nguồn hỏng không hiện số» chỉ ghim một mã trong bảng ánh xạ (r1)**
  Người dùng thấy gì: Chưa có bài kiểm giữ cho mọi nhóm việc lỗi đều không hiện số. Nếu sau này ai đó làm sót một nhóm, cột có thể hiện số 0 sai mà không bị bắt.
  Căn cứ: Hiện màn vẫn đúng nên chưa ai bị ảnh hưởng; rủi ro chỉ ở lần sửa sau và bổ sung bài kiểm sau này rẻ.
  file: `apps/web/src/app/(app)/today/viec/kho-so.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4, assertion âm-tính-một-mình: bộ đếm MutationObserver của E2b không nhìn thấy câu mà nguồn bộ nhóm phát ra, đối chứng dương chỉ phủ alert ở Đội (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm tự động có thể không bắt được trường hợp câu báo bộ nhóm nháy lên vài giây trong lúc máy đang thử lại. Nếu lỗi này xảy ra, người dùng sẽ thấy câu lỗi thoáng qua dù sau đó tự hết.
  Căn cứ: Chỉ là câu báo thoáng, tự mất, không mất dữ liệu; hiện chưa có bằng chứng nó xảy ra, và siết bài kiểm có thể làm sau.
  file: `_acceptance/hom-nay-chiu-loi-tung-phan/evals.yaml`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

⚠ Cụm ngoài vùng phủ: 2/2 lỗi rơi vào file không bộ đo nào phủ (_acceptance/hom-nay-chiu-loi-tung-phan/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
