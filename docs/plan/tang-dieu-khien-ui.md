# Các tầng điều khiển UX/UI cho agent viết mã — hệ thống hoá 09/11/2026

Đọc từ `main` @ `7d523b7b` và kit nghiệm thu 2.37.0. Bản này chỉ mô tả và đề xuất, chưa đổi rào nào. Lỗi dùng làm phép thử lấy từ bốn bản kiểm
gần đây: [Cài đặt](kiem-cai-dat.md), [Hôm nay](audit-man-hom-nay.md), [hồ sơ liên hệ](kiem-chi-tiet-lien-he.md), và đồng nhất Bảng hàng – Liên hệ (PR #226).

## Trả lời ngắn

Kho có **bảy tầng** điều khiển agent, đọc từ ý định tới phản hồi. Vấn đề không phải thiếu tầng, mà là **sức mạnh dồn sai chỗ**:

- Phần **nhìn** (màu, cỡ chữ, khung, bố cục) có vật liệu tốt và rào cứng, nên gần như không còn lệch.
- Phần **hành vi** (lưu, báo, chờ, lỗi, tuần tự thao tác) mới có luật trên giấy từ 09/11, chưa có thành phần chủ, chưa có rào. Đa số lỗi thật nằm ở đây.
- Tầng **phản hồi** gần như chưa chạy: sổ lệch lọt có 0 dòng, trong khi bốn bản kiểm tìm ra hơn 90 chỗ. Điều học được không tự thành rào.

## 1. Bảy tầng

| # | Tầng | Trả lời câu hỏi | Gồm những gì | Tác dụng lúc | Sức mạnh |
| --- | --- | --- | --- | --- | --- |
| 1 | **Ý định** | Làm gì, cho ai, đã chốt gì | Bốn bất biến (`AGENTS.md`) · Tham chiếu §9, §10, §12 · `CONTEXT.md` · ADR-0002, 0019, 0022, 0024 · câu giao trong lộ trình | Trước khi thiết kế | Chữ, người giữ |
| 2 | **Chỉ dẫn cho agent** | Nên làm thế nào | Luật theo đường dẫn `.claude/rules/giao-dien.md` · skill `reui`, rồi `quy-hang-ui` · MCP `reui`, `shadcn` · `catalog.md` · `vo-va-ia.md` | Lúc nạp ngữ cảnh | **Gợi ý**: agent có thể bỏ qua |
| 3 | **Vật liệu** | Được dùng gì | Style `base-nova`, token `globals.css` · 42 thành phần shadcn, 10 ReUI, cài nguyên bản · 10 khối đã chuyển thể | Lúc viết | **Đường mặc định** |
| 4 | **Khung bắt buộc** | Phải đi qua đâu | Vỏ và `navigationFor` · `BoCuc`, bảy bố cục, sáu vùng · `TrangThai`, `ChoTai`, `NganNoi`, `KhungCotPhu` · Mẫu hành vi (đã duyệt, **chưa dựng**) · 19 nhóm khuôn ở `design/patterns/` | Lúc viết | Đường mặc định, có kiểu giữ một phần |
| 5 | **Rào máy** | Chặn cái gì | 14 luật lint `quy-hang-ui` · bài quét khuôn, kiểm chuẩn, mức nợ 0 · hook cuối lượt (kiểm kiểu, lint tệp vừa đổi) · `pre-push` · CI `ci-ok` · sàn thiết kế M1 | Cuối lượt, trước đẩy, CI | **Chặn** |
| 6 | **Chấm và cổng** | Ai xác nhận đúng | Feature-loop: S1-D `design-pass`, trang ba lối, đối chiếu ảnh, phản biện context sạch, Cổng Phạm vi · S4: `ui-check`, tác tử `cham-ui`, Cổng Bằng chứng · trang mẫu sống và 29 ảnh chuẩn làm thước | Trước và sau khi dựng | **Người và tác tử độc lập** |
| 7 | **Phản hồi** | Học được gì | `lech-lot.md` · `so-do-vong.mjs` · các bản kiểm ở `docs/plan/` · hàng vá trong lộ trình | Sau gộp | Chưa nối vào tầng khác |

Thứ tự thẩm quyền khi hai tầng vênh nhau đã có sẵn và vẫn đúng: bất biến → skill `reui` và style đã cài → `quy-hang-ui` → sở thích của agent.

## 2. Thang sức mạnh

Cùng một luật, đặt ở bậc càng cao thì càng ít phải nhắc:

| Bậc | Cách giữ | Ví dụ đang có | Chi phí khi agent làm sai |
| --- | --- | --- | --- |
| 1 | **Không viết sai được**: thiếu là lỗi biên dịch | Thiếu cột cho một nhà | Không tốn gì |
| 2 | **Đường dễ nhất là đường đúng**: thành phần chủ, có khe | `BoCuc`, `TrangThai`, `SettingField` | Gần như không |
| 3 | **Máy chặn ngay**: lint, hook, bài quét | Màu thô, `<button>` trần, kích thước tuỳ ý | Một vòng sửa |
| 4 | **Máy chấm trên bản chạy**: kịch bản, ảnh | `ui-check`, ảnh chuẩn | Một vòng dựng |
| 5 | **Người chấm** | Cổng Phạm vi, Cổng Bằng chứng | Một lượt gọi chủ kho |
| 6 | **Chỉ dẫn bằng chữ** | Skill, luật, ADR | Lỗi vào tới bản thật |

Nguyên tắc: **mỗi lỗi lặp lại phải được đẩy lên ít nhất một bậc**. Chữ chỉ dùng cho điều máy chưa giữ được.

## 3. Phép thử: lỗi thật đã lọt qua tầng nào

| Lỗi đã thấy | Tầng lẽ ra giữ | Vì sao lọt |
| --- | --- | --- |
| Nút «Giữ nhãn» không giữ, sau một lần gỡ trước (Cài đặt L1) | 6, `ui-check` | Bài kiểm chỉ gọi hàm thuần; không kịch bản nào đi hai thao tác liên tiếp |
| Xoá hỏng không báo (L2) | 4, Mẫu hành vi | Chưa có thành phần chủ cho Ghi và Lỗi |
| Hai khung, hai nút Lưu một màn (L3) | 5 | Luật một khung có, nhưng bài quét chỉ soi `page.tsx`; khung thứ hai ở tệp thân |
| Năm kiểu báo lưu, sáu `Toaster` (L9, L10) | 4, 5 | Lint không có luật về `Toaster`. Cùng kiểu hở: `no-raw-table` chỉ cấm `<table>`, cho qua `Table` |
| Mất chữ khi rời trang (L4) | 4 | Không mẫu nào nhắc tới |
| Nội dung sát viền, tiêu đề lặp (L7, L16) | 4 | Khuôn có tham số `khoi`, nhánh còn lại giả định thân là dòng `SettingField` |
| Hôm nay: một lỗi nói ba chỗ (A3, A4) | 4 | Chưa có mẫu Lỗi |
| Bảng hàng thiếu đường dẫn mà §9 đòi (PR #226, L1) | 5 | Bài quét không kiểm `dauMan={null}` có ngoại lệ không |
| Sổ cũ: khuôn ghi 7 mục, thực tế 10 | 2 | Một sự thật ở nhiều chỗ, không máy nào so |

**Kết luận phép thử:** không lỗi nào cần thêm tầng mới. Chúng cần tầng 4 đủ hơn và tầng 5 nhìn rộng hơn.

## 4. Năm chỗ hở của hệ thống

**a. Tầng 2 dài và mềm.** Một việc giao diện phải đọc khoảng 2.200 dòng chỉ dẫn (luật 32, `quy-hang-ui` 244, danh mục 121, `reui` 83 cộng 13 tệp chủ đề 1.274, `vo-va-ia` 240,
`AGENTS` 91, `CONTEXT` 113). Hook hiện chỉ giữ migration và tệp bí mật, không có gì buộc nạp skill trước khi sửa `apps/web/**`. Trong feature-loop thì có; hàng vá nhỏ và phiên
ngoài vòng thì chỉ có luật theo đường dẫn tự nạp.

**b. Một sự thật ở nhiều chỗ.** Khối nguồn của bố cục Tràn: ADR ghi `data-grid-editing-6`, `ma-tran.ts` ghi `solution-crm-3`. Skill ghi «mười một luật» lint, kho có 14. Khối đích nằm
ở `vo-va-ia.md`, `catalog.md`, khuôn nhóm và `ma-tran.ts`. Máy mới kiểm được «có dòng», chưa kiểm «nói giống nhau».

**c. Rào nhìn theo tệp, lỗi nằm theo màn.** Bài quét đọc `page.tsx`, nên phần thân client đi qua không ai soi. Luật `ban-do-khuon` chặn theo nhập khối, không theo đồ thị nhập của màn.

**d. Cổng phủ tốt phần dựng mới, ít phủ phần ghép.** Trong 163 hồ sơ có 27 `design-pass` và 13 trang ba lối (nhiều hồ sơ không chạm giao diện), nhưng chỉ 2 hồ sơ có trang đối chiếu, 2 có số đo khuôn.
`ui-check` nhiều (93 hồ sơ) nhưng kiểm từng màn theo hợp đồng của hàng, không có bộ kịch bản chung cho hành vi.

**e. Vòng phản hồi hở.** `lech-lot.md` 0 dòng; hai số đo khuôn cũng ghi 0 lệch lọt. Bốn bản kiểm tìm ra lỗi nhưng nằm ngoài sổ, nên «hai lần lọt thì mở lại thiết kế bản đồ» chưa từng kích hoạt.

Ngoài ra có **tầng nhiễu** ngoài kho: `ux-ui-craft`, `frontend-design` tự kích hoạt theo mô tả và cho lời khuyên chung, trong khi `reui` dặn bỏ qua lời khuyên giao diện chung. Kho chưa nói gì về hai skill này.

## 5. Đề xuất: mỗi loại quyết định một chủ

| Loại quyết định | Chủ duy nhất | Nơi khác chỉ được | Răng |
| --- | --- | --- | --- |
| Nhà, nút, tab theo vai | `navigationFor` | đọc | Kiểu, bài kiểm |
| Bố cục và vùng | `ma-tran.ts` | sinh bảng từ đây | Bài quét |
| Hành vi: lưu, báo, chờ, lỗi, trống, bảng | Bảng mẫu ở ADR-0024, sửa đổi 09/11, và thành phần chủ | trỏ tới | Lint, kịch bản chung |
| Khối đích từng màn | `vo-va-ia.md` | `catalog.md` chỉ ghi đã chuyển thể | So khớp hai bảng |
| Nhãn | `CONTEXT.md` | đọc | Từ cấm trong chữ giao diện |
| Danh mục mục, số lượng | Mã (`cai-dat.ts`…) | sổ không ghi số đếm | Kiểm chuẩn |

Việc làm, theo thứ tự lợi:

1. **Đưa phần không phụ thuộc lên trước trong `luoi-mau-hanh-vi`.** Bài quét đọc cả đồ thị nhập của màn; cấm `Toaster` ngoài vỏ. Hai việc này không cần thành phần mới, nhưng hàng này đang xếp sau ít nhất bốn hàng khác.
2. **Rút tầng 2 thành một thẻ chọn khoảng 30 dòng** được hook tự chèn khi agent sửa `apps/web/**`: bố cục nào, mẫu nào, khuôn nào, bảng cỡ nào, rồi trỏ tới tệp chi tiết. Nói rõ không dùng `ux-ui-craft`, `frontend-design` trong kho này.
3. **Bộ kịch bản hành vi dùng chung** cho `ui-check`: lưu thành công, lưu hỏng, hai thao tác liên tiếp, rời trang chưa lưu, mất mạng, chờ chậm. Màn nào dùng mẫu nào thì chạy kịch bản ấy.
4. **Nối bản kiểm vào sổ**: mỗi lỗi có «tầng lẽ ra giữ»; bản kiểm ghi dòng vào `lech-lot.md`, để luật «hai lần thì mở lại» có dữ liệu.
5. **So khớp sổ bằng máy**: kiểm chuẩn so số luật, khối nguồn, số mục giữa các nơi còn chép lại, hoặc bỏ hẳn phần chép.

## 6. Giữ nguyên

Thứ tự thẩm quyền · thang dùng lại bảy bậc · lint và mức nợ 0 · Cổng Phạm vi trình ảnh màn chạy thật · chấm bằng tác tử context sạch · vỏ và bố cục (ADR-0002, 0024).

## 7. Điều chưa chắc

- Số hồ sơ có `design-pass`, đối chiếu là đếm tệp trên cây; chưa tách riêng hồ sơ thật sự chạm giao diện.
- Chưa đo agent có thật sự đọc đủ 2.200 dòng hay không; thẻ chọn 30 dòng cần thử so với cách hiện tại trên vài hàng trước khi bỏ bớt chỉ dẫn.
- Hook chèn ngữ cảnh có chạy đúng trong worktree và phiên thợ hay không cần thử; bài học ở «Hook trong worktree» cho thấy chỗ này dễ sai.
