---
schema_version: 1
slug: man-nhap-excel
feature: Đầu chủ thả file bảng hàng cũ (xlsx, csv) vào màn Nhập Excel, thấy từng ô sẽ ghi gì — giữ nguyên, máy sửa, cần người, chặn — sửa rồi bấm ghi qua đường ghi lần nhập của hàng 65; xem thử nói đủ «ghi N căn mới, cập nhật M, tin bổ sung K, bỏ J»
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-04T03:32:02Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: man-nhap-excel
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng man-nhap-excel của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Đầu chủ thả file bảng hàng cũ (xlsx, csv) vào màn Nhập Excel, thấy từng ô sẽ ghi gì — giữ nguyên, máy sửa, cần người, chặn — sửa rồi bấm ghi qua đường ghi lần nhập của hàng 65; xem thử nói đủ «ghi N căn mới, cập nhật M, tin bổ sung K, bỏ J»

Vì sao: giám sát tách hàng 65 ở G-4 (03/11) — hàng 65a (`nhap-excel-xem-truoc-ghi`, đã gộp PR #105 ngày 04/11) dựng đường
ghi (API `/api/v1/imports`, kiểm trùng, chủ nhà qua cửa ADR-0010); màn để người dùng thật dùng đường ấy là hàng này. Không
có màn thì đường ghi chưa ai dùng được, và Đầu chủ vẫn phải gõ tay từng căn từ bảng tính cũ.

- **Ai gặp:** Đầu chủ và Trưởng nhóm (ADR-0011 — vai nhập), lần đầu vào Quỹ hàng với bảng hàng cũ hàng trăm dòng.
- **Việc:** chuyển bảng tính cũ thành căn trong Quỹ hàng mà không ghi sai, không lộ chủ nhà ra ngoài sàn.
- **Dữ liệu:** file nằm trên máy người nhập, đọc trong trình duyệt (`docs/architecture/nhap-du-lieu.md` §1, §2 — file gốc
  không lên máy chủ); lõi tất định của hàng 64 (đọc lưới, phân loại cột, áp kế hoạch) và API của hàng 65a đã có.
- **Màn đích:** Wizard năm bước (`docs/design/vo-va-ia.md` §2, dòng Nhập Excel — khối `solution-crm-6`): tải · ghép cột ·
  xem trước · trùng · tóm tắt.
- **Ngoài ô này:** tác tử AI lập kế hoạch (hàng 68–71), nhớ mẫu nhập của sàn (hàng 67), hoàn tác lần nhập (hàng 66),
  Google Sheets (`nhap-du-lieu.md` §10 — «sau»).

## Ngưỡng chết / ngưỡng UAT

Đo trên bộ file bẩn có đáp án của hàng 64 và hai file mẫu (`nhap-du-lieu.md` §9), chế độ tất định (không AI):

- Câu hỏi phép đo trả lời: Đầu chủ có nhập được một file bảng hàng cũ thành căn trong Quỹ hàng, đúng và không lộ chủ
  nhà, mà không cần người dựng giúp không?
- Kết quả nào là SỐNG: con số xem thử bằng đúng con số ghi; lỗi lọt (ô ghi sai không mang dấu «máy sửa» hay «cần người»)
  ≤ 0,5%; ô «cần người» ≤ 10% ở lần nhập đầu; 0 giá trị nguồn (chủ nhà, số, giá đáy) rời trình duyệt ngoài đường ghi
  của hàng 65a; một Đầu chủ thử nhập file mẫu từ đầu tới «đã ghi» không cần hỏi ai.
- Kết quả nào là CHẾT: xem thử nói một đằng, ghi một nẻo; hoặc file mẫu sạch mà màn vẫn đòi người sửa quá 10% ô; hoặc
  có giá trị nguồn đi ra ngoài đường ghi.
- Timebox: một vòng (một hàng lộ trình); quá ba lượt chấm mà chưa đạt thì thu phạm vi.
