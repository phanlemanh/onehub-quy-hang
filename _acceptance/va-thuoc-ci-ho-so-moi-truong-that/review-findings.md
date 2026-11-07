# Review findings: va-thuoc-ci-ho-so-moi-truong-that (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E3 nói ba ca đối chứng khác với ba ca mà kiem-thay.mjs thực sự chạy**
  Người dùng thấy gì: Phép thử kiểm việc hồ sơ cũ được thay bằng hồ sơ mới ghi một đằng nhưng chạy một nẻo ở hai ca. Người đọc kết quả sẽ thấy tên ca và điều kiện không khớp, nên bằng chứng kém tin cậy hơn.
  Căn cứ: Chỉ làm lệch lời mô tả của phép thử, không mất dữ liệu hay hỏng chức năng cho người dùng, và ghi lại thành hạn chế đã biết thì rẻ.
  file: `_acceptance/va-thuoc-ci-ho-so-moi-truong-that/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Ca đối chứng «hồ sơ thay chưa ký» dựa vào trạng thái của chính hồ sơ này, sẽ hỏng ngay khi hồ sơ được ký**
  Người dùng thấy gì: Phép thử này đang xanh nhưng sẽ chuyển đỏ sau khi hồ sơ được ký, nên lần chạy lại sau đó sẽ báo lỗi giả và có thể chặn người làm việc tiếp theo.
  Căn cứ: Không mất dữ liệu và chỉ là cảnh báo đỏ giả khi chạy lại, nhưng sẽ lặp lại mỗi lần chạy nên nên sửa trong một việc riêng.
  file: `_acceptance/va-thuoc-ci-ho-so-moi-truong-that/thu/kiem-thay.mjs`
  severity: medium
  Đề xuất: new-contract

- **Phép đối chứng «hồ sơ thay chưa ký» trỏ vào chính hồ sơ này, nên sẽ hỏng ngay khi hồ sơ được ký**
  Người dùng thấy gì: Sau khi hồ sơ được ký, phép thử đối chứng sẽ tự báo hỏng và thoát lỗi ở mọi lần chạy lại, dù không có gì sai thật.
  Căn cứ: Chỉ gây báo đỏ giả khi kiểm lại, không ảnh hưởng người dùng cuối hay dữ liệu, và sửa bằng việc riêng là hợp lý.
  file: `_acceptance/va-thuoc-ci-ho-so-moi-truong-that/thu/kiem-thay.mjs`
  severity: high
  Đề xuất: new-contract

- **Đối chứng trong code không khớp với E3 đã khai: ca ranh giới thẻ «moi-truong-that/E3a» không được kiểm**
  Người dùng thấy gì: Phép thử không kiểm được trường hợp thẻ dính chữ thừa bị nhận nhầm là đã có người nhận việc thay. Nếu luật nhận diện bị nới lỏng, phép thử vẫn báo đạt.
  Căn cứ: Chỉ là khoảng hở trong phép thử phụ, chưa gây hại thật cho người dùng, và ghi thành hạn chế đã biết là đủ.
  file: `_acceptance/va-thuoc-ci-ho-so-moi-truong-that/thu/kiem-thay.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — eval tuyên đối chứng ca biên «thẻ dính chữ moi-truong-that/E3a» nhưng script chỉ đo ca vắng hẳn thẻ**
  Người dùng thấy gì: Phép thử chỉ kiểm trường hợp thẻ vắng hẳn, không kiểm trường hợp thẻ gần giống, nên lỗi nhận nhầm kiểu so khớp theo tiền tố có thể lọt qua mà không ai biết.
  Căn cứ: Khả năng xảy ra thấp, không ảnh hưởng dữ liệu người dùng, và có thể bổ sung sau khi cần.
  file: `_acceptance/va-thuoc-ci-ho-so-moi-truong-that/thu/kiem-thay.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
