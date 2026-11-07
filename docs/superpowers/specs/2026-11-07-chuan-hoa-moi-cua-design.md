# Chuẩn hoá mọi cửa — từ điển của sàn (hàng 70) — thiết kế

Hàng lộ trình 70 `chuan-hoa-moi-cua` (dãy B, đợt dau-khach-nhap). Cổng Đáng: build (chủ kho 05/11). Gốc: ADR-0011 quyết
định 12, `docs/architecture/nhap-du-lieu.md` §12 «Vòng học của sàn», ND7 «cùng một giá trị lạ, lần hai không hỏi lại».

## Vấn đề

Đầu chủ gõ «dong nam», «bp», «Đang gd». Lõi đã có từ điển dựng sẵn (`STATUS_ALIASES`, `FEE_ALIASES`, `readDirection`) và
chỗ cho từ điển của sàn (`ImportContext.companyAliases`, `lookupAlias`) — nhưng chưa có bảng lưu, chưa có ai nạp nó khi
chạy, chưa có gợi ý «Ý bạn là…» cho chữ gần đúng, chưa có đề xuất, chưa có màn duyệt, chưa có sức khoẻ dữ liệu. Lựa chọn
của người ở bước xem trước nhập chỉ nhớ theo cột của mẫu file (hàng 67), không thành từ điển chung của sàn.

## Phạm vi

Ba trường tập đóng đã có từ điển ở lõi: **trạng thái** (`standardStatus`), **điều kiện phí** (`feeInclusion`), **hướng**
(`directionFaces`). Cửa vào trong hàng này: **bước xem trước của nhập file** — chỗ duy nhất hôm nay chữ tự do đổ vào ba
trường ấy (sửa trên ô chọn bằng nút, không gõ) (**Hỏi-2**).

1. **Gợi ý ở lõi** — `goiYGiaTri(field, raw, companyAliases)`: chữ gập (`fold`) khớp từ điển của sàn → từ điển dựng sẵn →
   giá trị chuẩn → trả «khớp»; không khớp thì tìm giá trị chuẩn và cách gõ đã biết có khoảng cách chữ (Levenshtein trên
   chữ gập) ≤ 2 và ≤ 1/3 độ dài, tối đa 3 gợi ý xếp theo khoảng cách. Thuần, tất định, không gọi dịch vụ ngoài. Chữ có số
   điện thoại, email, số giấy tờ không gợi ý, không đề xuất.
2. **Bảng `company_value_aliases`** (migration 051): một dòng mỗi (sàn, trường, chữ gập): chữ nguyên văn ≤ 40, giá trị
   chuẩn, trạng thái `proposed` · `approved` · `rejected`, số lần người chọn, ai đề xuất lần đầu, ai quyết, khi nào. Luật
   theo dòng theo sàn; trường chỉ ba trường trên (không trường lớp `source`); nhật ký chỉ thêm `company_value_alias_events`
   mỗi lần đề xuất, duyệt, bỏ.
3. **Đề xuất**: ở bước xem trước, ô «cần người» của ba trường hiện «Ý bạn là "Đông Nam"?» (tối đa ba nút). Bấm gợi ý = sửa ô
   như gõ tay (đường `suaO` sẵn có) **và** gửi một đề xuất (chữ gốc của ô → giá trị chuẩn). Cùng chữ gập đề xuất lại thì
   tăng số lần chọn, không thêm dòng; dòng đã duyệt hay đã bỏ không đổi trạng thái. Ai nhập file được thì đề xuất được
   (**Hỏi-3**).
4. **Duyệt**: Cài đặt › Sàn › mục mới **«Từ điển»** (khuôn `cai-dat-san`, `MucCaiDat` như Mẫu nhập): mỗi trường một nhóm,
   mỗi dòng chữ gốc → giá trị chuẩn · số lần chọn · nút «Duyệt» / «Bỏ». Chỉ quản trị sàn. Đề xuất chưa duyệt không đổi cách
   chuẩn hoá của ai.
5. **Dùng**: cách gõ đã duyệt vào `companyAliases` ở cả hai nơi chạy chuẩn hoá — bước xem trước trên trình duyệt và đường
   ghi lần nhập trên máy chủ. Từ lần sau, chữ ấy chuẩn hoá thẳng, không hỏi (ND7). Duyệt không đổi dữ liệu đã lưu của căn
   nào (dữ liệu chỉ đổi qua sự kiện có người — §12).
6. **Sức khoẻ dữ liệu** (đầu màn Từ điển): mỗi trường — số cách gõ lạ đã gặp (mọi dòng), đã neo (đã duyệt), chờ duyệt, đã
   bỏ, tổng số lần người chọn. «Ô lạ» = cách gõ lạ người đã chọn gợi ý; chữ lạ chưa ai chọn không được ghi (**Hỏi-1**).

## Ngoài phạm vi

- Ô nhận lead, sửa hàng loạt, API cho công cụ của sàn — cửa vào sau (Hỏi-2).
- «Tự nhận khi ba người cùng chọn» — Tham chiếu: mặc định tắt; để sau.
- Dọn từ điển định kỳ bằng AI (ND8) — hàng riêng.
- Nội thất, pháp lý, tình trạng sử dụng — chưa có tập giá trị chuẩn ở lõi.
- Một chạm mở Bảng hàng lọc căn lạ: ba trường này không lưu được giá trị ngoài chuẩn (lõi kiểm khi ghi), nên không có căn
  lạ để lọc.

## Đối chiếu ngành

| Năng lực | RESO | Follow Up Boss | KW Command | Ta làm | Ta cứng — họ cấu hình? |
|---|---|---|---|---|---|
| Ánh xạ chữ lạ về giá trị chuẩn | Lookup chuẩn; MLS tự giữ bảng ánh xạ — chưa kiểm cách làm | Nhập CSV ghép cột; ánh xạ giá trị: chưa kiểm | chưa kiểm | Từ điển của sàn, người chọn → quản trị duyệt | Không: từ điển là dữ liệu của sàn |

## Đặc tả UX

Màn «Từ điển» đi khuôn `cai-dat-san` sẵn có (như Mẫu nhập, hàng 50): `MucCaiDat` một khối mỗi trường, dòng `SettingField`,
nút nhỏ «Duyệt»/«Bỏ» cuối dòng; đầu màn một hàng số sức khoẻ. Trạng thái: đang tải · lỗi đọc · trống («Chưa có cách gõ
lạ nào — chọn gợi ý ở bước xem trước khi nhập file sẽ hiện ở đây») · có dòng · lỗi lưu. Bước xem trước: dưới ô đang sửa
một dòng «Ý bạn là:» kèm tối đa ba nút giá trị chuẩn. Không màn, vùng hay khối mới ngoài khuôn đã có.
