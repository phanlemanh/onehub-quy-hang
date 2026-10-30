---
schema_version: 1
feature: "Lưới bảng hàng 5.000 dòng × 20 cột cuộn, sửa trên ô và dán 500 ô từ Excel mà không giật trên máy tính văn phòng"
slug: bai-thu-luoi-5000-dong
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, docs]
status: draft
design_doc: _acceptance/bai-thu-luoi-5000-dong/design.md
approved_by:
approved_at:
---

# Acceptance Contract: bai-thu-luoi-5000-dong

## Context

Bài thử (a) của Kiến trúc §9: trước khi dựng bảng hàng, đo xem lưới dữ liệu ReUI (TanStack Table + Virtual) có chịu được
5.000 dòng × 20 cột, sửa trên ô và dán 500 ô từ Excel mà không giật không. Kiến trúc §8 đặt luật: thử ReUI trước, không
đạt thì đổi sang lưới vẽ canvas (Glide Data Grid). Kết luận ghi thành ADR; mã thử ở nhánh thử, không vào main (luật 5).

Source input: hàng 1 của `docs/plan/lo-trinh.json` · ô cơ hội `_acceptance/bai-thu-luoi-5000-dong/opportunity.md` (ký `build`).

## Criteria

- AC-1: Given nhánh thử ở sha ghim trong `thu/nhanh-thu.json`, When mở `/spikes/luoi`, Then trang dựng lưới ReUI
  `data-grid` cuộn ảo với đúng 5.000 dòng × 20 cột dữ liệu sinh mang nhãn mẫu (`MAU-…`), chọn ô, sửa trên ô và dán từ
  clipboard bằng chính thành phần đã cài.
- AC-2: Given trang thử, Chrome khổ 1366×768, CPU giảm tốc 4×, When cuộn từ dòng 1 tới dòng 5.000 trong khoảng 8 giây,
  Then trung vị ba lượt: p95 khoảng cách khung hình ≤ 33,4 ms và tỉ lệ khung > 50 ms ≤ 1%.
- AC-3: Given cùng cấu hình, When mở một ô và gõ 30 ký tự, Then trung vị ba lượt của p95 từ `event.timeStamp` của phím
  xuống tới khung hình kế ≤ 50 ms, và ô mang đúng chuỗi đã gõ.
- AC-4: Given cùng cấu hình, When dán 25 × 20 ô (TSV, như chép từ Excel) bằng Ctrl/Cmd+V vào một ô, Then trung vị ba lượt
  từ `event.timeStamp` của phím tới khung hình đầu tiên mà mọi ô dán đang hiện trong khung nhìn mang giá trị mới
  ≤ 1.000 ms, và các ô mẫu (góc đầu, giữa, góc cuối — góc cuối kiểm sau khi cuộn tới) đúng giá trị.
- AC-5: Given trang ở chế độ `?cham=1` (việc bận 60 ms mỗi khung hình, 1.200 ms mỗi lô ghi), When chạy cùng máy đo, Then
  cả ba thước trượt; và ở chế độ `?cham=phim` (việc bận 80 ms trong hàm nghe phím chạy trước lưới) thì thước gõ trượt —
  máy đo phân biệt được lưới mượt với lưới giật, và mốc đầu của thước gõ đặt đúng chỗ.
- AC-6: Given main có hồ sơ này, When chạy `node _acceptance/bai-thu-luoi-5000-dong/thu/do-lai.mjs`, Then lệnh dựng lại
  nhánh thử từ tag ghim trong `thu/nhanh-thu.json` (tag không tới được → thoát 2 gọi tên tag), mỗi lượt đo kèm hiệu
  chuẩn máy (trang rỗng p95 ≤ 17,5 ms và bài đo JS cố định ≤ 1,2× mốc; lượt không hợp lệ đo lại, tối đa ba lần), đo
  từng lưới đã có trên nhánh thử ở bản thường và bản chậm, in JSON, thoát 0 khi bản chậm trượt **và** (ReUI đạt, hoặc
  ReUI trượt và Glide đã đo); hàm so ngưỡng `thu/nguong.mjs` có test hai chiều (số đạt → đạt, số trượt → trượt kèm tên
  thước).
- AC-7: Given số đo, When người duyệt đọc `docs/adr/0004-luoi-bang-hang.md`, Then ADR nêu số đo ba lượt, cấu hình máy đo,
  sha nhánh thử, lựa chọn theo đúng luật của Kiến trúc §8, hệ quả cho hàng dựng bảng hàng (cờ kiểu chặt) và giới hạn của
  phép đo. (judgment)
- AC-9: Given ReUI trượt ít nhất một thước, When dựng Glide Data Grid trên nhánh thử ở cùng trang, cùng dữ liệu, Then
  cùng máy đo cho số của Glide ở ba thước và ADR ghi cả hai lưới; ReUI đạt cả ba thì AC này ghi «không áp — ReUI đạt»
  trong JSON (`glide: null`) và không dựng Glide.
- AC-8: Given PR vào main, When so diff với nhánh chính, Then không tệp nào dưới `apps/web/**` hay `package-lock.json` đổi
  — mã thử ở lại nhánh thử.

## Coverage

Quét bằng morphological-scan (preset test-matrix, rút gọn), hai trục:

- Trục A — thao tác của người làm bảng hàng: cuộn · gõ sửa ô · dán khối từ Excel [thước CE: ngưỡng của ô cơ hội và
  Kiến trúc §9 bước 1 (a) — đúng ba thao tác này]
- Trục B — kiểu bằng chứng: có trang đúng cỡ dữ liệu · số đo đạt · đối chứng đỏ · lặp lại được · quyết định ghi lại
  [thước CE: luật MEASURE-BIRTH của kit và luật 5 của đợt]
- Core: dữ liệu đúng cỡ (AC-1), cuộn (AC-2), gõ (AC-3), dán (AC-4), đối chứng đỏ (AC-5), lặp lại (AC-6), ADR (AC-7),
  main sạch mã thử (AC-8).
- Glide Data Grid: có điều kiện (AC-9) — chỉ đo khi ReUI trượt, theo luật của Kiến trúc §8.
- Later: đo trên máy văn phòng thật trong hai tuần thử.
- Never: đo trên điện thoại — bảng hàng điện thoại là dạng thẻ (Tham chiếu §9), không dùng lưới.

## Đường đo

- Thước: cuộn không tụt khung hình · số từ: `window.__do.khung` của trang thử qua `thu/do.mjs` · bảo đảm bởi: AC-2
- Thước: gõ không trễ · số từ: mốc phím → khung kế trong `window.__do` · bảo đảm bởi: AC-3
- Thước: dán 500 ô dưới 1 giây · số từ: mốc phím dán → khung có ô cuối mới · bảo đảm bởi: AC-4
- Thước: kết luận ghi thành ADR · số từ: `docs/adr/0004-luoi-bang-hang.md` · bảo đảm bởi: AC-7

## Ngưỡng cần ký (Hỏi-1)

Máy dịch câu «không tụt khung hình thấy được» thành số; các số này quyết luôn lưới cho bảng hàng nên chủ kho ký:

- Máy văn phòng mô phỏng: Chrome khổ 1366×768, giảm tốc CPU **4×** (lối khác: 6× — máy yếu hơn).
- Cuộn: p95 khoảng cách khung hình **≤ 33,4 ms** (30 khung/giây) và khung > 50 ms **≤ 1%** (lối khác: ≤ 16,7 ms —
  60 khung/giây, khắt khe, gần như chắc chắn đẩy sang lưới canvas).
- Gõ: p95 **≤ 50 ms**. Dán 500 ô: **≤ 1.000 ms** (đã có trong ô cơ hội).

## Out of scope

- Dựng bảng hàng thật (hàng 14–16) và khối Pro `data-grid-editing-6`.
- Lọc, nhóm, sắp xếp, ghim cột — bài thử chỉ đo ba thao tác của ngưỡng.
- Dữ liệu thật hay nạp từ máy chủ — dữ liệu sinh trong trình duyệt.
- Đo Glide Data Grid khi ReUI đã đạt (AC-9 ghi «không áp»).
- Đưa trang thử, `playwright-core` hay cờ kiểu vào main.

## Notes

- Máy văn phòng mô phỏng bằng giảm tốc CPU 4× của DevTools; không mô phỏng GPU yếu.
