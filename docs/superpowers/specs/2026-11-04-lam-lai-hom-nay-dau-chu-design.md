# Thiết kế — lam-lai-hom-nay-dau-chu (hàng 92)

Hàng 92 (dãy D, đợt `dau-khach-nhap`, chuyển từ H ngày 04/11). Gốc: quyết định 14A của chủ kho 02/11 (PR #88,
`docs/design/vo-va-ia.md` §2 dòng «Hôm nay, đầu chủ» và đoạn «Chọn lại bằng khoá Pro»): bản hàng 22 rối nút và lý do khó
đọc; khối đích đổi sang `solution-agents-2` cộng ô hạn của `data-grid-base-5`. Đứng trên 22 (hàng đợi, luật mỗi căn một
hàng đợi, ghi kết quả) và 91 (hệ bố cục). T2 — chỉ giao diện; hàng 39 (điện thoại) đứng sau.

## Hiện trạng (04/11)

`apps/web/src/app/(app)/today/hom-nay-dau-chu.tsx` (601 dòng): lưới `data-grid` gom nhóm theo bộ nhóm của sàn, năm cột
Việc · Lý do · Giá · Hạn · Hành động; mỗi dòng nhiều nút ngang hàng (gọi, còn giữ giá, mở hồ sơ, gắn mã; lead: gọi, nhận,
ghi gọi, trả lại, mở số). Dữ liệu và luật ở `nguon.ts`, `ly-do.ts`, `mo-nhom.ts`, `mo-lead.ts`, `mo-so.ts` (có test).

## Phương án

1. **Khung `solution-agents-2`**: nhóm thu gọn được, đầu nhóm có tên nhóm và số việc; dòng một việc; thứ tự nhóm theo bộ
   nhóm của sàn như hàng 22. Chuyển thể khối vào `apps/web/src/components/khoi/solution-agents-2/` theo thang dùng lại
   (`.claude/rules/giao-dien.md`): giữ khung bảng, đầu nhóm, ô dòng hai tầng, trình đơn ⋯; bỏ ô tìm, lọc «cần chú ý», nút
   mật độ, avatar, dữ liệu demo, sonner.
2. **Bốn cột**: Việc (dòng trên tên căn hay toà · căn của lead, dòng dưới loại việc) · **Vì sao hôm nay** hai tầng (dòng
   trên lý do chữ đậm từ `ly-do.ts`; dòng dưới hạn — ô hạn của `data-grid-base-5`) · Giá · Hành động.
3. **Ô hạn** (một hàm thuần `mucHan(hanIso, bayGio)` trả `qua` · `sap` · `thuong` · `khong`): đỏ (`destructive`) khi đã quá,
   vàng (`warning`) khi còn dưới 15 phút, thường khi còn từ 15 phút; không hạn thì không dòng hạn.
4. **Một nút một chạm** (ngưỡng đã ký ở ô cơ hội): hàm thuần `nutCuaViec(v)` trả `{ chinh, phu[] }`. Nút chính là việc đầu
   của nhóm — lead đã gửi «Nhận», lead đã nhận «Đã gọi», căn «Còn · giữ giá» (nhóm Thiếu thông tin chỉ có Mở hồ sơ nên nút chính là «Đổi giá, trạng thái · Mở hồ sơ») — một nút viền (`outline`) cùng bề rộng ở mọi
   dòng. Trình đơn ⋯ giữ mọi việc còn lại của hàng 22: Trả lại (có hỏi lại), Đổi giá, trạng thái, Mở hồ sơ, cùng Gọi, Gắn
   mã căn và Mở số — không việc nào mất. Nút chính làm việc ngay, không thêm hộp thoại.
5. **Giữ nguyên**: hàng đợi, luật mỗi căn một hàng đợi, ghi kết quả, đang tải · trống · lỗi · mất mạng của hàng 22; dải mất
   mạng tự tắt khi có mạng lại (bài học Ngoài-5 hàng 42).
6. **Dọn**: gỡ trang ba lối `proto/hom-nay-dau-chu` (luật đợt 45, lối đã chọn 02/11), cập nhật khuôn
   `design/patterns/hom-nay-dau-chu.md` (khối đích, `nhan_dien`), dòng catalog `@reui/solution-agents-2`, bảng đếm khuôn
   (luật 51).

## Đặc tả UX

<!-- ux-spec:begin -->
### Người · việc · khổ
Đầu chủ, máy tính 1440 × 900 (điện thoại là hàng 39).

### Khuôn IA đã chọn + căn cứ
Table-backed management, bố cục Tràn (vo-va-ia §2) — chủ kho chọn 14A trên trang so sánh 02/11.

### Thẻ việc
nhan_viec: làm việc đầu của mỗi căn hay lead trong hàng đợi hôm nay.

### Trạng thái × khổ
| Trạng thái | 1440 |
| --- | --- |
| Có việc | nhóm thu gọn được, bốn cột, một nút mỗi dòng |
| Hạn quá · sắp (< 15 phút) · thường | đỏ · vàng · thường |
| Đang tải · trống · lỗi · mất mạng | như hàng 22 |
<!-- ux-spec:end -->
