---
slug: ma-hoa-so-chu
at: 2026-10-31T14:58:00Z
verdict: findings
p0: 2
p1: 2
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design + contract (AC-4, AC-9) | Luật thiếu khoá chỉ áp cho createApi; lệnh mã hoá lại chạy ở máy với NODE_ENV khác production sẽ lặng lẽ lấy khoá dev | Chạy lệnh trên cơ sở dữ liệu thật khi .env.local thiếu khoá → mã hoá bằng khoá dev công khai và xoá số rõ cùng giao dịch: mất số và lộ số; E9 cũ còn đòi mã thoát 0 khi không khoá | Spawn lệnh không khoá, khoá sai dạng, khoá dev → thoát khác 0, thông điệp ghim OWNER_PHONE_KEY, đếm số rõ trước và sau bằng nhau; đối chứng dương với khoá thử | fixed: thiết kế §5 «không bao giờ rơi về khoá dev»; AC-9 thêm vế từ chối; E9 thêm ca ba lần spawn và đối chứng dương; sổ dòng thay d-4 |
| P0 | design + sổ | Bản khoá ngoài Vercel và chấp nhận mất khoá là lựa chọn chỉ người có mà sổ không ghi; d-2 và d-4 trích câu không quyết lựa chọn | Chủ kho ký mà tưởng chỗ giữ khoá đã chốt ở ADR-0009; máy đã tự chọn bản ngoài Vercel và nhận rủi ro mất dữ liệu | Một dòng chi-nguoi kho_dao true về bản khoá ngoài Vercel; viết lại căn cứ d-2, d-4 | fixed: Hỏi-3 (thiết kế, sổ, kho_dao true); d-2 và d-4 thay bằng dòng mot-loi có lối chết nêu được. Vế «đổi kho_dao của d-2 thành true»: rejected — rủi ro mất khoá gắn với mọi cách mã hoá, không với chọn tầng API; nó nằm trọn ở Hỏi-3 |
| P1 | contract (Đường đo, AC-9) + evals (E9) | Ngưỡng nói «dữ liệu mẫu đã có»; E9 cấy ba dòng viết tay, không qua bộ dữ liệu mẫu | Bộ dữ liệu mẫu ghi owner_phone rõ thì sau 008 dựng sàn thử đỏ mà E9 vẫn xanh | Dựng bộ dữ liệu mẫu thật rồi migrate rồi mã hoá lại; hoặc ghi rõ dữ liệu mẫu không có số chủ | fixed: đã kiểm — packages/db/seed/nap.mjs dòng 2 nói chủ nhà còn trong tệp, chưa nạp vào cơ sở dữ liệu; Đường đo và thiết kế §5 ghi rõ «dữ liệu đã có» là dòng ghi qua API của hàng 11, ca cấy đúng dạng ấy; ràng buộc chặn số rõ bắt hàng nạp chủ nhà mẫu sau này |
| P1 | evals (E9) | AC-9 hứa mở số ra đúng số nhưng E9 tự dựng ngữ cảnh rồi giải mã, không qua cửa mở số thật; thiếu tag cross-layer | Lệnh mã hoá lại dựng ngữ cảnh đảo thứ tự, ca dùng cùng hàm nên xanh, API trả 500 | Mở số qua POST …/owner/phone-reveal cho từng dòng: 200, đúng số, sự kiện tăng đúng 3 | fixed: AC-9 gắn (cross-layer), Then nêu mở số qua API; E9 đòi đi qua revealPhone của API |
| P2 | evals (E10) | Lệnh sinh khoá trong ADR không được chạy qua bộ đọc khoá | ADR ghi lệnh ra hex 64 ký tự, khoa.ts đọc base64 thành 48 byte và từ chối — production không dựng | Ca trong khoa.test.ts rút lệnh từ ADR, chạy, đưa vào bộ đọc khoá dưới production | fixed: AC-4 thêm vế; E4 thêm ca rút lệnh từ khối mã của ADR-0013 kèm đối chứng âm hex |

## Lần 2 — phần mở rộng bảng lead (AC-11, AC-12), 2026-10-31

verdict: findings · p0 0 · p1 3 · p2 2

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | design §8 · AC-11 · E11 | Ràng buộc NOT VALID xét cả lần sửa dòng cũ — «Bỏ lead» trên lead số rõ trước khi mã hoá lại | Áp 008 chưa chạy mã hoá lại, telesales bỏ lead căn trùng → API 500 | Ca cấy lead số rõ, discard lỗi nêu ràng buộc, sau maHoaLai thì được | fixed: AC-11 nêu hành vi, E11 thêm ca, thiết kế §8 và ADR ghi luật chạy mã hoá lại ngay sau migrate |
| P1 | design §8 · AC-11 · E11 | Bỏ not null của leads.owner_phone mà không ràng buộc thay | createLead quên ghi hai cột → lead mất số, kiểm trùng ra new | Ràng buộc leads_phone_co_so + ca âm có đối chứng dương | fixed: thiết kế §8, AC-11, E11 |
| P1 | contract Out of scope, Coverage · design §3 | Bốn câu cũ loại hàm kiểm trùng, trái AC-12 | Hội đồng chấm gắn AC-12 thành ngoài phạm vi | Không còn câu loại trừ | fixed: sửa cả bốn chỗ |
| P2 | E12 | Chiều đỏ «bỏ sàn khỏi dấu vết» không đo được bằng ca khác sàn | Bỏ companyId khỏi dauVetSo vẫn xanh | Hai lead cùng số hai sàn có dấu vết khác | fixed: E12 và AC-12 thêm vế |
| P2 | AC-10 · E10 · E11 | Sổ tay chỉ đếm số rõ ở chủ nhà; ca dòng lệnh không có lead | Người vận hành bỏ qua bảng lead | E10 ý 4 đếm hai bảng; ca dòng lệnh cấy một lead | fixed: E10 câu hỏi, E11 ca dòng lệnh |
