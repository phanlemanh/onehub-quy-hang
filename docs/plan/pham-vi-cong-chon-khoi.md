# Bản phạm vi — cổng chọn khối (01/11)

Nguồn: [ADR-0019](../adr/0019-cong-chon-khoi.md) (đề xuất 01/11 — chủ kho chốt hướng «A + C + B gộp») · hiện trạng:
[Cổng chọn khối — hiện trạng](../design/cong-chon-khoi-hien-trang.md). Trang tri thức của đợt:
`docs/tri-thuc/wiki/dot/cong-chon-khoi-0111.md`. Việc của người không nằm ở đây — xem «Ra khỏi kho» ở mô tả PR cắt lượt.

<!-- <<<PHAM-VI-MA -->
```
dot: cong-chon-khoi-0111
dang: chuoi
nguon: wiki/dot/cong-chon-khoi-0111.md#142b9ed8e16e67841d9536a7d4b43df2526e1513

- `CK1` — vòng chạm ô chưa có khuôn trình trang so ba lối (trong kho · ReUI · vẽ mới) cùng khổ, lời khuyên ghim trên trang, gửi kèm thẻ Cổng Phạm vi; màn đi khuôn sẵn thì không có trang ấy
- `CK2` — mỗi chỗ ghép hay tự viết ghi đã tra gì trên ReUI, vì sao không đứng, hạn xem lại; rơi bậc là một dòng quyết định của hồ sơ; thiếu thì bài kiểm đỏ
- `CK3` — bảng khối đã chuyển thể của danh mục giao diện thành chỗ tra «trong kho»: archetype, nhóm đang dùng, ảnh chuẩn, phiên bản ReUI, ngày và người duyệt; khối cài mà thiếu dòng thì bài kiểm đỏ
- `CK4` — trả bốn chỗ ghép tạm chờ khối Pro: đăng nhập, ô nhận lead, trống · lỗi · báo, người dùng
```
<!-- PHAM-VI-MA>>> -->

## Hàng

| Mã | Hàng | Câu giao (tóm) | Hạng | Đứng trên |
| --- | --- | --- | --- | --- |
| CK2, CK3 | 83 `vet-chon-khoi` | Mọi lựa chọn khối có một dòng máy đọc — khối đã chuyển thể ở danh mục, chỗ ghép ở «Chỗ hở» kèm điều đã tra và hạn xem lại; thiếu thì lint đỏ | T2 | 60 |
| CK1 | 84 `the-ba-loi` | Chủ sản phẩm duyệt Cổng Phạm vi của vòng chạm ô chưa có khuôn trên trang ba lối cùng khổ | T2 | 83 |

Mục chờ: **H16** (CK4) — mở lại khi hàng 83 ký: luật vẽ mới chấm bốn dòng tạm, mỗi dòng hết hạn thành một hàng theo màn.

## Chi tiết cho vòng mở sau

- **Hàng 83 trước 84.** Lối «Trong kho» của trang ba lối đọc ảnh chuẩn từ danh mục; lối «Vẽ mới» đọc điều đã tra từ «Chỗ
  hở». Không có 83 thì 84 không có nguồn cho hai trong ba cột.
- **CK3** gộp vào `catalog.md`, không sổ mới (ADR-0019 quyết định 4). Ảnh chuẩn: chụp ở 1440 và 375 theo cách của
  `doi-chieu.mjs --mau`. Điền ngược hai khối đã có (`app-shell-8`, `data-grid-editing-6`); người và ngày duyệt lấy từ hồ
  sơ đã ký của hàng 53 và 14.
- **CK2**: khuôn dòng «Chỗ hở» có ba ô máy đọc; điền ngược 13 dòng hiện có. Hạn xem lại là điều kiện («khi có khoá Pro»)
  hay ngày; bốn dòng tạm có hạn đã tới thì bài kiểm in cảnh báo có tên, không đỏ (để H16 mở thành hàng, không chặn lint).
- **CK1**: chế độ ba lối của `packages/ui-lint/doi-chieu.mjs` (kế hoạch, tên ảnh, ghép trang); luật «ô chưa có khuôn» và
  khoá `divergence: opened` ở `.claude/rules/giao-dien.md`, skill `quy-hang-ui` và `vo-va-ia.md` §2. Bài đỏ: vòng có màn
  đầu nhóm mới mà `design-pass.md` ghi `skipped`, hay trang ba lối thiếu một cột không kèm «không có».
- Không thêm cổng, không thêm lượt gọi người (ADR-0019 quyết định 1).
