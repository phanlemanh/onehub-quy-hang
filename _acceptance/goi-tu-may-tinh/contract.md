---
schema_version: 1
feature: Đầu chủ bấm Gọi trên máy tính thì chế độ cuộc gọi mở và điện thoại của mình quay số chủ nhà
slug: goi-tu-may-tinh
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, ui]
status: signed-off
approved_by: Manh Phan
approved_at: 2026-11-02
design_doc: docs/superpowers/specs/2026-11-02-goi-tu-may-tinh-design.md
---

# Acceptance Contract: goi-tu-may-tinh

## Context

Hàng 30 của lộ trình (đợt `dau-chu-dong-vao`, dãy L), đứng trên hàng 26 (Thông báo lead, ADR-0025) và hàng 28 (chế độ cuộc
gọi). Tham chiếu §13 chốt 29/10 mức tối thiểu: bấm Gọi trên máy tính mở chế độ cuộc gọi và điện thoại quay số; tổng đài để
sau. Nửa đầu (nút «Gọi» ở Hôm nay mở chế độ cuộc gọi) đã có từ hàng 28; hàng này làm nửa sau: từ chế độ cuộc gọi, điện
thoại của chính đầu chủ nhận thông báo, chạm là tới trang quay số, bấm một nút là mở số (một vết, cửa của `mo-so-lead`) và
ứng dụng gọi quay số chủ nhà.

Source input: `docs/plan/lo-trinh.json` hàng 30 · `_acceptance/goi-tu-may-tinh/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-11-02-goi-tu-may-tinh-design.md`

Từ ngữ: «đầu chủ được giao» và «lead còn việc» như `mo-so-lead` (người nhận hiện tại còn vai Đầu chủ; lead không bỏ, không
trả lại, không phải lead trùng); «thông báo quay số» = một thông báo Web Push của hàng 26 với nội dung riêng của hàng này;
«thiết bị» = một đăng ký thông báo của chính người ấy ở sàn đang làm.

## Criteria

- AC-1: Given đầu chủ được giao một lead còn việc ở nấc Đã gửi, Đã nhận hay Đã gọi và có n thiết bị đã bật thông báo, When gọi
  `POST /api/v1/leads/{id}/phone-dial`, Then nhận `{ devices: n, otherDevices: k }` (k = số thiết bị ấy khác điểm đăng ký máy gọi gửi kèm), hộp thư đi có thêm đúng n dòng cho chính người ấy với nội
  dung đúng bốn khoá — «Gọi chủ nhà» · «<Toà> · <nhu cầu>» · `/units/call/dial?lead=<id>` · `quay-so:<id>` — và dịch vụ đẩy
  nhận đúng các thông báo ấy; lead không đổi nấc hay mốc nào và không có vết mở số nào được ghi. (cross-layer)
- AC-2: Given một lead của sàn, When người khác gọi quay số — đầu chủ khác cùng sàn, telesales đã nhập lead, trưởng nhóm, quản
  trị sàn, người sàn khác, người nhận đã bị gỡ vai Đầu chủ, chưa đăng nhập — hay khi lead đã trả lại, đã bỏ, hay là lead căn
  trùng, Then bị từ chối và hộp thư đi không có dòng nào cho lead ấy.
- AC-3: Given lead có số chủ, mã căn và giá, When thông báo quay số được dựng, ghi và gửi, và khi máy chủ trả lời hay ghi nhật
  ký, Then nội dung chỉ có bốn khoá và không mang số chủ, tên chủ, giá hay mã căn (bất biến 2).
- AC-4: Given đầu chủ chưa bật thông báo trên thiết bị nào, hoặc chỉ bật trên chính máy tính đang gọi, When gọi quay số, Then
  nhận `otherDevices: 0` (chưa bật đâu thì `devices: 0` và hộp thư đi không có dòng nào), và lời gọi không lỗi.
- AC-5: Given đầu chủ ở chế độ cuộc gọi của một lead, When bấm «Quay số trên điện thoại», Then nút khoá trong lúc gửi; xong
  hiện «Đã gửi tới k thiết bị khác — chạm thông báo trên điện thoại để gọi» kèm «Gửi lại», hoặc với k = 0 hiện «Chưa có điện thoại
  nào bật thông báo lead — trên điện thoại mở Hôm nay, bấm Bật thông báo»; lỗi (mất mạng, lead không còn của bạn, hết phiên)
  hiện một dòng dưới nút và nút bấm lại được; bấm không tự ghi «Đã gọi».
- AC-6: Given đầu chủ chạm thông báo quay số trên điện thoại, When trang quay số `/units/call/dial?lead=<id>` mở, Then trang
  hiện «<Toà> · <nhu cầu>» và nút «Gọi chủ nhà»; bấm nút → mở số qua cửa của `mo-so-lead` (một vết) rồi đưa trình duyệt tới
  `tel:<số>`, số hiện theo nhóm chữ số kèm nút «Gọi»; tải lại thì số ẩn; web không lưu số trên máy; lỗi mở số hiện một dòng,
  bấm lại được; lead của đầu chủ khác, lead đã trả lại hay mã sai khuôn → không hiện tên toà, chỉ «Không thấy lead này trong việc của bạn» kèm «Về Hôm nay»; vai khác
  Đầu chủ không thấy trang. (cross-layer)
- AC-7: Given Tham chiếu, When đọc §12 Sổ quyết định, Then có dòng «Gọi từ máy tính» ghi cách điện thoại quay số (thông báo của
  hàng 26 → trang quay số → mở số một vết), ai gọi được, và tổng đài để sau.

## Coverage

Bỏ quét coverage có tên — không gian AC là một luồng thẳng nối hai cửa có sẵn (thông báo hàng 26, mở số `mo-so-lead`), trục
kê thẳng (dòng `descope` «bỏ coverage-scan»). Trục đã phủ: ai gọi được (AC-1, AC-2) · thiết bị có/không (AC-1, AC-4) · rò
lớp nguồn (AC-3) · màn máy tính (AC-5) · màn điện thoại và mở số (AC-6) · tài liệu (AC-7).

## Out of scope

- Nối tổng đài, gọi trong trình duyệt, ghi âm — §13 để sau.
- Chọn thiết bị nhận: thông báo tới mọi thiết bị đã bật của người ấy, kể cả chính máy tính nếu nó cũng bật (lời báo thì chỉ
  đếm thiết bị khác).
- Tự ghi «Đã gọi» khi điện thoại quay số — đầu chủ vẫn bấm «Đã gọi» của hàng 28.
- Chạm thông báo trên điện thoại thật (iPhone đã cài, Android) — phiên nghiệm thu (ADR-0025 Hệ quả).
- Nhãn hai nút «Gọi» trên dòng lead ở Hôm nay — hàng 29.

## Đường đo

- Tỉ lệ thao tác trên máy tính / điện thoại theo vai (ô cơ hội, Tham chiếu §11): số lần bấm «Quay số trên điện thoại» =
  số bộ (user_id, tag `quay-so:<lead>`, created_at) khác nhau trong `push_outbox` — một lần bấm ghi mọi dòng cùng một mốc
  (AC-1); so với số vết mở số của lead (`lead_phone_reveals`, AC-6). Giới hạn đã khai: lần bấm khi chưa có thiết bị nào
  không để dấu, và vết mở số không tách lối trang quay số với lối Hôm nay.

## Notes

- Hỏi-1 (thông báo hay mã QR) nháp theo khuyến nghị «thông báo» — chủ kho chốt ở Cổng Phạm vi.
- Không migration: dùng `app.push_outbox_add` của migration 018; cơ sở dữ liệu đã chặn nội dung khác bốn khoá.
- Một dòng cắm nút vào `units/call/cuoc-goi.tsx` (tệp của hàng 29) — đã xin giám sát `cham-tep` (L-22).
- Ngoài-1 (máy định tuyến 2026-11-02, đề xuất S4 known-limits): Trên trang quay số, dòng tiêu đề trên cùng hiện chữ «Căn call» thay vì một nhãn tiếng Việt đúng. Chức năng gọi vẫn chạy bình thường, chỉ là chữ ở đầu trang trông lạ. — `apps/web/src/components/shell/app-shell.tsx`
- Ngoài-2 (máy định tuyến 2026-11-02, đề xuất S4 known-limits): Bản ghi mạng đi kèm hồ sơ ghi là không có lời từ chối nào, trong khi hai khung thử người không phải chủ lead chắc chắn có từ chối. Sản phẩm chạy đúng, chỉ là hồ sơ nghiệm thu ghi chưa đủ. — `_acceptance/goi-tu-may-tinh/evidence/E9-network.txt`
- Ngoài-3 (máy định tuyến 2026-11-02, đề xuất S4 known-limits): Bài kiểm xem nhật ký có lộ số điện thoại chủ nhà hay không có thể vẫn báo xanh ngay cả khi nó không bắt được dòng nhật ký nào. Hiện chưa có bằng chứng số bị lộ, chỉ là bài kiểm chưa chứng minh chắc điều đó. — `packages/api/test-db/goi-tu-may-tinh.test.ts`
- Ngoài-4 (máy định tuyến 2026-11-02, đề xuất S4 known-limits): Khi dùng bàn phím, nhấn Enter trên nút «Quay số trên điện thoại» hoặc «Đã gọi» không kích hoạt nút mà kéo con trỏ vào ô giá. Bấm bằng chuột hay chạm vẫn dùng bình thường. — `apps/web/src/app/(app)/units/call/cuoc-goi.tsx`
- Ngoài-5 (máy định tuyến 2026-11-02, đề xuất S4 known-limits): Bài kiểm chống rò giá và mã căn chưa tự chứng minh là máy dò bắt được khi có rò thật, nên nếu giá lộ ra dưới dạng lạ thì có thể không ai nhận ra. Người dùng không thấy gì khác đi hôm nay. — `packages/api/test-db/goi-tu-may-tinh.test.ts`
- Known limits — chọn ở Cổng Bằng chứng 2026-11-02:
  - Ngoài-1: Trên trang quay số, dòng tiêu đề trên cùng hiện chữ «Căn call» thay vì một nhãn tiếng Việt đúng. Chức năng gọi vẫn chạy bình thường, chỉ là chữ ở đầu trang trông lạ.
  - Ngoài-2: Bản ghi mạng đi kèm hồ sơ ghi là không có lời từ chối nào, trong khi hai khung thử người không phải chủ lead chắc chắn có từ chối. Sản phẩm chạy đúng, chỉ là hồ sơ nghiệm thu ghi chưa đủ.
  - Ngoài-3: Bài kiểm xem nhật ký có lộ số điện thoại chủ nhà hay không có thể vẫn báo xanh ngay cả khi nó không bắt được dòng nhật ký nào. Hiện chưa có bằng chứng số bị lộ, chỉ là bài kiểm chưa chứng minh chắc điều đó.
  - Ngoài-4: Khi dùng bàn phím, nhấn Enter trên nút «Quay số trên điện thoại» hoặc «Đã gọi» không kích hoạt nút mà kéo con trỏ vào ô giá. Bấm bằng chuột hay chạm vẫn dùng bình thường.
  - Ngoài-5: Bài kiểm chống rò giá và mã căn chưa tự chứng minh là máy dò bắt được khi có rò thật, nên nếu giá lộ ra dưới dạng lạ thì có thể không ai nhận ra. Người dùng không thấy gì khác đi hôm nay.
