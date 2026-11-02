---
nhom: cuoc-goi
doi_tuong: [lead, can, lan-rao]
khuon: { ten: KhungCuocGoi, nhap: "@/app/(app)/units/call/khung" }
nhan_dien: ["apps/web/src/app/(app)/proto/cuoc-goi-khai-thac/page.tsx", "apps/web/src/app/(app)/units/call/page.tsx", "apps/web/src/app/(app)/units/call/dial/page.tsx"]
mau_dang_chay: { tep: "apps/web/src/app/(app)/proto/cuoc-goi-khai-thac/page.tsx", duong: "/proto/cuoc-goi-khai-thac", trang_thai: [mac-dinh] }
khe_bat_buoc: [children]
cam_ngoai_khuon: [Card, Placeholder]
ngoai_le: []
luat: [KH-cg-mot-khung, KH-cg-tren-may, KH-cg-phim, KH-cg-khong-nguon]
bo_cuc: ho-so
ngoai_le_han: [{ tep: "apps/web/src/app/(app)/units/call/page.tsx", han: goi-ep-gia-dot-hai, ly_do: "Chế độ cuộc gọi chuyển sang bố cục ở hàng 29: Cổng Phạm vi hàng 28 (02/11) duyệt ba cột trong một Frame trước khi hệ bố cục gộp; bố cục Hồ sơ một cột — chọn lại cách xếp ba vùng ở hàng 29." }, { tep: "apps/web/src/app/(app)/proto/cuoc-goi-khai-thac/page.tsx", han: goi-ep-gia-dot-hai, ly_do: "Trang ba lối của hàng 28, chuyển hay gỡ cùng màn thật ở hàng 29." }, { tep: "apps/web/src/app/(app)/units/call/dial/page.tsx", han: goi-ep-gia-dot-hai, ly_do: "Trang quay số (hàng 30) dùng chung KhungCuocGoi — chuyển bố cục cùng màn chế độ cuộc gọi ở hàng 29." }]
---
# Chế độ cuộc gọi

Màn đầu chủ dùng trong lúc nói chuyện với chủ nhà (hàng 28, Tham chiếu §10 KD1): thẻ lead, danh sách hỏi bằng phím,
tính giá bao phí ↔ về tay, so giá với toà. Khối đích: ghép (dòng «Chỗ hở» Chế độ cuộc gọi, `docs/design/vo-va-ia.md` §3);
lối dựng chốt ở Cổng Phạm vi hàng 28 qua trang ba lối (ADR-0019). Trang ba lối `proto/cuoc-goi-khai-thac` đi cùng khuôn,
gỡ khi màn thật qua Cổng Bằng chứng; màn thật `/units/call?lead=<mã>` (`units/call/page.tsx`) đã ở `nhan_dien`.

**Dùng khi** màn ghi những gì nghe được trong một cuộc gọi về một lead hay một căn — khai thác (28), ép giá đợt hai (29),
quay số (30). **Không dùng** cho hồ sơ căn (nhóm `ho-so-can`), Hôm nay (nhóm `hom-nay-dau-chu`) hay bản điện thoại K1–K4.

## Luật

- **KH-cg-mot-khung** — Màn là đúng một `Frame` (qua `KhungCuocGoi`); mỗi vùng là một `FramePanel`; không `Card`, không
  `Placeholder`, không lồng Frame.
- **KH-cg-tren-may** — Hồ sơ căn đọc và ghi qua bộ đồng bộ trên máy (hàng 13): mỗi lựa chọn là một sự kiện, mất mạng vẫn
  ghi; mức đủ tính bằng `completeness` của lõi trên bản trên máy. Lead đọc thẳng API.
- **KH-cg-phim** — Danh sách hỏi đi được bằng phím (Tab nhóm, số chọn, Delete xoá, Ctrl+Enter xong); phím số không bắt khi
  con trỏ ở ô chữ.
- **KH-cg-khong-nguon** — Màn không hiện số chủ nhà, giá đáy, ảnh sổ (bất biến 2); giá đáy của hàng 29 đi qua lớp nguồn
  của lõi, không qua màn.
