# Đổi đầu chủ hàng loạt — thiết kế

Hàng 89 (dãy H, đợt `dau-khach-nhap`), T3 vì migration 027. Ô cơ hội: `opportunity.md` (chủ kho chọn làm 02/11). Đứng
trên hàng 16 (sửa hàng loạt), 85–86 (liên hệ). Sổ lựa chọn: `decisions.jsonl`.

## 1. Cái đã có, cái còn thiếu

- **Đầu chủ giữ căn** là dòng có `seq` lớn nhất ở bảng `listing_agent_assignments` (006). Bảng chỉ thêm dòng; chỉ trưởng
  nhóm gán lại. Đổi từng căn đã có: `PUT /listings/{id}/listing-agent`. Lối này không đổi người giữ liên hệ chủ nhà.
- **Người giữ liên hệ chủ nhà**: cột `contacts.owner_member_user_id` (016). Vai API không được sửa cột này. Chưa có hàm
  nào đổi một người giữ đã có. ADR-0021 điểm 5 viết: «giao lại hàng không tự đổi người giữ».
- **Sửa hàng loạt** (hàng 16): ô tích, thanh lệnh, hộp hỏi, thông báo 10 giây có «Hoàn tác». Mọi việc chạy qua kho trên
  máy. Thanh không kiểm vai.
- **Thiếu**: đổi đầu chủ cho nhiều căn một lần, kéo theo người giữ liên hệ chủ nhà, và hoàn tác được.

## 2. Luồng

1. Trưởng nhóm tích các căn trên Bảng hàng, bấm «Đổi đầu chủ» trên thanh sửa hàng loạt.
2. Hộp hỏi mở. Trưởng nhóm chọn người nhận từ danh sách đầu chủ của sàn (`GET /team/listing-agents`).
3. Máy chủ trả bản xem trước gồm:
   - các căn đã tích;
   - mọi căn khác của cùng chủ nhà, đánh dấu «cùng chủ nhà»;
   - đầu chủ cũ của từng căn;
   - số liên hệ chủ nhà sẽ đổi người giữ.

   Hộp hỏi kể đủ danh sách ấy. Không hiện tên hay số chủ nhà.
4. Bấm «Đổi đầu chủ» thì máy chủ, trong một giao dịch:
   - thêm một dòng gán cho từng căn đang do người khác giữ;
   - đổi người giữ của từng liên hệ chủ nhà;
   - ghi một «lần đổi đầu chủ» kèm người giữ cũ của từng căn và từng liên hệ.
   Mỗi căn đổi cũng ghi một sự kiện vào lịch sử hàng để bộ đồng bộ kéo đầu chủ mới về máy, không cần tải lại trang.
5. Thông báo 10 giây «Đã đổi đầu chủ N căn, M liên hệ» có nút «Hoàn tác». Hoàn tác trả người giữ cũ cho căn và liên hệ
   còn đang do người nhận giữ. Căn hay liên hệ đã đổi tiếp sau đó thì bỏ qua, có đếm. Mỗi lần đổi chỉ hoàn tác một lần.
   Căn trước đó chưa có đầu chủ giữ người nhận, liên hệ cùng chủ cũng vậy, thông báo ghi riêng (Hỏi-2).

## 3. Máy chủ

- **Migration 027**: bảng `listing_agent_reassignments` (một lần đổi) và `listing_agent_reassignment_items` (từng căn,
  từng liên hệ, người giữ cũ).
  - Luật theo dòng: đọc trong sàn, vai API chỉ `select`.
  - Ba hàm security definer, chỉ trưởng nhóm gọi được:
    - `app.preview_listing_agent_reassignment`
    - `app.reassign_listing_agents`
    - `app.undo_listing_agent_reassignment`
  - Người nhận phải mang vai Đầu chủ. Trần 200 căn sau khi kéo theo.
- **API** (`packages/api/src/listings/`):
  - `POST /api/v1/listings/agent-reassignments/preview`
  - `POST /api/v1/listings/agent-reassignments`
  - `POST /api/v1/listings/agent-reassignments/{id}/undo`

  Thân strict. Vai khác trưởng nhóm nhận 403. Căn của sàn khác hay mã lạ thì 404.
- **ADR-0021**: thêm mục sửa đổi 05/11. Lối hàng loạt đổi luôn người giữ liên hệ. Lối gán một căn giữ nguyên.

## 4. Web

- Lệnh «Đổi đầu chủ» trên thanh sửa hàng loạt chỉ hiện với Trưởng nhóm. Quyền đọc từ lõi (`navigationFor`), không rẽ
  theo tên vai ở màn.
- Mất mạng thì lệnh tắt, kèm lời «Cần mạng để đổi đầu chủ».
- Sau khi đổi, bộ đồng bộ kéo lại để đầu chủ mới về dữ liệu trên máy. Bảng hàng chưa có cột «Đầu chủ»; cột là hàng
  sau (chủ kho chọn 05/11).

## 5. Lựa chọn máy đã quyết

Mỗi lựa chọn một dòng sổ S1 có căn cứ. Hai câu chỉ người biết, sinh từ phản biện context sạch:
- Hỏi-1: lối gán từng căn đang có — khuyến nghị giữ nguyên ở hàng này.
- Hỏi-2: hoàn tác căn trước chưa có đầu chủ — khuyến nghị căn và liên hệ cùng chủ giữ người nhận, có lời riêng.

## 6. Đối chiếu ngành

- RESO: `ListAgentKey` (đầu chủ của hàng) và `OwnerMemberKey` (người giữ liên hệ). Đổi đầu chủ là đổi `ListAgentKey`.
- Follow Up Boss, kvCORE: «Reassign» hàng loạt có xác nhận, chuyển cả liên hệ đi kèm.

## 7. Đặc tả UX

<!-- ux-spec:start -->
- **Khuôn IA**: lệnh trên thanh hàng loạt, xác nhận bằng hộp hỏi (AlertDialog), hoàn tác trên thông báo, như hàng 16.
- **Trạng thái**:
  - Hộp hỏi: đang tải bản xem trước · lỗi đọc (Thử lại) · chưa chọn người nhận (nút tắt) · vượt 200 căn (lời từ chối)
    · đang đổi.
  - Thông báo kết quả: số căn, số liên hệ.
  - Hoàn tác: trả N, bỏ qua K kèm lời.
- **Khổ**: chỉ máy tính, vì Bảng hàng kiểu Sheet chỉ có trên máy tính.
- **Thẻ việc**: trưởng nhóm chuyển hàng của một đầu chủ sang người khác trong một lần, thấy trước đủ căn bị kéo theo.
<!-- ux-spec:end -->
