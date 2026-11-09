# Thống nhất IA, khuôn và UX toàn app — đề xuất 09/11/2026

Tổng hợp từ mã `main` @ `001ae667`, các bản kiểm [Cài đặt](kiem-cai-dat.md), [hồ sơ liên hệ](kiem-chi-tiet-lien-he.md), audit Hôm nay
(PR #217), và đối chiếu sản phẩm ngoài. Đây là đề xuất, chưa sửa mã, chưa ghi lộ trình.

## Trả lời ngắn

**Vỏ và bố cục đã thống nhất. Cái còn thiếu là tầng giữa: cách một việc diễn ra.** Lưu, báo, chờ, lỗi, trống, bảng hiện do từng
hàng tự quyết trong từng màn, nên các màn cùng bố cục vẫn cư xử khác nhau.

**Đề xuất:** thêm một tầng **Mẫu hành vi** có đúng một nguồn và có lưới máy giữ, như cách vỏ đang được giữ. Dựng khu Cài đặt làm
màn mẫu đầu tiên bằng một **vỏ Cài đặt**, rồi lan sang các nhà khác theo hàng đang có. Không đổi vỏ, không đổi bảy bố cục, không dựng
lại màn nào.

Tiền lệ ngay trong kho: hàng `khung-ho-so-lien-he` (08/11) đưa khung hồ sơ căn và hồ sơ liên hệ về một khung chung rồi thêm luật máy
bắt cột phụ thiếu khung. Đề xuất này làm đúng việc đó cho sáu hành vi còn lại.

## 1. Hiện trạng

### Các tầng

| Tầng | Một nguồn | Máy giữ | Tình trạng |
| --- | --- | --- | --- |
| Nền: màu, chữ, bo góc, khoảng cách | `globals.css`, style `base-nova` | lint, mức nợ 0 | **Vững** |
| Vỏ: thanh trên, cột nhà, cột thứ hai, tab điện thoại | `navigationFor`, `app-shell-8` | lỗi biên dịch khi thiếu cột | **Vững** |
| Bố cục: bảy loại, sáu vùng | `BoCuc`, `ma-tran.ts` | bài quét, trang mẫu sống | **Vững**; ba màn (Hôm nay, Bảng hàng, Hồ sơ căn) để trống đầu màn |
| Khuôn theo màn | 19 nhóm ở `design/patterns/` | bài quét, chỉ soi `page.tsx` | Mỗi nhóm tự giữ phần của nó |
| **Mẫu hành vi** | **Không có** | **Không** | **Chỗ hở** |
| Khối, thành phần | 10 khối đã chuyển thể, 10 ReUI, 42 shadcn | lint, danh mục | Vững, nhưng chưa có luật ô nào dùng cỡ nào |

ADR-0024 quyết định 1 gửi «mẫu bên trong» cho từng nhóm khuôn, và quyết định 4 để lại «không đủ quyền và xung đột khi lưu». Vì thế
khuôn được chia **theo màn** (dọc), còn hành vi thì **cắt ngang** mọi màn và không ai giữ.

### Cùng một việc, nhiều cách làm

| Việc | Đang có | Căn cứ |
| --- | --- | --- |
| Ghi | Bảng hàng lưu từng ô và hoàn tác. Cài đặt có form khoá nút, form không khoá, hai nút Lưu một màn. Công tắc áp ngay (AI) và công tắc chờ Lưu (Thuế phí, Trang môi giới) đứng cạnh nhau trong cùng khu | Bản kiểm Cài đặt L3, L11 |
| Báo xong | Toast ở 8 tệp, khối báo ở chân khung, dưới ô, đầu tab, trên từng khối, hoặc không báo. 6 chỗ tự đặt `Toaster`, 4 chỗ không theo nền tối | L9, L10 |
| Chờ tải | Một khung chờ chung cho cả app, hình lưới bảng. 12 chỗ dùng khung chờ theo hình, 14 chỗ dùng vòng quay kèm chữ, Cài đặt thì không có gì | L6 |
| Đọc dữ liệu | Cài đặt đọc ở máy chủ; Bảng hàng đọc từ kho trên máy; Hôm nay, Liên hệ, Đã gửi đọc ở trình duyệt. Trạng thái chờ và lỗi vì thế khác nhau | Bản kiểm liên hệ; audit Hôm nay A2 |
| Lỗi | Có chỗ có «Thử lại», có chỗ chỉ «Tải lại trang»; Hôm nay một lỗi báo ba chỗ | L15; audit Hôm nay A3, A4 |
| Bảng | `data-grid` ở Bảng hàng, Liên hệ, Hôm nay; `Table` trần ở 7 tệp của các nhà; bảng trần ở điện thoại đẩy nút ra ngoài màn | L8 |
| Canh cửa | 15 trang chép cùng khối kiểm đăng nhập, chưa có sàn, chọn sàn; mỗi màn đọc phiên ba lần | Mục tốc độ của bản kiểm |

### IA

| Nhà | Vai | Cột thứ hai | Điện thoại | Chỗ lệch |
| --- | --- | --- | --- | --- |
| Hôm nay | TS, ĐC, ĐK, TN | Hàng đợi theo bộ nhóm | Tab | Chưa theo vai, chưa có số đếm (audit C). Người đủ vai thấy bốn vùng chồng nhau |
| Bảng hàng | ĐC, ĐK, TN | Góc nhìn | Tab, thành thẻ | Không |
| Đã gửi | ĐK, TN | Link đã gửi, Lịch xem | Tab Gửi | Không |
| Liên hệ | ĐC, TN | Sáu nhóm liên hệ | **Không có lối** | Bảng nhà ở §9 chưa có dòng Liên hệ |
| Đội | TN | Tổng quan | Không (đã chốt) | Cột có đúng một mục |
| Cài đặt | Mọi vai có cột | Cá nhân; Sàn mười mục | Tôi; quản trị thuần có Cài đặt sàn | **Mười mục phẳng, xếp theo thứ tự dựng.** Vai thường chỉ thấy một mục. Quản trị trên điện thoại chỉ tới được Người dùng |

Lead nằm ở hai chỗ: nhóm «Lead» của Liên hệ và màn Lead đã nhập. Việc đó đã được chốt theo mô hình Keller Williams nên không đề xuất đổi.

## 2. Sản phẩm hàng đầu làm thế nào

| Câu hỏi | Họ làm | Bài học |
| --- | --- | --- |
| Xếp cài đặt | **Theo phạm vi trước, chủ đề sau.** [Stripe](https://docs.stripe.com/dashboard/basics): Personal · Account · Product. [Linear](https://linear.app/changelog/2024-12-18-personalized-sidebar): Account · Features · Administration · Your teams. [Plain](https://mobbin.com/screens/d88dd0d6-6974-4cd7-b1e5-aa2ee74e15dd?utm_source=claude-code&utm_medium=ai-assistant&utm_source_platform=mcp): Admin · Channels and integrations · Workflow. [Unify](https://mobbin.com/screens/832992d1-1c53-4fee-9936-d5524c0694b8?utm_source=claude-code&utm_medium=ai-assistant&utm_source_platform=mcp): Personal · Workspace · Integrations · Features. [Plane](https://mobbin.com/screens/81af81fa-5bb1-453a-ab8e-30bf42024c5c?utm_source=claude-code&utm_medium=ai-assistant&utm_source_platform=mcp): chung · Products · Features · Developers | Quỹ hàng đã đúng tầng phạm vi (Cá nhân / Sàn). Còn thiếu tầng chủ đề trong mười mục |
| Chọn cách lưu | [Primer](https://primer.style/ui-patterns/saving): ô chữ, ô chọn nhóm thì bấm Lưu; công tắc thì áp ngay; và «never mix save patterns in a single form» | Công tắc trong form có nút Lưu là trái quy tắc này (Thuế phí, Trang môi giới) |
| Giữ phần chưa lưu | [Shopify](https://shopify.dev/docs/api/app-bridge-library/reference/contextual-save-bar): một thanh lưu chung hiện khi form có thay đổi, Lưu và Bỏ, hỏi trước khi rời trang | Một thanh cho mọi form, thay nút Lưu ở cuối trang dài 1.860 px |
| Báo đã lưu | Primer: báo ngay tại chỗ, tạm tránh toast vì khó cho người dùng máy đọc màn. [Plain](https://mobbin.com/screens/d88dd0d6-6974-4cd7-b1e5-aa2ee74e15dd?utm_source=claude-code&utm_medium=ai-assistant&utm_source_platform=mcp): «Workspace updated!» ngay cạnh nút Lưu | Form báo cạnh nút. Toast chỉ để cho việc cần «Hoàn tác» |
| Ngành môi giới | [Follow Up Boss](https://help.followupboss.com/hc/en-us/articles/19153809881495-Admin-Overview) gom Admin theo việc: Teams, Lead Flow, Stages, Custom Fields (đọc qua kết quả tìm kiếm, trang gốc chặn máy đọc). [Đối chiếu ngành §9](../product/doi-chieu-nganh.md): cấu hình dồn về chủ tài khoản (Follow Up Boss) hay theo cấp công ty (BoldTrail) | Nhóm theo việc của quản trị sàn, gọi tên việc |

Một điểm top tier cũng khác nhau: [Cofounder](https://mobbin.com/screens/0fcbac2a-8b33-470f-8f38-992a10f654c4?utm_source=claude-code&utm_medium=ai-assistant&utm_source_platform=mcp), Plain để nút Lưu theo từng đoạn, Shopify một thanh cho cả form. Cả hai đều ổn nếu chỉ dùng một kiểu.
Quỹ hàng nên chọn một thanh vì mọi mục đã là một khung (luật một khung) và Cách gọi rất dài.

## 3. Đề xuất

### 3.1 Tầng Mẫu hành vi

Mỗi mẫu có đúng một thành phần chủ, một luật chọn, một bài máy kiểm. Khuôn của từng màn chỉ còn khai khe và luật nghiệp vụ.

| Mẫu | Luật | Thành phần chủ | Thay cho |
| --- | --- | --- | --- |
| **Ghi** | Bốn kiểu, chọn theo ô: *sửa trên ô* lưu ngay kèm hoàn tác (đã chốt ở Bảng hàng) · *form nhiều ô* qua thanh lưu · *hộp một việc* đóng là xong · *công tắc* áp ngay, không đứng trong form có Lưu | `ThanhLuu` mới: hiện khi có thay đổi, Hoàn lại · Lưu, dính đáy vùng làm việc, chống rời trang | Hai nút Lưu, nút cuối trang, Lưu không khoá |
| **Báo** | Form báo cạnh nút Lưu. Toast chỉ khi có Hoàn tác, từ một chỗ trong vỏ. Lỗi luôn ở tại chỗ | `ThanhLuu`; một `Toaster` trong vỏ | Năm kiểu báo, sáu Toaster |
| **Chờ** | Vùng lớn dùng khung theo hình bố cục, mỗi nhà một `loading.tsx`. Vòng quay chỉ cho chỗ nhỏ. Bấm là có phản hồi ngay | `ChoTai` đã có | Khung lưới cho mọi màn |
| **Lỗi** | Một vùng một báo lỗi, luôn có «Thử lại», không lộ mã thô, mất mạng thì tự đọc lại | `TrangThai` đã có, thêm `LoiVung` | «Tải lại trang», một lỗi nói ba chỗ |
| **Trống** | Luôn có một hành động hay một câu nói khi nào sẽ có. Không vẽ bảng toàn số 0 | `TrangThai` | Trống không lối đi |
| **Bảng** | Ba cỡ: *lưới dày* (`data-grid`, trên 50 dòng hay có lọc) · *danh sách dòng* (theo `list-11`, tối đa vài chục dòng, tự thành thẻ dưới `md`) · *thẻ* ở điện thoại | `DanhSachDong` mới | `Table` trần |
| **Canh cửa** | Đăng nhập, sàn, vai kiểm một lần ở cấp nhà, đọc phiên một lần mỗi lượt dựng | `layout.tsx` cấp nhà, `cache` cho `readMe` | 15 trang chép lại, ba lần đọc phiên |

Mẫu «Hồ sơ» đã xong từ 08/11, chỉ cần ghi vào bảng này. Hộp xác nhận đã thống nhất qua `AlertDialog`.

### 3.2 Vỏ Cài đặt, màn mẫu đầu tiên

Coi Cài đặt là một vỏ con, y như vỏ chung: phần khung ở một chỗ, mỗi mục chỉ khai nội dung.

**IA mới** (thêm tiêu đề nhóm con; vẫn mười mục, vẫn địa chỉ cũ):

```
Cá nhân
  Cá nhân
Sàn [Tên]
  ĐỘI NGŨ       Người dùng
  DỮ LIỆU       Cách gọi · Trường riêng · Trạng thái · Từ điển
  VẬN HÀNH      Chia lead · Thuế phí
  PHÁT HÀNG     Mẫu · Trang môi giới
  TÍCH HỢP      Xử lý bằng AI
```

Mẫu nhập nằm trong mục Mẫu theo quyết định 07/11, nên giữ nguyên ba tab. «Luật chia lead» đổi thành «Chia lead» vì `CONTEXT.md` tránh
«Luật chia». Vai thường chỉ thấy một mục Cá nhân; §9 đã chốt «cột luôn có» nên giữ.

**Ba loại mục, thay vì mười cách dựng:**

| Loại | Dùng cho | Hình |
| --- | --- | --- |
| **Dòng cấu hình** | Cách gọi, Trường riêng, Trạng thái, Chia lead, Thuế phí, Trang môi giới, Mẫu bài | Một khung `settings-3`, nhãn trái ô phải, một `ThanhLuu` |
| **Bộ sưu tập** | Người dùng, Mẫu nhập, Mẫu bảng hàng, Từ điển | `DanhSachDong`, thêm · sửa · xoá trong hộp |
| **Công tắc ngay** | Xử lý bằng AI | Dòng cấu hình không có thanh lưu |

Một lần làm gỡ được: ba lần đọc phiên, chờ tải, nội dung sát viền, tiêu đề lặp, năm kiểu báo, hai nút Lưu, mất chữ khi rời trang, lỗi
không có Thử lại. Tức là L3, L4, L6, L7, L9–L12, L15, L16 của bản kiểm cùng một gốc.

### 3.3 Lan ra toàn app

| Nhà | Áp mẫu nào | Đi cùng hàng |
| --- | --- | --- |
| Hôm nay | Lỗi, Chờ, đầu vùng thống nhất | Việc R1, R2 của audit Hôm nay |
| Bảng hàng | Giữ sửa trên ô; dồn Toaster về vỏ; `Table` phụ về `DanhSachDong` | Khi hàng kế chạm vùng này |
| Liên hệ, Đã gửi, Lead | Lỗi, Chờ, Trống | Đợt dau-khach-nhap chạm tới thì làm luôn |
| Hồ sơ căn | Báo, `ThanhLuu` cho ngăn sửa nhanh nếu có nhiều ô | Khi chạm |
| Nhập Excel, Gửi | Lỗi, Chờ; `kind="loading"` về đúng cỡ | Khi chạm |

Không có hàng dọn riêng cả app. Lưới máy ngăn chỗ mới, chỗ cũ sửa khi có hàng chạm tới, giống cách hệ bố cục đã lan.

### 3.4 Máy giữ

- Lint cấm: `Toaster` ngoài vỏ, `Table` ngoài `DanhSachDong`, `Switch` trong form có `ThanhLuu`. Chỗ cũ ghi ngoại lệ có hạn ở bản đồ khuôn, như ADR-0024 quyết định 9; mức nợ giữ trần 0.
- Bài quét đọc cả tệp thân của màn, không chỉ `page.tsx`, để bắt được hai khung trong một mục.
- Trang mẫu sống thêm mục Mẫu hành vi, chụp ảnh chuẩn cho thanh lưu ở các trạng thái.
- Câu giao màn mới phải khai kiểu ghi nào, bảng cỡ nào, ngay ở Cổng Phạm vi.

### 3.5 Giữ nguyên, có lý do

Bảy bố cục · vỏ · Đọc hẹp 48rem · hồ sơ cột kéo chia 38% · Bảng hàng sửa trên ô và hoàn tác · chế độ cuộc gọi · họ khung Frame ·
mười mục và địa chỉ của chúng · ba tab của Mẫu · ADR-0024 chỉ thêm một tầng, không viết lại.

## 4. Thứ tự làm

| Bước | Việc | Hạng | Gộp từ bản kiểm Cài đặt |
| --- | --- | --- | --- |
| 0 | Vá hai lỗi làm sai việc người dùng; đi trước, độc lập | T2 | Hàng A |
| 1 | Sửa đổi ADR-0024, thêm tầng Mẫu hành vi, viết bảng luật | T1 | — |
| 2 | Dựng `ThanhLuu`, `DanhSachDong`, vỏ Cài đặt; chuyển mười mục; nhóm con; trình ảnh màn chạy đủ cột vỏ tại Cổng Phạm vi | T2 | Hàng B, C (phần Cài đặt), D |
| 3 | Bật lưới máy; chỗ cũ ngoài Cài đặt ghi ngoại lệ có hạn | T2 | — |
| 4 | Lan theo hàng đang tới | — | Audit Hôm nay R1, R2 |

Bước 2 cần chủ kho ký vì đổi chữ ở Tham chiếu §9 (nhóm con, tên «Chia lead») và thêm khối đích. Quản trị trên điện thoại (hàng E) vẫn
để riêng: chỉ mở nếu quản trị sàn thật sự cần sửa cấu hình trên điện thoại.

## 5. Điều chưa chắc

- Chưa thử người dùng thật; nhóm con là suy từ cách sản phẩm khác làm và nghĩa của từng mục.
- `ThanhLuu` dính đáy chưa thử với thanh tab điện thoại; sẽ thấy ở ảnh màn chạy bước 2.
- Không đọc được trang gốc của Follow Up Boss; ảnh Mobbin là bản chụp tại một thời điểm, có thể đã đổi.
