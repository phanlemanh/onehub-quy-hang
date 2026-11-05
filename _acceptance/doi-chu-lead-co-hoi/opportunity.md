---
schema_version: 1
slug: doi-chu-lead-co-hoi
feature: "Người trong sàn thấy chữ trên mọi màn theo ba lớp đã chốt: «Lead» chỉ còn là dấu trên một liên hệ chưa nói chuyện hai chiều, còn việc với một người (bán, cho thuê, mua, thuê) hiện là «Cơ hội» với nhãn pha đã chốt ở Cổng Phạm vi hàng 103 — đổi một lượt cho cả bàn làm việc, nút «+ Lead» và «Gửi lead» giữ nguyên."
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-05T11:27:14Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 106
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 106 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Người trong sàn thấy chữ trên mọi màn theo ba lớp đã chốt: «Lead» chỉ còn là dấu trên một liên hệ chưa nói chuyện hai chiều, còn việc với một người (bán, cho thuê, mua, thuê) hiện là «Cơ hội» với nhãn pha đã chốt ở Cổng Phạm vi hàng 103 — đổi một lượt cho cả bàn làm việc, nút «+ Lead» và «Gửi lead» giữ nguyên.

Vì sao: Chủ kho 05/11 chọn «Áp ba lớp» ở khám phá hàng 103 (ADR-0021 sửa đổi 05/11): Lead là dấu trên người, việc với người là Cơ hội. Luật đợt 61–62: hàng đang chạy không đổi chữ giữa chừng; đổi một lượt cho cả main sau mọi hàng có màn đang chạy, kể cả 39.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Không màn nào của bàn làm việc còn gọi việc với một người là «lead»: danh sách, bộ lọc, Hôm nay, hồ sơ người và hồ sơ căn dùng «Cơ hội» với đúng nhãn pha đã chốt ở Cổng Phạm vi 103; «Lead» chỉ còn là dấu trên liên hệ; nút «+ Lead», «Gửi lead» giữ; CONTEXT.md và Tham chiếu khớp chữ trên màn; dữ liệu và API không đổi» chưa?
- Kết quả nào là SỐNG: [đề xuất] Không màn nào của bàn làm việc còn gọi việc với một người là «lead»: danh sách, bộ lọc, Hôm nay, hồ sơ người và hồ sơ căn dùng «Cơ hội» với đúng nhãn pha đã chốt ở Cổng Phạm vi 103; «Lead» chỉ còn là dấu trên liên hệ; nút «+ Lead», «Gửi lead» giữ; CONTEXT.md và Tham chiếu khớp chữ trên màn; dữ liệu và API không đổi
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Không màn nào của bàn làm việc còn gọi việc với một người là «lead»: danh sách, bộ lọc, Hôm nay, hồ sơ người và hồ sơ căn dùng «Cơ hội» với đúng nhãn pha đã chốt ở Cổng Phạm vi 103; «Lead» chỉ còn là dấu trên liên hệ; nút «+ Lead», «Gửi lead» giữ; CONTEXT.md và Tham chiếu khớp chữ trên màn; dữ liệu và API không đổi» khi hết timebox
- Timebox: …
