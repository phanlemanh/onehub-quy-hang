---
slug: cuoc-goi-khai-thac
at: 2026-11-02T05:40:00Z
route: http://localhost:3485/proto/cuoc-goi-khai-thac
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (ghim — trang ba lối ba-loi/index.html gửi kèm thẻ Cổng Phạm vi; bản chạy mở được ở cổng 3485 của dãy D khi đăng nhập dau-chu-1, ?loi=trong-kho|reui|ve-moi)
options: _acceptance/cuoc-goi-khai-thac/ba-loi/index.html
divergence: opened — ADR-0019, màn đầu của nhóm mới cuoc-goi; khuyên ve-moi (ba cột theo KD1)
ds_skill: quy-hang-ui
states: [mac-dinh]
breakpoints: [desktop-1440, mobile-375]
themes: [dark]
patched: 0
deferred: 1
---
# design-pass — cuoc-goi-khai-thac

Màn đầu của nhóm mới `cuoc-goi` nên bước phân kỳ mở (ADR-0019 quyết định 2). Ba lối tên cố định, cùng một lead mẫu
(`proto/cuoc-goi-khai-thac/mau.ts`, nhãn mẫu, không số) và bốn khối dùng chung (`khoi.tsx`) — chỉ cách xếp khác nhau:

- **Trong kho** — dáng hồ sơ căn toàn màn (`KhungHoSoCan`): một cột hẹp, bốn khối nối nhau.
- **ReUI** — `solution-crm-4` dáng bản ghi: đầu bản ghi trải ngang, cột chính danh sách hỏi, cột phụ tính giá và so giá.
- **Vẽ mới** — ghép ba cột theo bản phác KD1: thẻ lead · danh sách hỏi · tính giá và so giá toà.

**Lối máy khuyên: Vẽ mới** — lời khuyên ghim đầu `ba-loi/index.html`.

## Ma trận capture

| lối | state | breakpoint | file |
|---|---|---|---|
| trong-kho | mac-dinh | desktop-1440 | ba-loi/trong-kho-1440.png |
| trong-kho | mac-dinh | mobile-375 | ba-loi/trong-kho-375.png |
| reui | mac-dinh | desktop-1440 | ba-loi/reui-1440.png |
| reui | mac-dinh | mobile-375 | ba-loi/reui-375.png |
| ve-moi | mac-dinh | desktop-1440 | ba-loi/ve-moi-1440.png |
| ve-moi | mac-dinh | mobile-375 | ba-loi/ve-moi-375.png |

Trang so ba lối: `ba-loi/index.html` (dựng bằng `doi-chieu.mjs --dung-ba-loi`). Chụp bằng
`_acceptance/cuoc-goi-khai-thac/thu/chup-ba-loi.mjs` trên máy dev dãy D.

## Findings

- Vẽ mới ở 1440: ba vùng cùng hiện, không cuộn; bảng so giá bảy dòng vừa cột phải.
- ReUI ở 1440: đầu bản ghi chiếm ~40% chiều cao, nhóm Tình trạng sử dụng chạm đáy màn, so giá toà dưới nếp gấp.
- Trong kho ở 1440: máy tính giá và so giá phải cuộn hơn một màn.
- Cả ba ở 375 xếp một cột — bản điện thoại là K1–K4 (dự phòng), không chấm ở vòng này.
- Hoãn 1 — ReUI có thành phần `questionnaire` (ví dụ `c-questionnaire-3`, chưa cài) cho ô danh sách hỏi: S3 đi thang
  dùng lại, thử thành phần này trước `ToggleGroup` + `Kbd` ghép; không đứng được thì giữ ghép và ghi lý do ở dòng Chỗ hở.
- Chụp ở nền tối (trình duyệt không đầu theo hệ thống); ba lối dùng cùng token, không mã màu thô.
