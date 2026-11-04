---
schema_version: 1
feature: "Mỗi sàn giữ cấu hình riêng: đổi một điểm qua một lệnh API thành sự kiện chỉ thêm ghi người và vai, sàn chưa đổi thì nhận mặc định của sổ, đối tượng tạo sau lần đổi mang số mới còn đối tượng cũ giữ số lúc tạo, và sàn khác không đọc hay đổi được"
slug: cau-hinh-theo-san
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, db]
status: signed-off
design_doc: docs/superpowers/specs/2026-11-04-cau-hinh-theo-san-design.md
approved_by: Manh Phan
approved_at: 2026-11-04
---

# Acceptance Contract: cau-hinh-theo-san

## Context

Hàng 82 của lộ trình (dãy D, đợt `dau-khach-nhap`), mã phạm vi CH3, CH4, CH5. Gốc: ADR-0018 quyết định 2, 3, 4, 6;
Tham chiếu §4 «Cấu hình sàn: mọi thay đổi vào nhật ký, không sửa số đã lưu»; luật đợt 23, 46. Đứng trên hàng 81 (sổ điểm
biến thiên ở lõi), hàng 25 (bảng `company_settings`, lối lead-routing), hàng 22 (lối queue). Hạng T3: thêm bảng, trigger,
cột ở cơ sở dữ liệu (migration `026`). Không có màn — màn Cài đặt sàn là hàng 45–49.

Hàng nhận thêm tiêu chí của luật đợt 46 — nguồn «Ngoài-5 hàng 81»: sàn chỉ đặt một nửa của cặp hạn mà cặp ghép lại trái
luật thì bị từ chối hoặc báo, không áp im lặng (AC-5).

Chạm bất biến 1 (bảng mới có luật theo dòng, ca cách ly) và bất biến 2 (cơ sở dữ liệu chặn lớp `source` ở hai bảng cấu
hình). Không chạm bất biến 3, 4.

Source input: `docs/plan/lo-trinh.json` hàng 82 · `_acceptance/cau-hinh-theo-san/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-11-04-cau-hinh-theo-san-design.md`

## Criteria

- **AC-1** — Đọc cấu hình của sàn, mặc định khi chưa đổi.
  Given sàn A và sàn B chưa đặt điểm nào,
  When một thành viên sàn A gọi `GET /api/v1/company/settings`, rồi quản trị sàn A đổi `lead_routing.accept_minutes`
  thành 20,
  Then trước khi đổi mỗi điểm giá trị đơn đã mở của sổ có đúng một dòng, giá trị bằng mặc định của sổ, nguồn «mặc định»;
  sau khi đổi sàn A đọc 20 nguồn «sàn» kèm người đổi và lúc đổi, sàn B vẫn đọc 15 nguồn «mặc định».

- **AC-2** — Đổi qua một lệnh, mỗi khoá một sự kiện.
  Given quản trị sàn A,
  When gọi `PATCH /api/v1/company/settings` với một khoá, rồi với hai khoá trong cùng một lệnh,
  Then 200 trả cấu hình mới; bản hiện hành mang giá trị mới; nhật ký có thêm đúng một sự kiện mỗi khoá đã gửi, ghi khoá,
  giá trị, người đổi, vai của người đổi và lúc đổi.

- **AC-3** — Vai khác không đổi được.
  Given trưởng nhóm, đầu chủ, telesales của sàn A và một lời gọi không đăng nhập,
  When gọi `PATCH /api/v1/company/settings` với một giá trị hợp lệ,
  Then ba vai nhận 403, lời gọi không đăng nhập nhận 401; bản hiện hành và nhật ký không đổi.

- **AC-4** — Giá trị sai bị từ chối nguyên khối, nêu đúng khoá.
  Given quản trị sàn A,
  When gửi khoá không có trong sổ, khoá có bảng riêng hay họ khoá, khoá chưa mở, giá trị sai kiểu, giá trị ngoài khoảng
  (dưới biên dưới, trên biên trên), hoặc một khoá hợp lệ cùng một khoá sai trong một lệnh,
  Then mỗi ca 400 với lý do nêu đúng khoá sai, và không khoá nào của lệnh được ghi; hai biên của khoảng được nhận.

- **AC-5** — Cặp hạn trái luật không áp im lặng (luật đợt 46, nguồn «Ngoài-5 hàng 81»).
  Given hạn gọi lần đầu của sàn đang là 30 phút,
  When quản trị chỉ đặt hạn nhận 60 phút; hoặc gửi cả hạn nhận 45 và hạn gọi 60 trong cùng lệnh; hoặc bộ đọc cấu hình gặp
  dòng sàn chỉ đặt hạn nhận 60 (dòng có từ trước, không qua lối kiểm),
  Then lần đặt một nửa bị 400 nêu cả hai khoá; lần gửi cả cặp được nhận; đọc cấu hình (`GET`) trả cặp mặc định 15/30 kèm
  lỗi nêu cả hai khoá; lead vào nhịp chia mang hạn 15/30 (Hỏi-1, chủ kho duyệt ở Cổng Phạm vi) — không lối nào áp hạn nhận 60 cùng
  hạn gọi 30.

- **AC-6** — Nhật ký chỉ thêm, mọi lối ghi đều vào nhật ký.
  Given nhật ký cấu hình của sàn A,
  When vai của API thử sửa, xoá hay chèn thẳng một sự kiện; và quản trị sàn A đổi cấu hình qua lối chung, lối chia lead
  (`/company/settings/lead-routing`) và lối hàng đợi (`/company/settings/queue`),
  Then sửa, xoá, chèn thẳng đều bị cơ sở dữ liệu chặn (kể cả bằng quyền chủ bảng, sửa và xoá vẫn bị chặn); mỗi lần ghi
  qua ba lối thêm đúng một sự kiện mỗi khoá đã ghi, ghi khoá, giá trị, người và vai; dòng cấu hình có từ trước migration
  026 có đúng một sự kiện chép bù mỗi dòng.

- **AC-7** — Không dòng cấu hình nào thuộc lớp nguồn.
  Given hai bảng cấu hình,
  When ghi một dòng cấu hình hay sự kiện mang lớp `source`; và lối chung ghi một khoá của sổ,
  Then cơ sở dữ liệu từ chối lớp `source` bằng ràng buộc; dòng do lối chung ghi mang đúng lớp sổ khai cho khoá ấy.

- **AC-8** — Đối tượng cũ giữ số lúc tạo, đối tượng mới mang số mới.
  Given sàn A có một lead đã chia với hạn nhận 15 phút,
  When quản trị đổi hạn nhận thành 20 qua lối chung rồi một lead mới vào nhịp chia,
  Then lead cũ vẫn mang hạn 15, lead mới mang hạn 20.

- **AC-9** — Sàn khác không đọc hay đổi được.
  Given cấu hình và nhật ký của sàn A,
  When người của sàn B đọc, chèn hay sửa ở hai bảng cấu hình,
  Then không thấy dòng nào của A, không ghi được dòng nào cho A; hai bảng bật và ép luật theo dòng.

## Coverage

Bỏ quét morphological-scan (sổ: «bỏ coverage-scan»); trục ghi tay:

- Trục lối ghi: lối chung (AC-2, AC-4, AC-5) | lối chia lead có sẵn (AC-6) | lối hàng đợi có sẵn (AC-6) | ghi thẳng cơ sở
  dữ liệu (AC-5, AC-6, AC-7, AC-9) | dòng có trước migration (AC-6).
- Trục người gọi: quản trị sàn | trưởng nhóm | đầu chủ | telesales | chưa đăng nhập | người sàn khác (AC-1 đọc bằng vai
  không quản trị, AC-2, AC-3, AC-9).
- Trục giá trị: mặc định | trong khoảng | hai biên | ngoài khoảng | sai kiểu | khoá lạ | khoá bảng riêng | khoá chưa mở
  (AC-1, AC-4).
- Trục ràng buộc chéo: cặp hợp lệ | một nửa trái luật ở lối ghi | cả cặp cùng lệnh | dòng trái luật ở lối đọc (GET và
  nhịp chia lead) (AC-5).
- Trục hiệu lực: «mới» — lead trước và sau lần đổi (AC-8); «tính lại» — đọc ngay ở GET (AC-1).
- Trục bất biến: cách ly (AC-9) | lớp nguồn (AC-7).
- Later: màn Cài đặt sàn (45–49), lối đọc nhật ký cho người, họ khoá và khoá bảng riêng qua lối chung. Never: khoá lớp
  `source`.

## Đường đo

- Thước SỐNG của ô cơ hội «quản trị sàn A đổi hạn nhận 15 → 20; lead chia sau tính 20, lead chia trước giữ 15; vai khác
  → 403; ngoài khoảng → 400 nêu khoá; sàn B vẫn đọc 15; bộ kiểm cách ly có ca cho hai bảng cấu hình; sửa hay xoá sự kiện
  cấu hình bị chặn» · số từ: bộ kiểm trên Postgres thử (`packages/api/test-db/cau-hinh-theo-san.test.ts`,
  `packages/db/tests/isolation.test.mjs`) · bảo đảm bởi: AC-1, AC-3, AC-4, AC-6, AC-8, AC-9.

## Out of scope

- Màn Cài đặt sàn và mọi ô chỉnh cấu hình (hàng 45–49).
- Lối đọc nhật ký cấu hình cho người (màn lịch sử) — nhật ký có ở cơ sở dữ liệu, màn đọc nó đi cùng hàng 45–49.
- Họ khoá (`labels.field.<…>`, `custom_fields.<id>.…`) và khoá có bảng riêng (`map`) qua lối chung — mỗi loại có hàng của
  nó; khuôn khoá hai đoạn của `company_settings` giữ nguyên.
- Đổi hai lối ghi cũ (lead-routing, queue) sang lối chung — chúng tự vào nhật ký qua trigger; gộp lối là việc của màn 48.
- Bộ đệm cấu hình theo phiên bản (ADR-0018 quyết định 2 «hay lấy từ bộ đệm») — mỗi lời gọi đọc bảng như hôm nay.

## Notes

- Mặc định của sổ giữ đúng số cũ (luật đợt 23): gọi lại 14 ngày, hỏi lại 20%, hạn lead 15/30 phút.
- Known limits — chọn ở Cổng Bằng chứng 2026-11-04:
  - Ngoài-1: Sàn đã có sẵn cặp hạn nhận và hạn gọi trái luật từ dữ liệu cũ thì quản trị đổi một nửa cặp vẫn được báo thành công mà số mới không có hiệu lực; lead vẫn chạy theo hạn mặc định 15/30 phút, gỡ bằng cách đặt cả hai hạn cùng lúc.
