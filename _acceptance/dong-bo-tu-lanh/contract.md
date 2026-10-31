---
schema_version: 1
feature: Đầu chủ sửa căn lúc máy chủ trục trặc ngắn hay hết phiên thì thay đổi tự gửi lại khi máy chủ trả lời được, chỉ báo đồng bộ nói đúng vì sao chưa gửi, và căn đang ở Cần xem sửa tiếp hay xử lý không kẹt, không đảo thứ tự hai lần sửa
slug: dong-bo-tu-lanh
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: verified
design_doc: docs/superpowers/specs/2026-10-31-dong-bo-tu-lanh-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-31T14:17:59Z
---

# Acceptance Contract: dong-bo-tu-lanh

## Context

Hàng 61 của lộ trình (dãy H, đợt `dau-chu-dong-vao`), đứng trên hàng 13 (`nhanh-tuc-thi`). Gom sáu mục ngoài hợp đồng
chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng hàng 13: Ngoài-3/13/25, Ngoài-4, Ngoài-6/16. Luật đợt 21: không đổi bộ
đồng bộ, không đổi luật Cần xem với lỗi 4xx thật.

Source input: `docs/plan/lo-trinh.json` hàng 61 · `_acceptance/dong-bo-tu-lanh/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-10-31-dong-bo-tu-lanh-design.md` · `_acceptance/nhanh-tuc-thi/review-findings.md`

Từ ngữ (theo hàng 13): «thao tác chờ», «Cần xem», «kho trên máy». Thêm: «máy chủ trục trặc» = máy chủ trả mã 5xx;
«hết phiên» = máy chủ trả 401; «4xx khác» = mọi mã 4xx trừ 401; «thao tác giữ» = thao tác mới trên căn đang Cần xem,
nằm trong hàng đợi chưa gửi tới khi người chọn lối.

## Criteria

- AC-1: Given hai căn H và K có thao tác chờ (H hai lần sửa giá, K một lần), máy chủ trả 503 cho mọi lần gửi của H và 200
  cho K, When bộ đồng bộ gửi, Then K lên máy chủ, hai thao tác của H ở lại hàng đợi theo thứ tự, không căn nào vào Cần
  xem, chỉ báo «Máy chủ trục trặc · 2 thay đổi chờ gửi lại»; When máy chủ hồi và tới nhịp thử kế (không thao tác người),
  Then hai sự kiện của H lên đúng thứ tự, giá cuối là lần sửa sau, hàng đợi rỗng, chỉ báo «Đã đồng bộ».
- AC-2: Given ba thao tác chờ trên hai căn, máy chủ trả 401 cho mọi lời gọi, When bộ đồng bộ gửi và kéo, Then cả ba ở lại
  hàng đợi, không căn nào vào Cần xem, chỉ báo «Hết phiên · đăng nhập lại để gửi 3 thay đổi»; When phiên hồi (máy chủ trả
  lời bình thường), Then cả ba lên đúng thứ tự từng căn, không Cần xem, chỉ báo «Đã đồng bộ».
- AC-3: Given máy chủ trả 409 cho lần gửi, rồi trả 401 hay 503 cho lần đọc lịch sử căn để đối chiếu, When bộ đồng bộ gửi,
  Then thao tác ở lại hàng đợi (không thành Cần xem «căn không còn đọc được»); và Given máy chủ ghi sự kiện rồi trả 503,
  When gửi lại sau khi hồi, Then máy chủ có đúng một sự kiện cho thao tác ấy.
- AC-4: Given thao tác chờ trên căn, máy chủ trả 400 (chuyển trạng thái lõi cấm), 403 (căn còn đọc được, thân lỗi mang
  mã), 404 hay 409 (đụng nhau), When bộ đồng bộ gửi, Then căn vào Cần xem đúng loại và lý do như hàng 13: 400 → từ chối
  kèm lý do của lõi · 403 → từ chối kèm mã lỗi máy chủ trả · 404 → từ chối «căn không còn đọc được» · 409 → đụng nhau;
  thao tác rời hàng đợi sang Cần xem.
- AC-5: Given bộ đồng bộ đã kéo về một lần, When lần kéo kế gặp lần lượt: mất mạng, 401, 503, bản kéo mang khoá nguồn bị
  lưới chặn, 403, Then chỉ báo lần lượt «Mất mạng · đang xem bản trên máy», «Hết phiên · đăng nhập lại để tải bản mới»,
  «Máy chủ trục trặc · đang xem bản trên máy», «Bản tải về bị từ chối · đang xem bản trên máy» (hai lần cuối), danh sách
  trên máy không đổi; When lần kéo kế thành công, Then chỉ báo về «Đã đồng bộ».
- AC-6: Given kho trên máy ném lỗi khi ghi, When người sửa một căn, Then lần sửa trả về lỗi loại «kho» và chỉ báo hiện
  «Lỗi kho trên máy · thay đổi chưa lưu được» (lần sửa trả về chứ không ném ra ngoài hay treo); When kho hồi, Then lần sửa
  kế lưu được và lượt gửi kế đưa chỉ báo về bình thường; lượt nhịp gặp kho lỗi giữa chừng thì nhịp vẫn chạy tiếp.
- AC-7: Given căn H đang Cần xem «đụng nhau» với thao tác cũ của tôi (giá 2 tỷ) trên bản máy chủ mới, When tôi sửa tiếp
  giá H thành 3 tỷ rồi bấm «Giữ của tôi», Then máy chủ nhận hai sự kiện theo thứ tự (2 tỷ rồi 3 tỷ), giá cuối 3 tỷ, căn
  không quay lại Cần xem, hàng đợi rỗng; và trước khi chọn lối, thao tác 3 tỷ không lên máy chủ.
- AC-8: Given căn đang Cần xem (loại đụng nhau, hay loại máy chủ bác vì luật lõi) và tôi đã sửa tiếp nó, When tôi bấm «Lấy bản mới», «Bỏ thay đổi»
  hay «Sửa lại», Then thao tác sửa tiếp được nối chuỗi lại trên bản máy chủ mới và lên máy chủ, giá cuối là lần sửa sau
  cùng, thao tác cũ bị bỏ, hàng đợi rỗng sau lượt gửi và căn ra khỏi Cần xem.
- AC-9: Given ứng dụng chạy trên máy chủ dev với dữ liệu mẫu, When người dùng sửa giá lúc API trả 503, lúc phiên hết
  (cookie phiên bị xoá), lúc kho trên máy lỗi, và sửa tiếp căn đang Cần xem, Then chỉ báo trên thanh trên hiện đúng chữ
  từng trạng thái, «Hết phiên» là liên kết đăng nhập lại, đăng nhập lại thì thay đổi tự lên và chỉ báo về «Đã đồng bộ»,
  bảng Cần xem có dòng «Sửa thêm sau đó». (cross-layer)

## Coverage

Quét bằng `morphological-scan` (preset risk-premortem, đối tượng = một lần trả lời của máy chủ cho bộ đồng bộ):

- Trục A — đường gọi: gửi sự kiện · đọc lịch sử để đối chiếu · kéo danh sách · kho trên máy.
- Trục B — kiểu trả lời: ném lỗi · 200 · 401 · 5xx · 4xx khác · bản kéo bị lưới chặn · kho ném lỗi.
- Trục C — trạng thái căn: thường · đang Cần xem có thao tác giữ.
- Trục D — lối người chọn: Giữ của tôi · Lấy bản mới · Bỏ thay đổi · Sửa lại.

Core → AC: (gửi × 5xx) AC-1 · (gửi × 401, kéo × 401) AC-2 · (đối chiếu × 401/5xx, gửi × 5xx-đã-ghi) AC-3 · (gửi × 4xx
khác) AC-4 · (kéo × mọi kiểu) AC-5 · (kho × ném lỗi) AC-6 · (Cần xem × Giữ của tôi) AC-7 · (Cần xem × ba lối kia) AC-8 ·
mặt người nhìn AC-9. Later/Never: (gửi × 408/429) — Out of scope; (5xx mãi × trần thử) — Out of scope.
Thước CE: mỗi ô (A × B) có ít nhất một ca; ô (gửi × ném lỗi) và (gửi × 200) đã có ca của hàng 13 [CE chưa kiểm chứng
bằng đếm ô máy].

## Đường đo

- Số lần mất mạng và thao tác lúc mất mạng trên điện thoại (Tham chiếu §11) — số từ chỉ báo và hàng đợi của bộ đồng bộ
  trong hai tuần thử; AC-1, AC-2, AC-5 bảo đảm chỉ báo tách đúng nguyên nhân để số «mất mạng» không lẫn hết phiên hay máy
  chủ trục trặc. Đếm thật là việc của phiên nghiệm thu, không phải code mới của hàng này.

## Out of scope

- Trần số lần thử, lùi dần khi một căn trả 5xx mãi (căn nằm lại hàng đợi, chỉ báo nói «Máy chủ trục trặc»).
- Chuyển các mục Cần xem đã sinh bởi 5xx/401 ở bản cũ về hàng đợi.
- 408 và 429: xếp vào «4xx khác» theo câu chữ của hàng.
- Kênh thời gian thực; mở app khi mất mạng hẳn (như hàng 13).

## Notes

- Ngoài-1 (máy định tuyến 2026-10-31, đề xuất S4 known-limits): Nếu bộ nhớ trên máy bị lỗi đúng lúc người dùng bấm «Giữ của tôi», «Lấy bản mới» hay «Bỏ thay đổi», sẽ không có gì xảy ra và không có lời báo nào. Với «Sửa lại», bảng đóng lại như đã xong dù căn vẫn nằm trong Cần xem và chưa được gửi. — `apps/web/src/lib/sync/dong-bo.ts`
- Ngoài-3 (máy định tuyến 2026-10-31, đề xuất S4 known-limits): Bài kiểm tra cho trường hợp máy chủ từ chối chuyển trạng thái chỉ so lý do với chính chuỗi nó tự dựng, nên nếu khuôn lỗi thật đổi đi thì bài kiểm tra vẫn xanh. Người dùng hiện không gặp lỗi nào. — `apps/web/src/lib/sync/tu-lanh.test.ts`
- Known limits — chọn ở Cổng Bằng chứng 2026-10-31:
  - Ngoài-1: bộ nhớ trên máy lỗi đúng lúc bấm một lối ở Cần xem thì không có lời báo; «Sửa lại» đóng bảng như đã xong dù căn vẫn ở Cần xem.
  - Ngoài-3: ca kiểm từ chối 400 tự dựng câu lý do rồi so với chính nó, nên khuôn lỗi thật đổi thì ca vẫn xanh.
