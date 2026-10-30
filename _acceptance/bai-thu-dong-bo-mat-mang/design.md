# Thiết kế — bài thử đồng bộ khi mất mạng (hàng 2)

Ngày 30/10/2026 · dãy T · đợt nen-dau · hạng máy suy T2 (lộ trình ghi T3 — xem «Hạng»)

## Câu hỏi bài thử trả lời

Kiến trúc §9 bước 1 (b): chọn bộ đồng bộ (PowerSync, ElectricSQL hay tự làm mỏng) trước khi dựng phần «nhanh tức thì».
Ngưỡng sống (`opportunity.md`): hai sàn mẫu, ba vai — không dòng nào của sàn kia và không số chủ của đầu chủ khác xuống
máy; sau năm phút mất mạng mọi thay đổi lên máy chủ đúng thứ tự; ADR chọn bộ đồng bộ.

## Cách làm

Dựng **bộ tự làm mỏng** thật, đo nó trên Postgres thật với luật theo dòng, và so hai bộ có sẵn bằng kiến trúc đã công
bố của chúng. Lý do dựng bộ mỏng chứ không dựng PowerSync/Electric: cả hai đọc nhật ký sao chép của Postgres bằng vai
sao chép, nên **không đi qua luật theo dòng** — cách ly phải viết lại lần hai bằng ngôn ngữ luật riêng của từng bộ. Đó
chính là câu hỏi bất biến 1 đặt ra; bộ mỏng là lối duy nhất giữ cách ly ở một chỗ (cơ sở dữ liệu). Đo hai bộ kia bằng
container là việc lớn hơn bài thử một tuần — để ADR nêu là «chưa đo» kèm điều kiện đo.

Mã thử nằm trong `_acceptance/bai-thu-dong-bo-mat-mang/thu/` (luật đợt 5); bảng mẫu là một tệp SQL riêng áp lên
Postgres của dãy T (cổng 5547), không phải migration của kho.

| Phần | Làm gì |
| --- | --- |
| `schema.sql` | Schema `thu_dong_bo`: `listings` (căn, sàn, đầu chủ giữ, giá), `owner_contacts` (số chủ — lớp nguồn), `changes` (sổ thay đổi chỉ thêm, `seq` tăng dần), `applied_ops` (khoá chống trùng). Bật và ép luật theo dòng: `listings`, `changes` theo `app.current_company_id()`; `owner_contacts` thêm điều kiện đầu chủ giữ căn hoặc vai trưởng nhóm (`app.current_user_id()`, `app.current_role()`) |
| `may-chu.mjs` | `GET /keo?sau=<seq>` — kéo thay đổi sau một mốc, chạy bằng vai `quy_hang_app` với công ty, người, vai của phiên; `POST /day` — nhận một lô thao tác theo `client_seq`, áp từng cái trong giao dịch, bỏ qua `op_id` đã áp, trả danh sách đã nhận và bị từ chối; `GET /thu` — trang thử; `POST /ghi` — sự kiện của trang |
| `hang-doi.mjs` | Hàng đợi ghi phía máy (thuần, chạy cả trong trình duyệt và Node): thêm thao tác khi mất mạng, giữ thứ tự, đẩy theo lô khi có mạng, chỉ xoá khi máy chủ xác nhận |
| Trang `/thu` | Đăng nhập giả bằng mã người mẫu; bảng căn kéo về; nút đổi giá; trạng thái mạng; số thao tác chờ đẩy; lưu hàng đợi vào IndexedDB để tải lại trang không mất |
| `chay.mjs` | Một lệnh: áp `schema.sql` + dữ liệu mẫu lên Postgres dãy T, mở máy chủ, đường hầm (cloudflared — mạng công ty chặn, dùng điểm phát điện thoại), in bước |
| `tom-tat.mjs` | Đọc nhật ký máy chủ, tính kết luận từng vế theo luật viết trước, in bảng giữa hai mốc của `ket-qua.md` |

**Đường đi của số chủ**: số chủ KHÔNG đi qua sổ thay đổi. Sổ `changes` chỉ ghi thay đổi của `listings` (không cột số chủ);
`owner_contacts` được kéo bằng truy vấn riêng dưới luật theo dòng của chính nó mỗi lần kéo. Máy chủ nối bằng tài khoản
chủ nhưng mọi truy vấn kéo/đẩy chạy sau `set local role quy_hang_app` (vai không `bypassrls`) — `/keo` trả kèm
`current_user` để bài kiểm xác nhận cách ly đến từ cơ sở dữ liệu.

**Dữ liệu mẫu**: sàn `[Sàn A]` (đầu chủ A1, đầu chủ A2, trưởng nhóm A), sàn `[Sàn B]` (đầu chủ B1). Mỗi đầu chủ giữ vài
căn, mỗi căn một số chủ dạng `0900 000 0xx`. Mọi bản ghi mang nhãn mẫu.

**Thứ tự**: máy gán `client_seq` tăng dần cho mỗi thao tác; máy chủ áp theo `client_seq` trong lô và ghi `server_seq`
(seq của sổ thay đổi). Đúng thứ tự ⟺ với mỗi máy, `server_seq` tăng theo `client_seq` và không thiếu số nào.

## Hạng

Lộ trình ghi hàng này T3 (nó hỏi về bất biến cách ly). Máy suy T2 theo `_acceptance/config.yaml`: bài thử không chạm
`packages/db/**` hay lõi. Thẻ Cổng Phạm vi nêu điều này để chủ kho thấy.

## Không gian đã quét (morphological-scan, preset test-matrix)

Chân sản phẩm: Kiến trúc §1 «Nhanh tức thì, ghi trên máy trước», «Số chủ nhà chỉ đầu chủ giữ căn và trưởng nhóm thấy»
[SUY-TỪ-REPO: docs/architecture/kien-truc-repo-va-stack.md]; bất biến 1–2 [SUY-TỪ-REPO: AGENTS.md]. Chân ngành:
PowerSync (sync rules, bucket, hàng đợi tải lên), ElectricSQL (shape qua HTTP, ghi qua API riêng) [NGÀNH: PowerSync,
ElectricSQL]; mẫu outbox + khoá chống trùng [NGÀNH: transactional outbox].

- Trục A — người xem: đầu chủ giữ căn · đầu chủ khác cùng sàn · trưởng nhóm · người sàn khác · phiên không đặt sàn
  [thước CE: Kiến trúc §1 bảng vai]
- Trục B — loại dữ liệu: dòng căn (nội bộ) · số chủ (nguồn) [thước CE: `packages/core/src/data-classes.ts`]
- Trục C — trạng thái mạng: có mạng · mất mạng ≥ 5 phút rồi nối lại · chập chờn (lô bị cắt) [thước CE: `bat_khi`]
- Trục D — kết cục ghi: áp đúng thứ tự · trùng bị bỏ · bị từ chối vì cách ly [thước CE: ngành outbox]

Core: (A × B) kéo về đúng phần · mất mạng 5 phút rồi đẩy đúng thứ tự · gửi lại không trùng · ghi sai sàn bị từ chối.
Later: xung đột hai người sửa cùng căn khi cùng mất mạng (luật thắng); đồng bộ ảnh; xoá trên máy khi đăng xuất. Never:
đọc cơ sở dữ liệu của Invest.

## Ngoài phạm vi

- Dựng PowerSync hay ElectricSQL bằng container để đo — ADR nêu «chưa đo» và điều kiện đo.
- Xung đột ghi đồng thời, đồng bộ ảnh, xoá dữ liệu trên máy khi đăng xuất.
- Mã sản phẩm ở `apps/web/src/lib/sync/**` — đi hàng dựng sau khi chủ kho chốt ADR.
