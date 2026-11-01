---
slug: lead-bon-nac
at: 2026-11-01T01:10:00Z
route: http://localhost:3483/proto/lead-bon-nac/reui
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (ghim — trang ba lối ba-loi/index.html gửi kèm thẻ Cổng Phạm vi; bản chạy mở được ở cổng 3483 của dãy L khi đăng nhập người mẫu Telesales)
options: _acceptance/lead-bon-nac/ba-loi/index.html
divergence: opened
ds_skill: quy-hang-ui
states: [mac-dinh, trong, dang-tai, loi, so-sai, da-gui-lai]
breakpoints: [desktop-1440, mobile-375]
themes: [light]
patched: 5
deferred: 2
---
# design-pass — lead-bon-nac

Màn đầu của nhóm mới `lead-cua-toi` nên bước phân kỳ phải mở (ADR-0019 quyết định 2). Ba lối có tên cố định, mỗi lối
một trang bản mẫu trong vỏ thật (`/proto/lead-bon-nac/{trong-kho,reui,ve-moi}`, chỉ máy dev, không lối vào trong điều
hướng), cùng một bộ dữ liệu mẫu và cùng khuôn tạm `KhungLeadCuaToi`:

- **Trong kho** — khuôn Frame của `KhungLead` (hàng 24) + `Item` viền + `Badge` -light; không cài gì mới.
- **ReUI** — khối đích `list-11` (vo-va-ia §2) đã cài và chuyển thể tại chỗ dùng; ứng viên thứ hai `chart-39` chỉ xem ảnh.
- **Vẽ mới** — ghép bậc 6: bốn cột theo nấc trên máy tính, xếp chồng trên điện thoại; dải «Cần bạn làm» cho lead bị trả lại.

**Lối máy khuyên: ReUI (`list-11`)** — khối đích đứng được sau chuyển thể: đặc nhất (tám lead một màn 1440), cột Nấc
thẳng hàng để quét, co về hai cột ở điện thoại và vừa cột phải hẹp cạnh Ô nhận lead; cài xong thành khối «trong kho».
Lời khuyên ghim ở đầu `ba-loi/index.html`.

Dữ liệu mẫu (`proto/lead-bon-nac/_chung/du-lieu-mau.ts`), mới nhất trước: chờ chia (chưa có người), đã nhận, đã gọi
(gửi lại từ L-02), lên bảng (chỉ biết toà, «3,2 tỷ, đã bao phí»), tin bổ sung cho hàng đang mở (căn trùng, không bốn
nấc), bị trả lại «Số không liên lạc được» kèm ô số mới + «Sửa số và gửi lại», đã gửi lại (trỏ L-06), lên bảng. Tên
«[Mẫu] Đầu chủ 1/2», số gõ thử `0900 000 0xx`; không số chủ, mã hàng hay trường nào của hàng trên màn.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| mac-dinh · Trong kho | desktop-1440 | light | ba-loi/trong-kho-1440.png |
| mac-dinh · Trong kho | mobile-375 | light | ba-loi/trong-kho-375.png |
| mac-dinh · ReUI | desktop-1440 | light | ba-loi/reui-1440.png |
| mac-dinh · ReUI | mobile-375 | light | ba-loi/reui-375.png |
| mac-dinh · Vẽ mới | desktop-1440 | light | ba-loi/ve-moi-1440.png |
| mac-dinh · Vẽ mới | mobile-375 | light | ba-loi/ve-moi-375.png |
| trong · Trong kho / ReUI / Vẽ mới | mobile-375 | light | ba-loi/trang-thai/{trong-kho,reui,ve-moi}--trong-375.png |
| dang-tai · Trong kho / ReUI / Vẽ mới | mobile-375 | light | ba-loi/trang-thai/{trong-kho,reui,ve-moi}--dang-tai-375.png |
| loi · Trong kho / ReUI / Vẽ mới | mobile-375 | light | ba-loi/trang-thai/{trong-kho,reui,ve-moi}--loi-375.png |
| so-sai · ReUI | desktop-1440 | light | ba-loi/trang-thai/reui--so-sai-1440.png |
| da-gui-lai · ReUI | desktop-1440 | light | ba-loi/trang-thai/reui--da-gui-lai-1440.png |

Ảnh là phác của bộ phương án (`options:`), không phải bằng chứng — không chép vào `evidence/`. Ba trạng thái vùng mở
bằng `?vung=trong|dang-tai|loi` hay dải «Bản mẫu · trạng thái vùng» trên đầu trang.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- ReUI ở 375: bảng ba cột tràn ngang, Badge và nút «Sửa số và gửi lại» bị cắt → khung hẹp ẩn cột thứ ba (truy vấn
  khung `@md` của chính khối), giờ và đầu chủ xuống dưới tên; ô tên cho xuống dòng.
- Trong kho: dòng `Item` có vạch chia cao gần gấp đôi chữ → dùng biến thể `outline` của `Item`, bỏ vạch chia.
- Ô số mới: chữ gợi ý bị cắt ở khổ máy tính → rút chữ gợi ý, ô rộng cố định ở khổ ≥ sm.
- Dải đổi trạng thái của bản mẫu bị nút công cụ dev của Next che ở góc dưới → chuyển lên đầu trang.
- Trong kho: nút «+ Lead» ở đầu khung còn hiện khi đang tải và khi lỗi, khác hai lối kia → chỉ hiện khi có dữ liệu.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Lead bị trả lại là việc duy nhất telesales phải làm trên vùng này, nhưng ở lối khuyên nó nằm theo thời gian giữa các
  dòng khác. Lối Vẽ mới nổi nó lên dải «Cần bạn làm» — người duyệt quyết có mang ý đó vào lối ReUI (một dòng ghim đầu
  bảng) hay giữ thứ tự thời gian.
- Lối ReUI đưa `ui/table` vào kho cạnh `reui/data-grid`: cần một câu trong bản đồ khuôn nói khi nào dùng bảng nhỏ trong
  Frame, khi nào dùng lưới — viết khi khuôn thật thay khuôn tạm.

## Ghi chú vận hành

- Bản đồ khuôn: nhóm mới `design/patterns/lead-cua-toi.md` với khuôn tạm `KhungLeadCuaToi`
  (`proto/lead-bon-nac/_chung/khung.tsx`) và màn mẫu là trang của lối khuyên; ba trang mẫu khai ngoại lệ có lý do ở
  `trang-tam.md` (như trang mẫu hàng 24). Duyệt lối xong thì khuôn thật thay khuôn tạm và màn thật vào `nhan_dien`.
- Đã cài `@reui/list-11` (khoá ReUI có sẵn ở máy): giữ `components/ui/table.tsx` (thêm dòng catalog); thư mục
  `components/blocks/list-11` và logo mẫu `components/ui/svgs/` gỡ sau khi chuyển thể vào chỗ dùng. Dòng «Khối đã chuyển
  thể» của catalog viết khi lối được duyệt và màn thật dùng khối.
