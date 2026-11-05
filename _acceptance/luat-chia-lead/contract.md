---
schema_version: 1
feature: "Quản trị sàn đổi cách chia lead, hạn nhận và hạn gọi, người đọc lời báo và ngưỡng hai hàng đợi của Hôm nay ở mục «Luật chia lead» của Cài đặt sàn; lead mới theo luật mới, lead đã chia giữ luật cũ; vai khác không đổi được; cột Đầu chủ của Bảng hàng không ghi nhầm «Đã rời sàn» và đọc danh bạ hỏng thì báo kèm thử lại"
slug: luat-chia-lead
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: signed-off
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-11-05T13:31:37Z
design_doc: docs/superpowers/specs/2026-11-05-luat-chia-lead-design.md
---

# Acceptance Contract: luat-chia-lead

## Context

Hàng 48 của lộ trình (dãy D, đợt `dau-khach-nhap`), mã phạm vi P11; chủ kho ký Cổng Đáng 05/11 («Build tất cả.»). Màn
dựng trong Cài đặt hợp nhất, nhóm Sàn (luật đợt 62), nhãn theo từ vựng hiện hành. Phần máy chủ đã có ở hàng 81 (sổ điểm),
82 (lối chung `GET/PATCH /api/v1/company/settings`, nhật ký) và 25 (lead đóng dấu cách chia và hai hạn) — vòng này không
thêm bảng, migration hay lối API. Gộp Ngoài-9, Ngoài-10 của hàng 105 (luật đợt 69). Không chạm bất biến nào: sáu điểm đều
lớp `company_internal`, không điểm nào ra trang khách.

Source input: `docs/plan/lo-trinh.json` hàng 48 · `_acceptance/luat-chia-lead/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-11-05-luat-chia-lead-design.md` · `_acceptance/bang-hang-danh-sach-chi-tiet/review-findings.md`
(Ngoài-9, Ngoài-10)

## Criteria

- **AC-1** — Màn hiện đủ sáu điểm với giá trị đang áp và nguồn.
  Given quản trị sàn mẫu ở Cài đặt › Sàn [Tên] › Luật chia lead, sàn đã đổi Hạn nhận lead thành 20, các điểm khác chưa đổi,
  When mở mục,
  Then màn có đúng sáu dòng theo thứ tự Cách chia lead không trùng · Hạn nhận lead · Hạn gọi lần đầu · Báo lead quá hạn cho
  ai · «Cần gọi lại» sau số ngày chưa xác nhận · «Nên gọi ép giá» sau số ngày, tên dòng đúng tên ở sổ điểm; giá trị bằng
  giá trị lối chung trả; dòng Hạn nhận lead mang dấu «Đã đổi» kèm tên người đổi và ngày; năm dòng còn lại ghi «Mặc định».

- **AC-2** — Lưu một lần, nguyên khối, có nhật ký. (cross-layer)
  Given quản trị sàn ở màn, giá trị đang áp là mặc định,
  When đổi Hạn nhận lead thành 25 và Cách chia thành Kho chung rồi bấm Lưu,
  Then màn báo đúng «Đã lưu · áp cho lead mới từ bây giờ» (chỉ đổi điểm áp ngay thì đúng «Đã lưu»); tải lại màn thấy 25 và
  Kho chung; lối chung trả hai giá trị ấy; nhật ký cấu hình của sàn thêm đúng hai sự kiện, mỗi sự kiện ghi người và vai;
  lần lưu chỉ gửi hai khoá đã đổi. Đổi ô rồi bấm Hoàn lại thì mọi ô về giá trị đang áp và không gì được gửi.

- **AC-3** — Đổi chỉ áp cho lead mới. (cross-layer)
  Given sàn mẫu có một lead đã chia theo Theo vùng, lần lượt với hạn 15/30,
  When quản trị sàn lưu Cách chia Lần lượt toàn sàn, Hạn nhận 20, Hạn gọi 40 qua lối màn dùng, rồi một lead mới vào,
  Then lead mới mang Lần lượt toàn sàn và 20/40; lead đã chia vẫn mang Theo vùng, lần lượt và 15/30.

- **AC-4** — Mỗi dòng nói đúng lúc nó áp.
  Given sáu điểm của sổ,
  When màn dựng câu hiệu lực,
  Then ba điểm hiệu lực `moi` (cách chia, hạn nhận, hạn gọi) ghi «Áp cho lead mới — lead đã chia giữ …»; ba điểm `tinh_lai`
  (người đọc lời báo, hai ngưỡng) ghi «Áp ngay…»; câu đọc từ `hieuLuc` của sổ, không viết riêng cho từng khoá.

- **AC-5** — Giá trị sai không lưu được, lưu hỏng không mất gì. (cross-layer)
  Given quản trị sàn ở màn,
  When gõ Hạn nhận lead 0, hay 1441, hay để trống, hay Hạn gọi lần đầu nhỏ hơn Hạn nhận, hay «Cần gọi lại» 6; hoặc bấm Lưu
  mà máy chủ từ chối (400), mất quyền quản trị giữa chừng (403), hay mạng hỏng,
  Then ô sai: báo hiện ngay dưới đúng ô nêu khoảng hay lý do, nút Lưu khoá, không gì được gửi; 400: lý do máy chủ trả hiện
  dưới đúng dòng của khoá nó nêu, không khoá nào được ghi; 403: báo «Chỉ quản trị sàn đổi được luật này»; mạng hỏng: báo
  lỗi kèm «Thử lại»; cả ba ca giá trị đang gõ giữ nguyên.

- **AC-6** — Vai khác không đổi được. (cross-layer)
  Given trưởng nhóm, đầu chủ của sàn mẫu,
  When mở Cài đặt, mở thẳng `/settings/lead-routing`, hay gửi `PATCH /api/v1/company/settings` với một trong sáu khoá,
  Then cột mục lục không có mục «Luật chia lead»; mở thẳng thì về Cá nhân kèm «Mục này chỉ quản trị sàn mở được»; lối chung
  trả 403 và không khoá nào đổi.

- **AC-7** — Ba trạng thái đặc biệt nói thật. (cross-layer)
  Given (a) sàn có bộ nhóm Hôm nay riêng hợp lệ, (b) sàn có dòng cặp hạn trái luật từ trước (lối chung trả `errors`),
  (c) lối chung không trả lời,
  When quản trị sàn mở màn,
  Then (a) hai dòng ngưỡng khoá kèm báo «Sàn đang dùng bộ nhóm Hôm nay riêng — ngưỡng đặt trong bộ ấy»; (b) một báo trên
  đầu khung nêu điểm đang chạy theo mặc định; (c) «Chưa tải được luật chia lead» kèm «Thử lại», bấm thì tải lại.

- **AC-8** — Chữ trên màn theo từ vựng.
  Given nhãn mặc định ở lõi,
  When màn dựng lựa chọn,
  Then năm cách chia ghi Theo vùng, lần lượt · Lần lượt toàn sàn · Theo vùng, ít lead đang mở · Kho chung · Trưởng nhóm chia
  tay; hai người đọc lời báo ghi Trưởng nhóm · Trưởng nhóm và quản trị sàn; mỗi giá trị của thực đơn lõi có đúng một nhãn ở
  một chỗ trong `packages/core`; mã nguồn màn không có chữ «Cảnh báo» và không gọi cách chia là «Luật chia».

- **AC-9** — Cột Đầu chủ không ghi nhầm «Đã rời sàn» (Ngoài-9 hàng 105).
  Given Bảng hàng chỉ có bản danh bạ giữ trên máy (chưa đọc được từ máy chủ trong phiên này) và một căn gán cho người
  không có trong bản ấy,
  When cột Đầu chủ dựng ô của căn,
  Then ô ghi «…», không ghi «Đã rời sàn»; khi danh bạ đọc từ máy chủ trong phiên xác nhận người không còn trong sàn thì ô
  mới ghi «Đã rời sàn»; người có trong danh bạ vẫn hiện tên.

- **AC-10** — Đọc danh bạ hỏng thì báo và thử lại được (Ngoài-10 hàng 105).
  Given đầu chủ mẫu mở Bảng hàng và lần đọc danh bạ thành viên hỏng (máy chủ lỗi hay mất mạng),
  When bảng dựng,
  Then Bảng hàng hiện «Chưa đọc được danh bạ thành viên — cột Đầu chủ có thể thiếu tên» kèm «Thử lại»; bấm Thử lại khi
  lối đọc đã lành thì báo mất và cột Đầu chủ hiện tên; không có vòng thử lại tự động.

## Coverage

Quét `morphological-scan` preset entity-feature (thực thể: cấu hình chia lead của một sàn). Chân sản phẩm:
`[SUY-TỪ-REPO: packages/core/src/config/so.ts]`, `[SUY-TỪ-REPO: packages/api/src/settings/store.ts]`,
`[SUY-TỪ-REPO: packages/core/src/today/kiem.ts]`, `[SUY-TỪ-REPO: CONTEXT.md]`. Chân ngành: `[NGÀNH: Follow Up Boss,
KW Command, Lofty, BoldTrail — docs/product/doi-chieu-nganh.md]`.

- Trục vòng đời giá trị: xem (giá trị + nguồn + người đổi) | sửa | lưu nguyên khối | hoàn lại | lịch sử — thước CE: luồng
  quản trị ở thiết kế + nhật ký ngành. Core: xem (AC-1), sửa/lưu và hoàn lại (AC-2), lưu sai hay hỏng (AC-5). Later: xem cả
  nhật ký, về mặc định một chạm.
- Trục vai × quyền: quản trị sàn | vai khác của sàn | quản trị sàn khác | chưa đăng nhập — thước CE: `aiDoi` của sổ, luật
  cách ly. Core: quản trị (AC-1..5), vai khác (AC-6). Sàn khác, chưa đăng nhập: đã gác ở hàng 82 (bộ kiểm cách ly,
  401) — không lặp.
- Trục hiệu lực: áp cho lead mới | áp ngay | không áp vì sàn có bộ nhóm riêng — thước CE: `hieuLuc` của sổ, `docBoNhom`.
  Core: AC-3, AC-4, AC-7a.
- Trục ràng buộc giá trị: trong khoảng | ngoài khoảng/không phải số | cặp hạn trái luật | dòng hỏng có sẵn — thước CE:
  `kiemGiaTri`, `giaiCauHinh` của lõi. Core: AC-5, AC-7b.
- Trục danh bạ (Ngoài-9/10): bản máy chủ trong phiên | bản giữ trên máy | đọc hỏng — thước CE: hai finding của 105.
  Core: AC-9, AC-10.
- Cross-cutting: không điểm nào lớp nguồn (sổ, ràng buộc của hàng 82); mỗi lần đổi một sự kiện (hàng 82); trạng thái
  tải/lỗi (AC-7c, AC-10).
- Never: tính lại hạn của lead đã chia — ADR-0018 «áp cho mới»; luật chia theo điều kiện, trọng số — §12 01/11.

## Đường đo

- «Quản trị sàn đổi được cách chia, hai hạn, ngưỡng hai hàng đợi trong Cài đặt hợp nhất» — số từ lượt chấm ui-check E1,
  E2 trên chỗ thử dãy D · bảo đảm bởi AC-1, AC-2.
- «Lead mới theo luật mới, lead đã chia giữ luật cũ» — số từ bộ kiểm API trên Postgres dãy D · AC-3.
- «Màn dùng nhãn đã chốt ở Cổng Phạm vi 103» — Cổng 103 chốt nhãn pha (Hỏi-2, `_acceptance/man-lien-he/decisions.jsonl`
  d-20261105T035542Z-6); màn 48 không có dòng pha nào, nhãn còn lại theo `CONTEXT.md` (sửa 05/11 theo Áp ba lớp) và luật
  đợt 61 (chữ «lead» đổi một lượt ở hàng 106) — số từ bài kiểm nhãn của lõi và quét mã nguồn màn · AC-8.
- «Vai khác không đổi được» — lượt ui-check bằng phiên trưởng nhóm và bộ kiểm API · AC-6.

## Out of scope

- Chỉnh bộ nhóm Hôm nay (`queue.groups`, sổ #36 ghi màn 48) — đối tượng nhiều dòng có bộ kiểm riêng của hàng 22; gộp
  vào đây vượt trần cỡ hợp đồng, tách thành hàng mới (yêu cầu giám sát D-18). Màn 48 khoá hai ngưỡng khi sàn có bộ riêng.
- Xem cả nhật ký đổi cấu hình, «về mặc định» một chạm.
- Trần lead mỗi đầu chủ, lịch chia theo giờ (KW Command) — hàng sau khi có số đo.
- Bản điện thoại riêng: Cài đặt sàn là màn máy tính (Tham chiếu §11).
- Dọn dòng «Chỗ hở — Luật chia lead» ở `docs/design/vo-va-ia.md` §3 (sửa dòng có sẵn của tệp chung, luật đợt 12).

## Notes

- Luật đợt 69 nói 48 «cũng đọc danh bạ thành viên để chọn người nhận lead»: câu giao không có chọn người cụ thể; màn đọc
  danh bạ ở máy chủ để ghi tên người đổi lần cuối. Hai mục vá nằm ở hook danh bạ của Bảng hàng.
- Ngoài-1 (máy định tuyến 2026-11-05, đề xuất S4 known-limits): Khi chấm lại từ bản chính của kho, lượt chấm có thể đo nhầm mã của một bản làm việc khác. Người dùng cuối không bị ảnh hưởng, chỉ độ tin cậy của số đo chấm. — `_acceptance/luat-chia-lead/thu/dung-d.mjs`
- Ngoài-3 (máy định tuyến 2026-11-05, đề xuất S4 known-limits): Nếu không đọc được bộ nhóm Hôm nay của sàn, hai ô ngưỡng vẫn mở sửa và không có báo gì. Sàn có bộ nhóm riêng có thể lưu ngưỡng mà không có tác dụng. — `apps/web/src/app/(app)/settings/lead-routing/page.tsx`
- Ngoài-4 (máy định tuyến 2026-11-05, đề xuất S4 known-limits): Bài kiểm có thể không bắt được nếu sau này Bảng hàng tự đọc lại danh bạ liên tục khi hỏng. Hiện người dùng chưa thấy lỗi nào. — `apps/web/src/app/(app)/inventory/danh-ba.test.ts`
- Ngoài-5 (máy định tuyến 2026-11-05, đề xuất S4 known-limits): Bài kiểm chỉ canh được một phần các nhãn trên màn, nên sau này ai đó viết tay thêm một nhãn riêng có thể không bị phát hiện. Hiện nhãn trên màn vẫn đúng. — `apps/web/src/app/(app)/settings/lead-routing/luat.test.ts`
- Ngoài-6 (máy định tuyến 2026-11-05, đề xuất S4 known-limits): Lượt chấm có thể báo đạt dù ô Đầu chủ của căn đích vẫn hiện «…», miễn tên xuất hiện ở chỗ khác trên trang. Người dùng cuối chưa thấy lỗi. — `_acceptance/luat-chia-lead/thu/chay-ui.mjs`
- Ngoài-9 (máy định tuyến 2026-11-05, đề xuất S4 known-limits): Nếu máy chủ trả danh bạ sai dạng (rất hiếm), Bảng hàng có thể vỡ thay vì báo lỗi kèm Thử lại. — `apps/web/src/app/(app)/inventory/danh-ba.ts`
- Ngoài-10 (máy định tuyến 2026-11-05, đề xuất S4 known-limits): Khi không đọc được bộ nhóm Hôm nay riêng của sàn, quản trị vẫn sửa được hai ngưỡng và thấy «Đã lưu», nhưng giá trị không có hiệu lực. — `apps/web/src/app/(app)/settings/lead-routing/page.tsx`
- Ngoài-11 (máy định tuyến 2026-11-05, đề xuất S4 known-limits): Quản trị đang ở sàn nhưng chưa đặt tên sẽ bị ghi là «Đã rời sàn» ở dòng nguồn của luật. — `apps/web/src/app/(app)/settings/lead-routing/luat.ts`
- Ngoài-12 (máy định tuyến 2026-11-05, đề xuất S4 known-limits): Căn gán cho người vừa vào sàn có thể tạm ghi «Đã rời sàn» cho tới khi danh bạ đọc lại xong; nếu đọc lại hỏng thì chữ sai còn nằm đó kèm báo lỗi. — `apps/web/src/app/(app)/inventory/danh-ba.ts`
- Ngoài-14 (máy định tuyến 2026-11-05, đề xuất S4 known-limits): Hiện Bảng hàng không tự thử lại danh bạ, nhưng nếu sau này ai đó đổi cách đọc thì bài kiểm có thể không bắt được. — `apps/web/src/app/(app)/inventory/danh-ba.test.ts`
- Ngoài-15 (máy định tuyến 2026-11-05, đề xuất S4 known-limits): Nhãn trên màn hiện đúng, nhưng sau này nếu ai viết tay một nhãn lệch thì bài kiểm có thể không bắt được. — `apps/web/src/app/(app)/settings/lead-routing/luat.test.ts`
- Ngoài-16 (máy định tuyến 2026-11-05, đề xuất S4 known-limits): Kịch bản thử có thể báo đạt dù ô Đầu chủ của đúng căn chưa chắc hiện tên. — `_acceptance/luat-chia-lead/thu/chay-ui.mjs`
- Ngoài-17 (máy định tuyến 2026-11-05, đề xuất S4 known-limits): Khi một căn vừa gán cho người mới vào sàn, cột Đầu chủ có thể ghi nhầm «Đã rời sàn» trong lúc danh bạ đang đọc lại hoặc đọc lại bị lỗi. Tải lại trang hoặc bấm Thử lại thì hiện đúng tên. — `apps/web/src/app/(app)/inventory/danh-ba.ts`
- Ngoài-18 (máy định tuyến 2026-11-05, đề xuất S4 known-limits): Chữ «Đã rời sàn» được khai ở hai nơi nên sau này sửa chữ ở một màn có thể lệch với màn kia. Hiện người dùng chưa thấy khác biệt nào. — `apps/web/src/app/(app)/settings/lead-routing/luat.ts`
- Ngoài-21 (máy định tuyến 2026-11-05, đề xuất S4 known-limits): Nếu việc đọc bộ nhóm Hôm nay lỗi mà sàn có bộ nhóm riêng, hai ngưỡng vẫn mở sửa và báo «Đã lưu» nhưng không có tác dụng. Quản trị không được báo gì về lần đọc lỗi. — `apps/web/src/app/(app)/settings/lead-routing/page.tsx`
- Ngoài-23 (máy định tuyến 2026-11-05, đề xuất S4 known-limits): Bài thử giao diện có thể báo đạt dù ô Đầu chủ của căn được gán vẫn hiện «…», vì nó chỉ tìm tên ở bất kỳ đâu trên trang. Người dùng không bị ảnh hưởng trực tiếp, nhưng bằng chứng nghiệm thu yếu hơn. — `_acceptance/luat-chia-lead/thu/chay-ui.mjs`
- Ngoài-24 (máy định tuyến 2026-11-05, đề xuất S4 known-limits): Bài thử có thể báo «vai khác không thấy mục Luật chia lead» là đạt dù thực ra nó không tìm đúng chỗ để thấy mục đó. Người dùng không bị ảnh hưởng trực tiếp, nhưng khẳng định về quyền yếu hơn. — `_acceptance/luat-chia-lead/thu/chay-ui.mjs`
