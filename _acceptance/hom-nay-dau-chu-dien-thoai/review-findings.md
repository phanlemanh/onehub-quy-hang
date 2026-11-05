## Trong hợp đồng

- **Trả lại trên điện thoại ghi luôn, bỏ qua hộp hỏi lại mà máy tính bắt buộc (hàng 92)**
  file: apps/web/src/app/(app)/today/hom-nay-dau-chu.tsx:531
  severity: high
  AC: AC-5
  source: conventions
  detail: Trên máy tính, NutViec ghi rõ «Trả lại luôn hỏi lại (hàng 92)». Bấm «Trả lại» chỉ mở AlertDialog (dòng 176 setHoiTraLai, dòng 200-208), có nêu lý do RETURN_REASON_LABEL; hd.lead(v.lead, "return") chỉ chạy khi người bấm xác nhận. Bản điện thoại tự dựng lại bảng việc trong theCua, có lamLead: `m === "tra-lai" ? { onClick: () => hd.lead(l, "return") }`. Bảng này được dùng cho cả ngăn ⋯ (ViecKhac) lẫn ngăn «Kết quả cuộc gọi» (ghiKetQua, gọi lamLead(v.lead, "tra-lai")). Vì vậy một chạm trên điện thoại trả ngay lead về telesales, không hỏi lại và không nêu lý do. Điều này trái luật đã ký của khuôn và trái KH-hn-dien-thoai («cùng bộ việc» với máy tính). Nhãn cũng mất «· lý do» (máy tính dòng 167 ghi `Trả lại · ${RETURN_REASON_LABEL}`). Gốc của lệch là việc sao lại bảng ánh xạ việc → hành động (lamCan/lamLead, dòng 528-531) thay vì dùng chung với NutViec.lam (dòng 168-178). Bài kiểm trong mobile/*.test.ts chỉ kiểm thứ tự mã việc, không kiểm có hỏi lại hay không, nên không bắt được lỗi này.
  rationale: AC-5 đòi chọn một việc trong ngăn kết quả thì ghi như nút cùng tên ở máy tính; máy tính hỏi lại trước khi trả, điện thoại thì không.

- **On phones, «Trả lại» returns the lead right away with no confirmation**
  file: apps/web/src/app/(app)/today/hom-nay-dau-chu.tsx:531
  severity: medium
  AC: AC-5
  source: bugs
  detail: On desktop, «Trả lại» in NutViec (line 176) only calls setHoiTraLai(true). The lead is returned only after the user confirms in the AlertDialog «Trả lại lead này?», which states the reason. On phones, `lamLead` in `theCua` maps m === "tra-lai" straight to hd.lead(l, "return"). Both phone entry points therefore return the lead to telesales with one tap and no question: the «Trả lại» row in the ⋯ sheet (ViecKhac -> t.lam) and the «Trả lại» row in the «Kết quả cuộc gọi» sheet (ghiKetQua -> lamLead). In the call-result sheet, «Trả lại» sits right next to «Đã gọi» and «Không nghe máy», so a stray tap after a call (one-handed use is the whole point of this screen) silently sends the lead away. The lead then disappears from the list (setTaiLead filter) and cannot be undone. The contract (AC-5) says the result-sheet actions behave «như máy tính», and the desktop has a confirmation step.
  rationale: Cùng lỗi với mục trên: nút Trả lại trong ngăn kết quả không hành xử như nút cùng tên ở máy tính (thiếu bước xác nhận), trái AC-5.

- **Hình 2, fixture viết tay đúng khuôn bên đọc: E1 «đúng thứ tự nhóm của chiaNhom» chỉ đo lại thứ tự do bài kiểm tự đưa vào**
  file: apps/web/src/app/(app)/today/mobile/danh-sach.test.ts:119
  severity: medium
  AC: AC-1
  source: measurement
  detail: NHOM5 là mảng NhomThe viết tay, đã xếp sẵn theo thứ tự mong. Assert `thuTuNhom(html) == NHOM5.map(g=>g.ma)` chỉ chứng minh DanhSachDienThoai giữ nguyên thứ tự đầu vào. Bài không cho dữ liệu đi qua chiaNhom hay qua phép dựng `nhomThe` ở hom-nay-dau-chu.tsx:553, là đường ghi thật. Chiều đỏ ở dòng 123-127 đảo chính đầu vào rồi so với NHOM5, nên gần như chắc đỏ với bất kỳ thành phần nào giữ thứ tự, và không bắt được lỗi xếp nhóm ở phía viết. Lời hứa của evals E1 (thứ tự như lưới máy tính, theo chiaNhom) chưa được đo.
  rationale: AC-1 hứa cùng nhóm và thứ tự nhóm với máy tính; bài kiểm không đo được điều đó nên AC-1 chưa có bằng chứng.

- **Hình 1, đo chỉ dẫn thay vì đầu ra: E7 «trống → TrangThai có đúng một hành động» chỉ thấy lại chuỗi TRONG mà bài kiểm tự bơm vào**
  file: apps/web/src/app/(app)/today/mobile/danh-sach.test.ts:132
  severity: medium
  AC: AC-7
  source: measurement
  detail: `dungDs` truyền `trong: createElement('p', null, 'TRONG')`. Thành phần chỉ trả nguyên `<>{trong}</>` (danh-sach.tsx:346), nên `assert.match(dungDs([], 'co'), /TRONG/)` chỉ đo việc đẩy prop đi qua. Nội dung trống thật (HetViec do hom-nay-dau-chu.tsx:557 truyền vào) chưa được dựng. Evals E7 hứa «TrangThai có đúng một hành động», nhưng không có assert nào đếm hành động hay kiểm TrangThai. Nhánh đang tải cũng chỉ khớp `data-cho-tai-kieu="tran"`, không kiểm «khung chờ hai tầng».
  rationale: AC-7 hứa khung chờ hai tầng và trạng thái trống có một hành động; bài kiểm không đo các điều đó.

- **Hình 3, assert «chuỗi có mặt» khi lời hứa là quan hệ: E5 «Không nghe máy không gọi hàm ghi» và «chọn việc gọi đúng hàm» không được đo**
  file: apps/web/src/app/(app)/today/mobile/danh-sach.test.ts:96
  severity: medium
  AC: AC-5
  source: measurement
  detail: Ở danh-sach.test.ts, bài E5 chỉ dựng tĩnh KetQuaCuocGoi rồi so danh sách `data-ket-qua`. Nó cũng khớp `role="button"` và kiểm không có `<button`. Lời hứa ở evals E5 lại là quan hệ giữa nút và lời gọi hàm: chọn «Không nghe máy» thì không gọi ghiKetQua (nhánh `if (m !== 'khong-nghe')` ở danh-sach.tsx:283), chọn việc khác thì gọi đúng hàm, và có chiều đỏ «bản sao Không nghe máy ghi Đã gọi». Bài không có assert nào bấm nút hay theo dõi `ghiKetQua`, cũng không có chiều đỏ đó. Tên bài hứa «dòng kín bề ngang» nhưng không assert nào kiểm bề ngang.
  rationale: AC-5 hứa «Không nghe máy» không ghi gì và chọn việc thì ghi đúng; bài kiểm không đo quan hệ này.

- **Hình 4, assertion âm tính đứng một mình: E6 «Còn · giữ giá gọi hàm ghi khi mất mạng» chỉ kiểm không có disabled**
  file: apps/web/src/app/(app)/today/mobile/danh-sach.test.ts:87
  severity: medium
  AC: AC-6
  source: measurement
  detail: Tên bài và evals E6 hứa nút «Còn · giữ giá» GỌI hàm ghi của dòng cả khi mất mạng. Assert duy nhất về hành vi là `assert.doesNotMatch(nut, /disabled=""/)`, một assert âm tính. Bài không bấm nút, không đặt spy lên `lam` hay `ghiKetQua`, không có đối chứng dương là hàm đã được gọi, và không có chiều đỏ. Một nút không tắt nhưng gắn sai hàm, hoặc không gắn hàm nào, vẫn qua.
  rationale: AC-6 hứa «Còn · giữ giá» ghi trên máy khi mất mạng; bài kiểm chỉ thấy nút không tắt, chưa chứng minh có ghi.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Phone-reveal errors for a listing that is not yours or no longer exists all show «Căn chưa có số chủ»**
  Người dùng thấy gì: Khi đầu chủ không còn giữ căn đó nữa, màn hình vẫn báo «căn chưa có số chủ» và bảo đi ghi số, nên họ hiểu sai nguyên nhân.
  Căn cứ: Chỉ là lời báo sai nguyên nhân, không mất hay lộ dữ liệu, người dùng mở lại hồ sơ là thấy thực tế; sửa lời báo nhẹ nhưng ít gặp.
  file: `apps/web/src/app/(app)/today/mobile/mo-so-chu.ts`
  severity: low
  Đề xuất: known-limits

- **Hình 4, assertion âm tính không ghim thông điệp: E4 «404 → lời chưa có số» chỉ assert ok=false**
  Người dùng thấy gì: Bài kiểm chưa khẳng định đúng lời báo khi căn không có số, nên sau này lời báo có thể đổi sai mà không ai hay.
  Căn cứ: Chỉ là chỗ kiểm còn lỏng ở một lời báo phụ, không ảnh hưởng dữ liệu hay thao tác của người dùng; ghi lại là đủ.
  file: `apps/web/src/app/(app)/today/mobile/goi.test.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
