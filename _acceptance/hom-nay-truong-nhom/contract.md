---
schema_version: 1
feature: "Trưởng nhóm mở Hôm nay và thấy lead quá hạn để chia lại, hàng cũ theo từng đầu chủ, và ngoại lệ máy không tự quyết được"
slug: hom-nay-truong-nhom
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, core, ui]
status: signed-off
design_doc: docs/superpowers/specs/2026-11-04-hom-nay-truong-nhom-design.md
approved_by: Manh Phan
approved_at: 2026-11-04
---

# Acceptance Contract: hom-nay-truong-nhom

## Context

Hàng 42 của lộ trình (đợt `ban-dau-2910`, P5), Cổng Đáng «build» (Manh Phan, 02/11). Tham chiếu §9: «Hôm nay | Lead quá
hạn, hàng cũ theo người, ngoại lệ | Trưởng nhóm · máy tính | TN1». Đứng trên hàng 22 (Hôm nay đầu chủ) và 25 (chia lead,
lời báo quá hạn, lệnh giao lại). Bố cục Bảng điều khiển của ADR-0024; khối đích `dashboard-6` bỏ biểu đồ (`vo-va-ia.md`).

Source input: `docs/plan/lo-trinh.json` hàng 42 · `_acceptance/hom-nay-truong-nhom/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-11-04-hom-nay-truong-nhom-design.md`.

## Criteria

- AC-1: Given một sàn có lead ở các tình trạng — chưa chia được, đã về người quá hạn nhận chưa nhận, đã nhận quá hạn gọi
  chưa gọi, còn trong hạn, đã nhận và gọi, đã trả lại, và một lead của sàn khác — When trưởng nhóm gọi
  `GET /api/v1/team/lead-queue`, Then trả đúng ba lead đang mở cần trưởng nhóm, mỗi lead một dòng với loại `unrouted`,
  `accept_overdue`, `first_call_overdue`, xếp quá hạn lâu nhất trước; không lead nào khác vào; tập khoá mỗi dòng đúng
  tập đã khai, thân phản hồi không chứa số điện thoại hay tên chủ nhà mồi. Phạm vi là cả sàn (chưa có «Nhóm», sổ K5).
- AC-2: Given cùng sàn ấy, When vai khác trưởng nhóm (đầu chủ, telesales, quản trị sàn) hay người chưa đăng nhập gọi hai
  lối `GET /api/v1/team/lead-queue` và `GET /api/v1/team/listing-agents`, Then trả 403 (đã đăng nhập) hay 401 (chưa), không
  dữ liệu.
- AC-3: Given sàn có ba thành viên vai Đầu chủ (một người đang nghỉ, một người có hai lead đang mở) và một thành viên không
  phải đầu chủ, When trưởng nhóm gọi `GET /api/v1/team/listing-agents`, Then trả đúng ba đầu chủ với mã người, tên hiển thị,
  `onLeave` và số lead đang mở đúng; tập khoá mỗi dòng đúng tập đã khai (không email, không số điện thoại); thành viên sàn khác
  không vào.
- AC-4: Given danh sách căn trên máy với đầu chủ giữ, ngày xác nhận và trạng thái, When gọi
  `hangCuTheoNguoi(can, homNay, cauHinh)`, Then mỗi đầu chủ một dòng với số căn đang mở, số căn cần gọi lại và tỉ lệ tươi
  đúng theo `queue.call_back_after_days` của cấu hình (mặc định 14, và ở một giá trị khác trong khoảng); căn đã đóng (Đã
  bán, Ngừng hẳn) không đếm; căn chưa có người giữ gom một dòng riêng. Ô «Hàng cũ» = tổng căn cần gọi lại của mọi dòng; phạm vi
  đếm theo câu trả lời Hỏi-5.
- AC-5 (cross-layer): Given trưởng nhóm thấy một lead quá hạn trên `/today`, When bấm «Giao lại», chọn một đầu chủ và xác
  nhận, Then máy chủ ghi lead về người mới (cơ sở dữ liệu: `matched_agent_user_id` đổi, `reassign_count` tăng, mốc hạn bắt
  đầu lại lúc giao — lead không vào hàng đợi trước hạn nhận mới, vào lại sau hạn ấy nếu chưa nhận) và dòng rời hàng đợi, ô
  «Lead quá hạn» giảm một; giao lead căn trùng bị từ chối (400 `lead-not-assignable`) thì người giữ không đổi, dòng ở lại
  với câu lỗi.
- AC-6: Given trưởng nhóm (không vai Đầu chủ) mở `/today` trên máy tính, When trang tải xong, Then thấy bố cục Bảng điều
  khiển với ba ô số «Lead quá hạn» (lead đã về người quá hạn nhận hay gọi), «Ngoại lệ» (theo Hỏi-1),
  «Hàng cũ» (tổng căn cần gọi lại) bằng đúng số của lối hàng đợi và hàm lõi, hàng đợi lead quá hạn,
  và bảng theo đầu chủ có thanh tỉ lệ tươi; không còn chỗ trống «Placeholder».
- AC-7: Given sáu trạng thái của bảng trạng thái (đang tải, mặc định, trống, lỗi, mất mạng, giao lỗi), When dựng màn ở mỗi
  trạng thái, Then mỗi trạng thái hiện đúng chữ và nút đã khai ở thiết kế; mất mạng thì nút giao tắt.
- AC-8: Given người có vai Đầu chủ mà không có vai Trưởng nhóm, và người có cả hai vai, When mở `/today`, Then người chỉ có
  vai Đầu chủ thấy Hôm nay của đầu chủ như trước; người có cả hai thấy theo câu trả lời Hỏi-2; khổ điện thoại thấy dòng «mở
  trên máy tính» thay bảng điều khiển.
- AC-9: Given bản đồ khuôn `design/patterns/`, When chạy lưới khuôn của kho, Then có nhóm `hom-nay-truong-nhom` nhận diện
  tệp màn mới, nhóm `hom-nay-dau-chu` không còn `ngoai_le_han` hẹn hàng này, và lưới xanh trên tệp vòng chạm.

## Coverage

Bỏ quét morphological-scan (sổ: «bỏ coverage-scan»); trục ghi tay:

- Trục dữ liệu: lead quá hạn (AC-1) | đầu chủ để giao (AC-3) | hàng cũ (AC-4) | giao lại (AC-5).
- Trục tình trạng lead: chưa chia được | quá hạn nhận | quá hạn gọi | trong hạn | đã gọi | đã trả lại | sàn khác (AC-1).
- Trục quyền: trưởng nhóm | đầu chủ | telesales | quản trị | chưa đăng nhập | sàn khác (AC-1, AC-2, AC-3).
- Trục màn: vai (AC-8) | trạng thái (AC-7) | khổ (AC-8) | số khớp dữ liệu (AC-6) | khuôn (AC-9).
- Later: đẩy điện thoại (hàng 26), phễu và Đội. Never ở hàng này: tự giao lại lead (hàng 25 chốt: trưởng nhóm giao tay).

## Đường đo

- Thước SỐNG «trưởng nhóm thấy lead quá hạn để chia lại, hàng cũ theo người, ngoại lệ» · số từ: màn `/today` của trưởng
  nhóm · bảo đảm bởi: AC-1, AC-4, AC-5, AC-6.
- Thước «thời gian lead → cuộc gọi đầu» (Tham chiếu §11) · số từ: bảng số đo lõi hàng 52 (`lead_to_first_call`) — hàng này
  không đổi cách đo; giao lại sớm hơn là đường kéo số ấy xuống · bảo đảm bởi: AC-5 (giao lại ghi đúng mốc).

## Out of scope

- Đẩy thông báo lead quá hạn lên điện thoại trưởng nhóm — hàng 26.
- Phễu, tốc độ gọi theo người, biểu đồ — trang Đội.
- «Ngoại lệ khi lên bảng», lead căn trùng như loại ngoại lệ — chưa có mã (Hỏi-1).
- Bản điện thoại của bảng điều khiển (ADR-0024).
- Đổi đầu chủ giữ căn từ bảng hàng cũ — lối có sẵn ở hồ sơ căn.

## Notes

- Bất biến chạm: (1) cách ly — hai lối mới đọc qua luật theo dòng, ca sàn khác ở AC-1, AC-3; (2) chủ nhà — hai lối không
  trả trường lớp `source` (AC-1, AC-3); (3), (4) không chạm.
- Dãy D, đợt `dau-khach-nhap`.
- Ngoài-1 (máy định tuyến 2026-11-04, đề xuất S4 known-limits): Nếu sàn đổi số ngày coi là hàng cũ, bài kiểm vẫn xanh dù ô «Hàng cũ» trên màn trưởng nhóm có thể vẫn đếm theo số ngày mặc định. Trưởng nhóm có thể thấy con số không khớp với cấu hình của sàn mà không ai được báo. — `apps/web/src/app/(app)/today/truong-nhom.test.ts`
- Ngoài-2 (máy định tuyến 2026-11-04, đề xuất S4 known-limits): Nếu phần nối giữa kết quả tải và trạng thái màn bị sai, màn có thể báo lỗi thay vì «mất mạng» (hoặc ngược lại) mà bài kiểm vẫn xanh. Trưởng nhóm khi mất mạng có thể thấy thông báo không đúng hoặc nút giao không tắt. — `apps/web/src/app/(app)/today/truong-nhom.test.ts`
- Ngoài-3 (máy định tuyến 2026-11-04, đề xuất S4 known-limits): Bài kiểm khẳng định danh sách lead quá hạn không lộ tên chủ nhà, nhưng lead trong bài kiểm không hề có tên đó nên khẳng định này luôn đúng. Nếu sau này có thay đổi làm lộ tên chủ nhà ra danh sách, bài kiểm sẽ không bắt được. — `packages/api/test-db/hom-nay-truong-nhom.test.ts`
- Ngoài-4 (máy định tuyến 2026-11-04, đề xuất S4 known-limits): Trên màn hình rộng, vùng của trưởng nhóm bị thu hẹp và căn giữa nên lệch mép với các dải bên dưới. Người dùng dùng đọc màn hình có thể nghe vùng nội dung chính bị khai báo hai lần. — `apps/web/src/components/khoi/dashboard-6/coverage-dashboard.tsx`
- Ngoài-5 (máy định tuyến 2026-11-04, đề xuất S4 known-limits): Sau khi mạng trở lại, màn của trưởng nhóm vẫn báo đang mất mạng và các nút Giao lại vẫn tắt. Phải tải lại trang mới giao được. — `apps/web/src/app/(app)/today/truong-nhom.tsx`
- Ngoài-6 (máy định tuyến 2026-11-04, đề xuất S4 known-limits): Nếu mở màn lúc mạng đang chập chờn, trưởng nhóm có thể thấy câu «Không lead nào quá hạn» dù máy chưa đọc được gì, trong khi các ô số hiện dấu gạch. Họ có thể tưởng không có việc cần chia lại. — `apps/web/src/app/(app)/today/truong-nhom.tsx`
- Ngoài-7 (máy định tuyến 2026-11-04, đề xuất S4 known-limits): Đầu chủ chưa nhập tên sẽ hiện thành ô trống trong bảng theo đầu chủ và ở dòng lead quá hạn, thay vì mã ngắn như ở ô chọn Giao lại. Trưởng nhóm khó biết đó là ai. — `packages/api/src/team/routes.ts`
- Ngoài-8 (máy định tuyến 2026-11-04, đề xuất S4 known-limits): Bài kiểm chưa chứng minh được rằng tên chủ nhà không lọt vào hàng đợi của trưởng nhóm, nên nếu sau này có lỗi rò tên thì bài kiểm sẽ không báo. Hiện chưa có dấu hiệu tên bị lộ. — `packages/api/test-db/hom-nay-truong-nhom.test.ts`
- Known limits — chọn ở Cổng Bằng chứng 2026-11-04:
  - Ngoài-1: ô «Hàng cũ» đếm theo ngưỡng gọi lại mặc định, chưa đọc ngưỡng riêng của sàn.
  - Ngoài-2: bài kiểm trạng thái mất mạng và lỗi không đi qua phần nối của màn.
  - Ngoài-3: bài kiểm vắng tên chủ nhà trên hàng đợi chưa có đối chứng trên chính lead.
  - Ngoài-4: vùng trưởng nhóm còn bề rộng tối đa và thẻ main lồng nhau, lệch mép với dải bên dưới trên màn rộng.
  - Ngoài-5: mạng trở lại thì màn vẫn báo mất mạng và tắt nút Giao lại tới khi tải lại trang.
  - Ngoài-6: mở màn lúc mất mạng thì hàng đợi báo «Không lead nào quá hạn» dù chưa đọc được.
  - Ngoài-7: đầu chủ chưa đặt tên hiện ô trống ở bảng theo người và dòng hàng đợi.
  - Ngoài-8: mồi tên chủ nhà của bài kiểm hàng đợi không nằm trên lead nào nên kiểm vắng tên luôn đạt.
