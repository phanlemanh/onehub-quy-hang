# Review findings: va-dong-duong-gui-ma-song-song (round 2)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình 3 — kiểm 'chuỗi có mặt' cho lời hứa «khẳng định còn hiệu lực trong ca»: ghim bằng includes vẫn khớp khi dòng khẳng định bị biến thành chú thích**
  Người dùng thấy gì: Phép kiểm nghiệm thu chỉ chứng minh dòng kiểm tra còn nằm trong tệp, chưa chứng minh nó còn chạy. Nếu sau này ai đó vô tình tắt dòng ấy bằng chú thích, phép kiểm vẫn báo xanh.
  Căn cứ: Chỉ ảnh hưởng độ chặt của phép kiểm nghiệm thu chứ không ảnh hưởng người dùng, không mất dữ liệu; đã có các bước kiểm khác chạy tệp thật, và rủi ro chỉ xảy ra khi có người cố ý hay vô tình sửa tệp kiểm.
  file: `_acceptance/va-dong-duong-gui-ma-song-song/thu/kiem-song-song.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
