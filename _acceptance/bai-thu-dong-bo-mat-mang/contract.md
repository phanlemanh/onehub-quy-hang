---
schema_version: 1
feature: Bộ đồng bộ đưa đúng phần mỗi người được thấy xuống máy, rút mạng năm phút rồi nối lại không mất thay đổi nào
slug: bai-thu-dong-bo-mat-mang
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api, cli]
status: signed-off
design_doc: _acceptance/bai-thu-dong-bo-mat-mang/design.md
approved_by: Manh Phan
approved_at: 2026-10-30
---

# Acceptance Contract: bai-thu-dong-bo-mat-mang

## Context

Bài thử (b) của Kiến trúc §9 bước 1: dựng bộ đồng bộ tự làm mỏng trên Postgres thật có luật theo dòng, đo cách ly và
hàng đợi ghi khi mất mạng năm phút, rồi viết ADR đề xuất chọn bộ đồng bộ (PowerSync, ElectricSQL hay tự làm mỏng).

Source input: `docs/plan/lo-trinh.json` hàng 2 · `_acceptance/bai-thu-dong-bo-mat-mang/opportunity.md`

## Criteria

- AC-1: Given hai sàn mẫu với đầu chủ A1, A2, trưởng nhóm A ở sàn A và đầu chủ B1 ở sàn B, When mỗi người kéo toàn bộ thay
  đổi về máy, Then không ai nhận dòng căn hay dòng thay đổi nào của sàn kia; phiên không đặt sàn nhận rỗng. (cross-layer)
- AC-2: Given số chủ là lớp nguồn, When kéo về, Then đầu chủ chỉ nhận số chủ của căn mình giữ, trưởng nhóm nhận số chủ của
  mọi căn trong sàn, đầu chủ khác cùng sàn không nhận số chủ nào của căn không thuộc mình — xét trên TOÀN BỘ dữ liệu kéo về
  (mọi bảng, kể cả nội dung dòng thay đổi), không chỉ bảng số chủ. (cross-layer)
- AC-3: Given luật theo dòng của các bảng mẫu, When máy chủ thật xử lý một lần kéo, Then truy vấn chạy bằng vai `quy_hang_app`
  không quyền vượt luật theo dòng, và cách ly đến từ cơ sở dữ liệu chứ không từ máy chủ: truy vấn kéo không có điều kiện
  lọc theo sàn vẫn không lộ dòng sàn kia; tắt luật theo dòng trong giao dịch thử thì bài kiểm đỏ. (cross-layer)
- AC-4: Given máy đang mất mạng, When người đổi giá nhiều lần, Then mỗi thao tác vào hàng đợi trên máy với số thứ tự tăng
  dần và còn nguyên khi tải lại trang; khi có mạng lại, hàng đợi đẩy lên và máy chủ áp đúng thứ tự, không thiếu thao tác nào.
  (cross-layer)
- AC-5: Given một lô bị cắt giữa chừng hoặc gửi lại hai lần, When máy đẩy lại, Then máy chủ không áp trùng thao tác nào
  (khoá chống trùng theo mã thao tác) và thao tác chưa được xác nhận vẫn được gửi lại.
- AC-6: Given một thao tác ghi nhắm căn của sàn khác, When máy chủ nhận, Then thao tác bị từ chối, không đổi dữ liệu nào,
  và máy nhận lý do từ chối để báo người.
- AC-7: Given trang thử trên điện thoại, When người chọn vai mẫu, đổi giá, tắt và bật mạng, Then trang hiện bảng căn kéo
  về, trạng thái mạng, số thao tác chờ đẩy, và ghi các sự kiện mạng, đẩy, nhận về nhật ký máy chủ.
- AC-8: Given chủ kho chạy một lệnh, When lệnh khởi động, Then bảng mẫu và dữ liệu mẫu được áp lên Postgres của dãy, máy chủ
  lên, đường hầm mở hoặc báo rõ vì sao không, in link và các bước; nhật ký không chứa IP thô; Ctrl+C ghi tóm tắt.
- AC-9: Given nhật ký phiên thử thật, When ghi kết quả, Then `ket-qua.md` chứa đúng bảng mà `tom-tat.mjs` tính từ nhật ký
  sạch, kết luận từng vế theo luật viết trước: vế mất mạng chỉ đạt khi có khoảng mất mạng ≥ 5 phút, có ≥ 1 thao tác tạo
  trong khoảng đó, và mọi thao tác ấy lên máy chủ đúng thứ tự; vế cách ly chỉ đạt khi mọi lần kéo về trong phiên thật
  có tập sàn và tập số chủ bằng đúng ma trận theo vai (luật viết trước trong `tom-tat.mjs`).
- AC-10: Given `ket-qua.md`, When đọc ADR mới của bài thử, Then ADR ở trạng thái «đề xuất», so ba lối (tự làm mỏng,
  PowerSync, ElectricSQL) theo cách ly, hàng đợi ghi, chi phí vận hành, mỗi điều ghi rõ là số đo (trỏ `ket-qua.md`) hay
  hiểu biết từ tài liệu công bố (chưa đo), nêu khuyến nghị, lối khác và giá. (judgment)

## Coverage

Quét bằng morphological-scan (preset test-matrix) — chi tiết trong `design.md` mục «Không gian đã quét».

- Trục A — người xem: đầu chủ giữ căn | đầu chủ khác cùng sàn | trưởng nhóm | người sàn khác | phiên không đặt sàn [thước CE:
  Kiến trúc §1 bảng vai] → AC-1, AC-2, AC-3
- Trục B — loại dữ liệu: dòng căn | số chủ [thước CE: packages/core/src/data-classes.ts] → AC-1, AC-2
- Trục C — trạng thái mạng: có mạng | mất mạng ≥ 5 phút | chập chờn [thước CE: bat_khi của hàng 2] → AC-4, AC-5, AC-9
- Trục D — kết cục ghi: áp đúng thứ tự | trùng bị bỏ | bị từ chối vì cách ly [thước CE: ngành transactional outbox] → AC-4,
  AC-5, AC-6

## Đường đo

- Thước: không dòng nào của sàn kia và không số chủ của đầu chủ khác xuống máy · số từ: bài kiểm kéo theo từng vai mẫu
  trên Postgres dãy T và sự kiện `keo` của phiên thật · bảo đảm bởi: AC-1, AC-2, AC-3, AC-9
- Thước: sau năm phút mất mạng mọi thay đổi lên máy chủ đúng thứ tự · số từ: sự kiện `mang` (tắt/bật kèm giờ) và `day`
  (client_seq, server_seq) trong nhật ký máy chủ · bảo đảm bởi: AC-4, AC-5, AC-9
- Thước: ADR chọn bộ đồng bộ · số từ: `ket-qua.md` · bảo đảm bởi: AC-10

## Out of scope

- Dựng PowerSync hay ElectricSQL bằng container để đo — ADR nêu «chưa đo» kèm điều kiện đo.
- Xung đột khi hai người cùng sửa một căn lúc mất mạng; đồng bộ ảnh; xoá dữ liệu trên máy khi đăng xuất.
- Mã sản phẩm ở `apps/web/src/lib/sync/**` — đi hàng dựng sau khi chủ kho chốt ADR.
- Chốt bộ đồng bộ: ADR chỉ đề xuất; chủ kho chốt.

## Notes

- Mã thử và bảng mẫu nằm trong `_acceptance/bai-thu-dong-bo-mat-mang/thu/` (luật đợt 5); bảng mẫu áp lên Postgres dãy T
  (5547), không phải migration của kho.
- Lộ trình ghi hàng này T3; máy suy T2 vì bài thử không chạm `packages/db/**` hay lõi.
- Phiên mất mạng thật cần chủ kho cầm điện thoại: gom thành một yêu cầu `can-nguoi` (luật đợt 16); mạng công ty chặn
  đường hầm — chạy trên điểm phát điện thoại.
- Known limits — chọn ở Cổng Bằng chứng 2026-10-30:
  - Ngoài-1: một thay đổi cứ bị lỗi thì các thay đổi sau không lên máy chủ và trang thử không báo gì, chỉ thấy số chờ đứng yên.
  - Ngoài-2: chạy bài kiểm mà quên khai cơ sở dữ liệu thì nó dựng lại bảng mẫu trên Postgres cổng 5547.
  - Ngoài-3: ai có link của phiên thử đều xem được nhật ký có số chủ mẫu của mọi vai.
  - Trong hợp đồng (AC-9): luật kết luận so số thay đổi máy còn giữ lúc nối lại với số tạo trong lúc mất mạng, nên có thể chấm không đạt oan khi có thay đổi tạo ngay trước lúc máy báo mất mạng.
  - Trong hợp đồng (AC-8): ca kiểm lệnh một-lệnh đếm dữ liệu mẫu đã có sẵn, nên chưa chứng minh lệnh tự dựng mẫu.
