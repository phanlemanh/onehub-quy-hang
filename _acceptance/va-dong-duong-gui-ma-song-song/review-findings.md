## Trong hợp đồng

- **Hình 3 — kiểm 'chuỗi có mặt' cho lời hứa về quan hệ: chuỗi ghim «trả ${res.status}» không nhắm riêng khẳng định 404 của ca đường lõi**
  file: `_acceptance/va-dong-duong-gui-ma-song-song/thu/kiem-song-song.mjs:103`
  severity: medium
  AC: AC-3
  source: measurement
  detail: Ở AC-3, lời hứa là: các khẳng định cũ của ca «đường lõi mật khẩu đóng» vẫn còn, trong đó có khẳng định mỗi đường lõi bị tắt trả 404 (dòng 104 của tệp kiểm: assert.equal(res.status, 404, `${path} lần ${k} trả ${res.status}`)). Nhưng E3 chỉ chạy nguonCay.includes("trả ${res.status}") trên cả tệp (dòng 106), nên chuỗi này khớp ở ba chỗ: dòng 67 (thuộc ca khác, «đường quên mật khẩu và đổi email»), dòng 104 (khẳng định cần giữ) và dòng 111 (vòng đăng ký email mới, do chính lần thay đổi này thêm vào). Nếu xoá khẳng định 404 trong vòng gọi đường lõi ở dòng 104, E3 vẫn xanh, vì dòng 67 và dòng 111 vẫn chứa chuỗi đó. Vậy phép đo chỉ chứng được chuỗi có xuất hiện ở đâu đó trong tệp, chứ không chứng được khẳng định 404 còn nằm trong ca và còn gắn với vòng lặp qua các đường lõi bị tắt. Chuỗi ghim cần mang phần riêng của khẳng định đó (ví dụ `${path} lần ${k} trả ${res.status}`) và giới hạn trong thân của ca.
  rationale: AC-3 hứa khẳng định 404 của ca đường lõi vẫn còn trong nguồn, mà phép đo chuỗi này vẫn xanh khi khẳng định đó bị xoá, nên không chứng được lời hứa của AC-3.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
