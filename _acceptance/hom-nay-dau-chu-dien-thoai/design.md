# Hôm nay của đầu chủ trên điện thoại — thiết kế

Hàng 39 (dãy H, đợt `dau-khach-nhap`), T2. Ô cơ hội: `opportunity.md` (chủ kho chọn làm 02/11). Đứng trên hàng 22 (hàng
đợi, nút một chạm), 38 (tab Tôi, vỏ điện thoại) và 92 (dựng lại Hôm nay máy tính theo `solution-agents-2`). Sổ lựa chọn:
`decisions.jsonl`.

## 1. Cái đã có, cái còn thiếu

- `/today` dựng `HomNayDauChu` (`today/hom-nay-dau-chu.tsx`): lưới `DataGrid` nhóm theo bộ nhóm của sàn, bốn cột Việc ·
  Vì sao hôm nay · Giá · Hành động; đúng một nút là việc đầu của nhóm, việc còn lại trong ⋯ (`today/viec-dong.ts`).
- Dưới 72rem lưới gập thành một cột (hàng 22 AC-10 «375 một cột, không tràn ngang»). Chưa có bản điện thoại riêng.
- Gọi: dòng lead có «Mở số» → nút đổi thành `tel:` (`today/mo-so.ts`). Dòng căn không có lối gọi chủ nhà ở Hôm nay; «Ghi
  cuộc gọi» mở chế độ cuộc gọi của máy tính (`units/call`, phím H · G · B · K).
- Tham chiếu: «Điện thoại của đầu chủ chỉ là bản mang theo: báo lead, kết quả gọi một chạm, đổi giá nhanh, ảnh. Màn cuộc
  gọi trên máy tính (KD1, KD2) là bản chính; bốn màn cuộc gọi trên điện thoại (K1–K4) lùi thành dự phòng» (§ dòng 41;
  bảng màn dòng 259: K1–K4 là P2). Luật 32: điện thoại giữ căn của mình, số chủ chỉ của căn mình giữ.
- Khối đích (`docs/design/vo-va-ia.md` §2, dòng M1 · 39): Tràn thành thẻ, `solution-agents-2` dạng dòng hai tầng; cùng
  nhóm và cùng nút với bản máy tính; dòng trên tên căn, dòng dưới lý do · giá (màu hạn như máy tính); một nút cố định ở
  mép phải; ⋯ mở ngăn đáy qua `NganNoi`; khoảng tám việc mỗi màn.

## 2. Luồng

1. Đầu chủ mở app trên điện thoại (dưới 768 px), vào Hôm nay. Vùng đầu chủ dựng **danh sách thẻ** thay cho lưới: cùng
   nhóm, cùng thứ tự, cùng nguồn dữ liệu (kho trên máy cho căn, API cho lead).
2. Mỗi thẻ hai tầng: trên tên căn (hay lead), dưới lý do · giá; hạn đỏ khi quá, vàng khi còn dưới 15 phút (`mucHan`).
   Mép phải một nút; cạnh nó nút ⋯ mở ngăn đáy.
3. **Gọi một chạm.** Dòng có số gọi được (lead của mình; căn mình giữ có số chủ) mang lệnh «Gọi». Một chạm làm hai việc
   theo thứ tự: gọi máy chủ mở số, rồi mở `tel:`. Như máy tính, mỗi dòng mở số một lần trong phiên trang; chạm lại cùng dòng dùng
   lại số đã mở. Cùng chạm ấy mở ngăn đáy «Kết quả cuộc gọi» và nhớ trên máy theo dòng — ngăn còn đó khi đầu chủ quay
   lại app, kể cả khi trang đã tải lại (Hỏi-1, khuyến nghị).
4. **Ghi kết quả bằng một tay.** Ngăn đáy nằm nửa dưới màn, nút kín bề ngang, cao từ 48 px:
   - các việc một chạm của nhóm, như máy tính: lead → «Đã gọi» (rồi «Trả lại» nếu nhóm cho); căn → «Còn · giữ giá»;
   - «Đổi giá, trạng thái · Mở hồ sơ» mở hồ sơ căn trên điện thoại (hàng 33) để hạ giá hay đổi trạng thái;
   - «Không nghe máy» đóng ngăn, không ghi gì (như phím K của máy tính).
5. Việc khác của dòng nằm trong ⋯ (ngăn đáy `NganNoi`), cùng bộ việc với máy tính.
6. Mất mạng: thẻ vẫn hiện từ máy; «Gọi» tắt kèm lời «Cần mạng để mở số»; «Còn · giữ giá» ghi trên máy rồi gửi sau như
   máy tính; việc lead (Nhận, Đã gọi, Trả lại) cần mạng như hiện có.

## 3. Phạm vi mã

- `apps/web/src/app/(app)/today/mobile/**` — mới: danh sách thẻ, thẻ, ngăn kết quả, hàm gọi một chạm và bài kiểm.
- `apps/web/src/app/(app)/today/hom-nay-dau-chu.tsx` — chỉ thêm chỗ rẽ: dưới 768 px dựng bản điện thoại (khai thêm vùng ở
  Cổng Phạm vi).
- `design/patterns/hom-nay-dau-chu.md` — thêm luật của bản điện thoại; bỏ «bản điện thoại (hàng 39)» khỏi «Không dùng».
- Không đổi API, lõi, cơ sở dữ liệu. Số chủ của căn đi qua lối mở số sẵn có của máy chủ (một sự kiện mỗi lần).

## 4. Lựa chọn máy đã quyết

Mỗi lựa chọn một dòng sổ S1 có căn cứ. Câu chỉ người biết (Hỏi-1): ngăn kết quả mở ngay khi chạm «Gọi» và giữ qua lần
tải lại (khuyến nghị), hay chỉ mở khi trang hiện lại sau cuộc gọi. Nút mép phải trên điện thoại là «Gọi» cho dòng mà việc là gọi (lead chưa gọi,
nhóm nên gọi điều chỉnh giá, cần gọi lại) khi có số; dòng khác giữ nút máy tính — suy từ câu giao, giám sát trả H-23.

## 5. Đối chiếu ngành

- RESO: `ListAgentKey` (đầu chủ), `OwnerPhone` lớp nguồn — không ra khỏi sàn; gọi chỉ mở số cho người giữ căn.
- Follow Up Boss (app di động): danh sách việc hôm nay, chạm gọi rồi hiện hộp ghi kết quả cuộc gọi; kvCORE: «Smart
  Campaigns» trên điện thoại ghi kết quả bằng nút lớn sau cuộc gọi.

## 6. Đặc tả UX

<!-- ux-spec:start -->
- **Khuôn IA**: Tràn thành thẻ (ADR-0024 §bản điện thoại), dòng hai tầng `solution-agents-2`, ngăn đáy `NganNoi` cho ⋯ và
  kết quả cuộc gọi — theo khối đích đã ký ở `vo-va-ia.md` §2.
- **Trạng thái**: đang tải (khung chờ hai tầng) · trống (một hành động) · lỗi (Thử lại) · mất mạng (dải đầu màn, «Gọi» tắt)
  · đang gọi máy chủ mở số (nút bận).
- **Khổ**: điện thoại dưới 768 px; 375×812 thấy khoảng tám thẻ; máy tính giữ nguyên lưới.
- **Một tay**: mọi nút thao tác của luồng gọi nằm ở nửa dưới màn hay mép phải thẻ, vùng chạm từ 44 px.
- **Thẻ việc**: đầu chủ cầm điện thoại một tay, gọi lại việc đầu tiên của hôm nay và ghi kết quả mà không cần tay kia.
<!-- ux-spec:end -->
