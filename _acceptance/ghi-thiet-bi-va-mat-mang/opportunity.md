---
schema_version: 1
slug: ghi-thiet-bi-va-mat-mang
feature: Ghi thiết bị (máy tính hay điện thoại) vào sự kiện của thao tác, và ghi lượt mất mạng cùng thao tác lúc mất mạng trên điện thoại về máy chủ, để hai số đo §11 «thao tác theo thiết bị và vai» và «mất mạng trên điện thoại» đo được trong hai tuần thử
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: ghi-thiet-bi-va-mat-mang
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng ghi-thiet-bi-va-mat-mang của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Ghi thiết bị (máy tính hay điện thoại) vào sự kiện của thao tác, và ghi lượt mất mạng cùng thao tác lúc mất mạng trên điện thoại về máy chủ, để hai số đo §11 «thao tác theo thiết bị và vai» và «mất mạng trên điện thoại» đo được trong hai tuần thử

Vì sao: Hỏi-1 Cổng Phạm vi hàng 52, chủ kho duyệt 03/11: mở một hàng nhỏ cho hai sự kiện chưa hàng nào ghi (thiết bị của thao tác, lượt mất mạng trên điện thoại)

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: trong hai tuần thử, mỗi thao tác của sàn thử làm trên máy tính hay điện thoại, theo vai nào; điện thoại mất mạng bao nhiêu lượt và bao nhiêu thao tác làm lúc mất mạng về được máy chủ.
- Kết quả nào là SỐNG (máy đề xuất): hai số đo «thao tác theo thiết bị và vai» và «mất mạng trên điện thoại» của bộ số đo hàng 52 thôi trả «chưa có sự kiện» và ra số trên dữ liệu mẫu; ≥ 95% sự kiện thao tác ghi sau khi phát hành mang thiết bị.
- Kết quả nào là CHẾT (máy đề xuất): sau 3 ngày thử, dưới 80% sự kiện thao tác mang thiết bị, hoặc thao tác làm lúc mất mạng về máy chủ mà mất dấu là làm lúc mất mạng.
- Timebox: trong đợt này, trước hai tuần thử.
