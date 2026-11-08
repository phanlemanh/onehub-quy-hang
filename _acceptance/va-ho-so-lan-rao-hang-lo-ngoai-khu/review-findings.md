## Trong hợp đồng

- **Hình dạng 4 — Assertion âm-tính-một-mình: E3 không có đối chứng dương rằng cú bấm đã xảy ra**
  file: `_acceptance/va-ho-so-lan-rao-hang-lo-ngoai-khu/thu/chay-ui.mjs:37`
  severity: medium
  AC: AC-3
  source: measurement
  detail: E3 vào trang bằng `/inventory?hang=<id>` (dòng 28). Khi đã vá, link trong «Các lần rao» trỏ `/inventory?hang=<id>` (`duongTheoHang`), trùng địa chỉ đang đứng, nên bấm trúng không làm đổi gì trên màn. Ba điều kiện đạt ở bước của evals.yaml đều là «không có gì đổi»: `truocBam` và `sauBam` cùng tiêu đề, `sauBam.thay = true`, `hang=` trong url đúng mã. Một cú bấm trượt (toạ độ bị phủ, sự kiện không tới link) cho đúng dòng e3 này, kể cả khi link đã hỏng trở lại. Cú bấm chỉ gửi `Input.dispatchMouseEvent` tại toạ độ, không có tín hiệu nào xác nhận link nhận được nó. `r.href` có được in ra nhưng bước của E3 không đối chiếu. E3 cũng không yêu cầu một lần chạy đỏ trước khi vá; `duong-nen.md` chỉ là nền bộ kiểm, không phải chiều đỏ của phép nhìn này. Đây là phép đo màn duy nhất của AC-3.

- **Hình dạng 6 — Địa chỉ hardcode: E3 đo máy dev đang nghe cổng 3496, không buộc vào cây đang kiểm**
  file: `_acceptance/va-ho-so-lan-rao-hang-lo-ngoai-khu/thu/dung.mjs:13`
  severity: medium
  AC: AC-3
  source: measurement
  detail: `dung.mjs` dòng 13 và `chay-ui.mjs` dòng 8 ghim `http://localhost:3496`. `dung.mjs` gọi `dung-x.mjs`, và script này bỏ qua bước khởi động khi `/api/v1/health` trả 200 (`if (!(await song()))`, «máy dev đang chạy thì dùng lại»). Không chỗ nào so thư mục chạy hay commit của máy chủ với `GOC`, và dòng e3 cũng không ghi nguồn gốc này. Cổng 3496 và Postgres 5576 là của dãy X, dùng chung giữa các worktree (config.yaml ghi «worktree X»). Máy dev còn sót từ checkout khác sẽ được dùng lại im lặng, và E3 chấm mã của checkout đó. Đã kiểm lúc review: tiến trình đang nghe 3496 có cwd là đúng worktree này, nên bằng chứng hiện tại không bị ảnh hưởng; lỗ hổng nằm ở chỗ phép đo không tự bảo đảm điều đó.

- **Hình dạng 3 — Assert «có mặt» trong khi lời hứa là quan hệ giá trị: «giữ tham số khác» chỉ kiểm tên khoá**
  file: `apps/web/src/app/(app)/units/ho-so/lan-rao-khong-toa.test.ts:37`
  severity: low
  AC: AC-1
  source: measurement
  detail: AC-1 và E1 hứa link «giữ các tham số khác của địa chỉ», tức giá trị sau phải bằng giá trị trước. `kiemLink` chỉ xét `if (giu && !q.has(giu))`, và `MA_TRAN` chỉ truyền tên khoá `"x"`. Link mang `x=` rỗng hay `x=sai` vẫn qua. Nên so `q.get(k)` với giá trị trong địa chỉ đang mở.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bản vá chỉ rẽ nhánh cho hàng không toà, link lần rao của hàng chưa có mã vẫn đóng hồ sơ**
  Người dùng thấy gì: Với căn chưa có mã, bấm vào một lần rao trong hồ sơ làm hồ sơ đóng lại thay vì mở đúng lần rao. Người dùng phải mở lại hồ sơ từ bảng.
  Căn cứ: Lỗi nhẹ đến vừa, không mất dữ liệu và người dùng tự mở lại được, nhưng cùng loại với lỗi đang vá nên nên có một hàng vá riêng, sửa rẻ.
  file: `apps/web/src/app/(app)/units/ho-so/mo-hinh.ts`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 2 — Đầu vào viết tay đúng khuôn bên đọc: không đi qua hàm phân loại và lối mở thật**
  Người dùng thấy gì: Nếu sau này đổi cách nhận biết hàng không toà, bộ kiểm vẫn xanh dù link lần rao có thể mở sai hồ sơ. Hiện người dùng chưa gặp lỗi nào.
  Căn cứ: Hiện chưa có lỗi nào với người dùng, rủi ro chỉ xuất hiện khi đổi luật phân loại sau này, nên ghi lại là đủ.
  file: `apps/web/src/app/(app)/units/ho-so/lan-rao-khong-toa.test.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/5 lỗi rơi vào file không bộ đo nào phủ (_acceptance/va-ho-so-lan-rao-hang-lo-ngoai-khu/thu/chay-ui.mjs, _acceptance/va-ho-so-lan-rao-hang-lo-ngoai-khu/thu/dung.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
