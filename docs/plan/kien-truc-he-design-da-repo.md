# Kiến trúc design dùng chung cho mọi repo — đề xuất 09/11/2026

Trạng thái: **Đề xuất**, chưa ghi lộ trình, chưa đổi code ở kho nào. Kiểm kê trên `main` @ `e77c8fdc` của Quỹ hàng và bản clone tại
máy của 14 repo khác. Khi được duyệt, phần chung của bản này chuyển sang kit nghiệm thu; bản này chỉ giữ phần áp cho Quỹ hàng.

**Chưa xác minh:** kiến trúc chưa dựng thử ở repo nào, nên mọi lợi ích dưới đây là dự kiến. Số repo đếm trên bản clone tại máy, có thể cũ
hơn remote. Vài thuật ngữ chỉ đọc được bản tóm tắt hoặc là thông lệ chưa tìm ra nguồn gốc, đều ghi rõ ở §2.

## Trả lời ngắn

Mục tiêu là **mỗi quyết định thiết kế chỉ được đưa ra một lần, ở đúng tầng, rồi máy giữ nó ở mọi repo**. Muốn vậy cần bốn thứ:

1. **Một kiến trúc nhiều tầng** với tên chuẩn của ngành, để biết mỗi quyết định thuộc về đâu.
2. **Một thang độ chắc**, để đẩy từng quyết định từ chỗ «viết trong tài liệu» lên chỗ «không thể làm sai».
3. **Một đường nâng hạng**, để cái sinh ra ở một sản phẩm được lên thành của chung khi có bằng chứng.
4. **Màn mẫu chuẩn và bộ mẫu bài kiểm**, vì đo thực tế cho thấy AI chép màn gần nhất, và phần lớn việc làm lại nằm ở bài kiểm chứ không ở giao diện
   ([ma trận kiểm kê](ma-tran-kiem-ke-design-claude-code.md)).

```
                                           AI ĐỔI      ĐỘ MỞ
┌──────────────────────────────────────────────────────────────────┐
│ PRODUCT   Pages, màn thật              │ từng repo │ tự do trong │
│                                        │           │ khung dưới  │
├──────────────────────────────────────────────────────────────────┤
│ RECIPES   Phần ghép riêng của sản phẩm │ từng repo │ mở, có khai │
│           Snowflakes: đồ một lần       │           │ báo và hạn  │
╞══════════════════════════════════════════════════════════════════╡ ← đường nâng hạng
│ CORE      Templates, Layout primitives │ chung     │ danh sách   │
│ DESIGN    Interaction patterns         │ theo nền  │ đóng        │
│ SYSTEM    Core components              │           │             │
│           Content guidelines           │           │             │
├──────────────────────────────────────────────────────────────────┤
│ FOUNDATIONS  Design tokens             │ cấu trúc chung,         │
│                                        │ giá trị theo theme      │
└──────────────────────────────────────────────────────────────────┘
  Cắt ngang mọi tầng:  Source of truth · Distribution · Governance · Verification kit
```

Khuyến nghị: **chung một đặc tả và một bộ kiểm cho mọi repo; chung linh kiện chỉ giữa các repo cùng nền; recipes và giá trị theme để
riêng.** Không làm một gói giao diện duy nhất cho tất cả, vì 15 repo đang ở ít nhất bốn nền khác nhau (§7).

## 1. Bất định nằm ở đâu

Quỹ hàng là ca đo rõ nhất. Máy báo bản đồ khuôn 19 nhóm, 0 lệch, trong khi Bảng hàng và Liên hệ khác nhau 43 chỗ, 25 chỗ vô cớ. Cả hai
đều đúng: khuôn khoá khung trang và dừng ở khe nội dung, còn bảng nằm trong khe. Ba lưới dữ liệu đang có ba bộ cấu hình tự viết trong
từng màn.

Nguồn bất định không phải do thiếu tài liệu. Nó đến từ **những câu hỏi còn để ngỏ mỗi lần dựng**: dòng cao bao nhiêu, số canh về đâu,
lọc rỗng nói gì.

Đo 09/11 với ba tác tử độc lập cùng lập phương án cho một màn danh sách cho thấy câu hỏi để ngỏ được trả lời theo hai cách:

- **Có màn mẫu gần:** máy chép theo, rất đồng nhất. 16 trên 21 quyết định giống nhau, nhưng 6 trong số đó là chép luôn lỗi của màn mẫu.
- **Màn mẫu mâu thuẫn hoặc không có:** máy tự đoán và lệch nhau. 5 trên 21 quyết định lệch, và mỗi tác tử phải tự đoán 17–22 mục.

Vì vậy tất định không chỉ là thêm luật. Màn mẫu cũng là một nguồn sự thật, dù có ai khai nó như vậy hay không.

Mới đo một màn giả định, ở mức lập phương án; số liệu ở [ma trận kiểm kê](ma-tran-kiem-ke-design-claude-code.md).

**Tất định ở đây nghĩa là:** cùng một loại việc thì ra cùng hình và cùng hành vi, bất kể ai dựng, repo nào, lúc nào.

**Không có nghĩa là:** máy quyết định trải nghiệm có tốt không. Hệ thống rất nhất quán vẫn có thể sai đồng loạt. Phần đó cần thử với
người dùng và nằm ngoài kiến trúc này (§5, bậc phán đoán).

## 2. Từ vựng chuẩn

Mức tin: **Gốc** = đã đọc nguồn gốc · **Tóm tắt** = chỉ đọc kết quả tìm kiếm, trang gốc từ chối · **Thông lệ** = dùng rộng trong nghề, chưa
truy được nguồn.

| Từ chuẩn | Nghĩa | Tên đang gọi ở Quỹ hàng | Mức tin |
|---|---|---|---|
| **Design tokens** | Đơn vị nhỏ nhất của quyết định: màu, khoảng cách, thang chữ | Biến trong `globals.css` | Gốc (DTCG) |
| Token tiers: primitive, semantic, component | Ba lớp: giá trị thô, vai trò, gắn với linh kiện. Chuẩn DTCG không định nghĩa, để đội tự chọn | Chưa tách rõ | Thông lệ |
| **Atoms, molecules, organisms** | Linh kiện từ nhỏ tới cụm lớn | Thành phần ReUI, khối | Gốc (Atomic Design) |
| **Templates** | Vật cấp trang: đặt thành phần vào bố cục, nói lên cấu trúc nội dung | Bảy bố cục, khuôn nhóm | Gốc |
| **Pages** | Template đổ nội dung thật | Màn thật | Gốc |
| **Core design system** | Thành phần và quy ước chung của cả tổ chức | Chưa có ở cấp nhiều repo | Gốc (Frost) |
| **Recipes** | Phần ghép riêng cho một sản phẩm, nằm ngoài core, vẫn dùng token | Bảng hàng 15 cột, Hồ sơ căn | Gốc |
| **Snowflakes** | Đồ thật sự riêng, dùng một chỗ. Frost xếp nó trong lớp recipes | `ngoai_le` của khuôn | Gốc |
| **Interaction patterns** | Cách lặp lại để giải một việc: lưu, báo, chờ, lỗi, trống, tìm, lọc | Mẫu hành vi | Gốc (Primer) |
| **Content guidelines** | Luật chữ: nhãn nút, câu lỗi, định dạng | Chưa có | Gốc (Atlassian, mức danh mục) |
| **Registry** | Kênh phát mã: danh mục JSON, mỗi mục kê tệp và phụ thuộc, lệnh cài đưa vào dự án | ReUI qua shadcn | Gốc |
| **Component manifest** | Danh mục máy đọc được: thành phần, tuỳ chọn, mặc định | `component-registry.json` của kit | Tóm tắt |
| **Golden path** | Đường có chủ kiến và được hỗ trợ. Đi ngoài được, nhưng không có hỗ trợ | Thang dùng lại, khuôn | Gốc (Spotify) |
| **Make illegal states unrepresentable** | Thiết kế kiểu sao cho trạng thái sai không viết ra được | Bảy bố cục đóng | Gốc (Minsky) |
| **Graduation** | Recipe chứng minh được giá trị thì lên core | Chưa có | Gốc (Frost) |
| **Governance, contribution model** | Ai được đổi, xét thế nào, theo dõi áp dụng ra sao | Cổng nghiệm thu | Tóm tắt |
| **Adoption metric, detached variants** | Tỉ lệ dùng thành phần của hệ, số bản tách riêng | Mức nợ, ngoại lệ | Tóm tắt |
| **Design lint, visual regression** | Máy soi mã, so ảnh | `ui-lint`, ảnh chuẩn | Thông lệ |
| **Reference implementation** | Bản dựng thật được chọn làm mẫu để sao theo | Màn mẫu khai trong khuôn | Thông lệ |
| **Verification kit** | Bộ dụng cụ kiểm dùng chung: mẫu bài kiểm, chỗ chờ, bài phá thử. Tên dùng trong bản này, không phải từ chuẩn cố định | Chưa có, mỗi hồ sơ tự viết | Tự đặt |
| **Team model: federated** | Mô hình **đội**: các đội sản phẩm cùng góp vào hệ. Không dùng để chỉ cách chia mã | Chưa dùng | Thông lệ |

Chuẩn Design Tokens 2025.10 là báo cáo cuối của nhóm cộng đồng W3C, không phải chuẩn W3C. Nó chuẩn hoá **định dạng trao đổi**, không quy định
cách chia lớp.

Bản đồ khuôn lưu ở `design/patterns/`, nhưng theo từ chuẩn nó là **sổ đăng ký template và phần tử**. Giữ đường dẫn để khỏi đổi kit, chỉ cần
gọi đúng tên khi trao đổi.

## 3. Các tầng

Mỗi tầng trả lời đúng một câu hỏi. Quyết định đặt sai tầng là nguồn lệch.

| Tầng | Câu hỏi nó trả lời | Lựa chọn cho người dựng | Cách khoá |
|---|---|---|---|
| Foundations | Giá trị nào được dùng? | Chỉ chọn vai trò, không chọn giá trị | Lint cấm mã màu và cỡ tự đặt |
| Core components | Linh kiện này có hình gì? | Danh sách biến thể đóng | API không mở class, lint cấm nhập bản trần |
| Layout primitives, templates | Trang có những vùng nào? | Chọn một trong N khung | Kiểu đóng, bản đồ khuôn |
| Interaction patterns | Khi lưu, lỗi, trống thì sao? | Khai năng lực, không tự làm hành vi | Trạng thái dựng sẵn trong thành phần |
| Content guidelines | Nói và định dạng thế nào? | Dùng hàm và từ điển chung | Hàm định dạng duy nhất, lint từ cấm |
| Recipes | Sản phẩm này ghép gì? | Mở, trên nền core | Khai trong repo, dùng token |
| Snowflakes | Có gì thật sự riêng? | Mở, phải có lý do và hạn | Sổ ngoại lệ |

**Ranh giới quan trọng nhất: core component nhận năng lực, không nhận kiểu dáng.** Lấy bảng làm ví dụ:

```tsx
<Luoi
  cot={[
    { kieu: "nguoi", truong: "ten" },     // kiểu cột là danh sách đóng
    { kieu: "so", truong: "soCan" },      // kiểu số tự canh phải, không có tuỳ chọn canh
  ]}
  nangLuc={["chon", "suaTrenO"]}          // bật theo tên
  locRong={{ xoaLoc }}                    // thiếu thì không biên dịch được
/>
// Không có prop: rowHeight, cellBorder, className
```

Câu hỏi đổi từ «bảng này nên trông thế nào?» thành «bảng này có năng lực gì?». Câu đầu có vô số đáp án, câu sau chọn trong danh sách.

Mẫu trên chỉ minh hoạ hình dạng API, chưa dựng thử. Tên `Luoi` và các prop là ví dụ.

## 4. Bốn lớp cắt ngang

### Source of truth — machine-readable

Mỗi repo có giao diện giữ cùng một cấu trúc khai báo, để người và AI đọc cùng một nguồn:

```
design/
  tokens.json               token theo định dạng DTCG, sinh từ nguồn CSS, không viết tay
  component-registry.json   component manifest: thành phần, biến thể, mặc định
  patterns/<nhom>.md        sổ đăng ký template và phần tử (bản đồ khuôn)
  recipes/<ten>.md          mới: recipe của sản phẩm, ứng viên nâng hạng
```

Sổ lệch lọt và sổ ngoại lệ giữ như hiện nay. Mọi tệp dẫn xuất phải có bước kiểm `--check` để không thành nguồn thứ hai.

**Reference implementation cũng là một nguồn sự thật.** Trong phép đo, đó là thứ máy bám vào để ra cấu hình. Mỗi kiểu màn khai một màn mẫu chuẩn, sạch lỗi đã biết.
Sổ đăng ký template đã có chỗ khai màn mẫu; cần thêm cam kết rằng màn mẫu đạt đủ ma trận trạng thái. Ở những chỗ chưa có thành phần đóng, sửa màn mẫu là cách lan nhanh nhất.

### Distribution

- **Mã giao diện** đi qua registry riêng, kiểu shadcn: mỗi repo giữ bản mã của mình. Điểm yếu là các bản dễ trôi khỏi nguồn, nên phải có bài so
  với bản gốc.
- **Đặc tả, lược đồ, bộ kiểm** đi qua kit nghiệm thu, vốn đã có đường phát hành theo tag và đã gắn với 15 repo.
- Khi đổi API có phá vỡ: đánh phiên bản và kèm codemod hoặc hướng dẫn chuyển.

### Governance và conformance

- **Quyền đổi:** core cần duyệt ở cấp kit; recipe do repo tự quyết.
- **Ngoại lệ:** luôn có lý do và hạn. Đã có khuôn dữ liệu trong bản đồ.
- **Đo áp dụng:** tỉ lệ dùng thành phần của hệ, số snowflake, số ngoại lệ quá hạn, theo từng repo.
- **Vòng phản hồi:** mỗi lỗi audit tìm ra phải trả lời «tầng nào đáng lẽ chặn được?» và sinh luật hoặc hàng việc. Hiện sổ lệch lọt của Quỹ
  hàng 0 dòng dù đã có nhiều audit, nghĩa là vòng này đang đứt.

### Verification kit

Trong 199 lần làm lại đã ghi nhận ở Quỹ hàng từ 02/11, 55 % nằm ở bài kiểm, môi trường, ghim và gộp, và khoảng 45 % số đó là bài kiểm do AI viết mà không thể đỏ
hoặc đo sai thứ. 13 % commit cùng kỳ chỉ để ghim lại hoặc vẽ lại bản đồ. Khối giao diện đóng sẵn không chữa được phần này, nên cần lớp riêng:

- **Mẫu chờ màn sẵn sàng**, để bài kiểm không phụ thuộc thời gian tải.
- **Bài phá thử bắt buộc:** mỗi bài kiểm giao diện phải chứng minh được là đỏ khi phá đúng chỗ nó đo.
- **Môi trường kiểm cách ly** để lỗi nhiễu không bị tính thành lỗi sản phẩm.
- **Giảm điểm ghim và tệp sinh** phải làm lại sau mỗi lần gộp.

Phân loại trên do một tác tử làm từ văn bản hồ sơ, tỉ lệ chỉ để định hướng.

## 5. Thang độ chắc

| Bậc | Tên | Cơ chế | Bắt được |
|---|---|---|---|
| 1 | **Make illegal states unrepresentable** | Không có tuỳ chọn để làm sai, sai thì không biên dịch | Mọi lần, trước khi viết xong |
| 2 | **Static analysis** | Lint, kiểm kiểu, quét mã lúc commit | Mọi lần, lúc commit |
| 3 | **Runtime conformance** | Đo trên màn chạy: so ảnh, căn lề, truy cập tự động | Trên các màn có bài đo |
| 4 | **Design review** | Người hoặc AI chấm theo tiêu chí | Tuỳ người chấm |
| 5 | **Guidelines** | Chỉ là chữ trong tài liệu | Tuỳ người đọc |
| — | **Design judgment** | Quyết định thật, không tất định được | Thử với người dùng |

Nguyên tắc: **đưa mỗi quyết định về bậc có số nhỏ nhất với chi phí chấp nhận được** (bậc 1 là chắc nhất), và thừa nhận thẳng phần thuộc
phán đoán.

Bảng đích, lấy các lỗi đã gặp ở Quỹ hàng:

| Quyết định | Tầng | Bậc hiện tại | Bậc đích | Cách đạt |
|---|---|---|---|---|
| Màu | Foundations | 2 | 2 | Giữ nguyên |
| Bố cục trang | Templates | 1–2 | 1–2 | Giữ nguyên |
| Vai trò tiêu đề | Foundations, Core | 5, đang có 5 cỡ | 1 | Thành phần tiêu đề theo vai trò |
| Đầu vùng | Core | 5, có 3 kiểu trên một trang | 1 | Thành phần đầu vùng |
| Chiều cao dòng, đường kẻ | Core | 5 | 1 | Không mở prop |
| Canh cột số | Core | 5 | 1 | Kiểu cột quyết định |
| Định dạng tiền, ngày | Content | 5, 23 tệp tự gọi | 1–2 | Một hàm chung, lint cấm gọi thẳng |
| Lọc rỗng có lối thoát | Patterns | 5 | 1 | Prop bắt buộc |
| Một phần đọc hỏng | Patterns | 5 | 1 | Vùng phải khai đủ trạng thái |
| Lưu, hoàn tác, báo | Patterns | 5, thành phần chủ chưa có | 1–2 | Thanh lưu, một nơi báo |
| Không đủ quyền, xung đột khi lưu | Patterns | Chưa có | 1–3 | Thêm vào ma trận trạng thái |
| Một vùng chính, một tiêu đề cấp một | Templates | 4 | 3 | Bài đo trên màn chạy |
| Tương phản, nhãn ô, vùng chạm | Foundations, Core | 4 | 3 | Kiểm truy cập tự động |
| Lệch mép giữa các vùng | Templates | 4 | 3 | Đo căn lề, so ảnh chuẩn |
| Nhãn nút, câu lỗi | Content | 5 | 2 và 4 | Từ điển cấm, còn lại phải chấm |
| Việc chính của màn, thứ tự thông tin | Product | Phán đoán | Phán đoán | Thử với người dùng |

## 6. Chung và riêng

| Chung mọi repo, qua kit | Chung theo nền, qua registry | Riêng từng repo |
|---|---|---|
| Tên tầng và từ vựng | Core components | Giá trị token (theme) |
| Lược đồ `design/` | Layout primitives | Recipes, snowflakes |
| Danh mục interaction patterns | Bộ dựng trạng thái | Từ vựng nghiệp vụ |
| Ma trận trạng thái | Bộ định dạng số, ngày | Khuôn nhóm màn |
| Bộ kiểm, luật lint không gắn nền | Luật lint gắn nền | Mức nợ, ngoại lệ |
| Verification kit | Mẫu bài kiểm theo thành phần | Màn mẫu chuẩn của từng kiểu màn |

Bộ đọc bản đồ khuôn đã nằm ở kit. Trong 14 luật lint của Quỹ hàng, 10 luật không nhắc gì tới kho này nên có thể là ứng viên chuyển sang kit;
4 luật còn lại cần đọc kỹ. Con số này đếm bằng tìm chữ, chưa thử chạy ở repo khác.

## 7. Hiện trạng các repo

| Nhóm | Repo | Tệp giao diện | Đang có |
|---|---|---|---|
| **A. base-nova + ReUI** | onehub-quy-hang | 270 | Bản đồ khuôn 19 nhóm, bộ lint riêng, bậc M1 |
| | onehub-invest | 678 | Sinh token và registry, có bộ kiểm chuẩn giao diện, bậc M1 |
| | one-invest | 326 | Chưa thấy lưới |
| | radar | 74 | Chưa thấy lưới |
| **B. shadcn nền khác** | crm (radix-nova, có gói UI riêng) | 1.211 | Chưa thấy lưới của kit |
| | OpenMAIC (radix-vega) | 432 | Chưa thấy lưới |
| | artifact-platform (base-nova, không ReUI) | 306 | Bậc M1 |
| | oneflow (new-york) | 197 | Chưa thấy lưới |
| **C. Giao diện nhỏ, không shadcn** | media-library, map, onehub-render-service | 18–24 | Chưa thấy lưới |
| **D. Không thấy tệp giao diện** | aes, artifact-platform-design, floorplanstudio, invest | 0 | Không áp hoặc cần xem lại. Đếm chỉ tính `tsx`, `vue`, `svelte` |

Nhóm A là nơi chung được linh kiện. Nhóm B chung đặc tả và bộ kiểm, linh kiện chỉ chung khi đổi nền. Nhóm C chỉ cần tầng Foundations và luật
cơ bản.

Mỗi repo chỉ đi tới mức nó cần:

| Mức | Có gì | Áp cho |
|---|---|---|
| **L1 Foundations** | Token, lint màu và cỡ | Mọi repo có giao diện |
| **L2 Core** | Manifest, API đóng, lint cấm bản trần | A, B |
| **L3 Templates và patterns** | Sổ đăng ký, ma trận trạng thái | A, B có nhiều màn |
| **L4 Conformance** | So ảnh, truy cập, căn lề trên màn chạy | Sản phẩm có người dùng thật |
| **L5 Phản hồi** | Đo áp dụng, audit sinh luật, nâng hạng | Nhóm A |

Bậc M0–M3 của kit chỉ đo token và registry, nên chỉ phủ một phần L1–L2. Khi đưa thang này vào kit cần quyết giữ hai thang hay gộp.

## 8. Đường nâng hạng

Theo Frost, recipe có thể lên core hoặc ở lại sản phẩm, cả hai đều ổn. Không nên viết core từ đầu theo suy đoán.

Điều kiện lên core:

1. Được dùng thật ở ít nhất hai repo, hoặc hai màn khác loại trong một repo.
2. API đã đóng: không còn prop kiểu dáng.
3. Có bài kiểm cho các trạng thái trong ma trận.
4. Có hướng dẫn chuyển cho chỗ đang dùng bản cũ.

**Luật ba lần:** thứ gì lặp từ ba lần trở lên và khác nhau vô cớ thì nâng thành recipe hoặc core. Ứng viên đầu: lưới dữ liệu, đầu vùng,
định dạng số và tiền.

## 9. AI dựng giao diện

Các repo gắn kit phát triển qua vòng nghiệm thu có AI viết mã, nên kiến trúc phải viết cho cả người đọc là máy:

- **Thừa nhận AI chép màn gần nhất.** Khi không có câu trả lời đóng, máy lấy cấu hình từ màn giống nhất. Mỗi kiểu màn cần trỏ rõ tới một màn mẫu chuẩn, để máy không tự chọn nhầm màn còn lỗi.
- **Đổi thứ tự của thang dùng lại.** Hiện mỗi ô của màn chọn khối hợp nhất cho riêng nó, đó là gốc của việc hai màn có hai bảng. Thang mới:
  màn mẫu chuẩn và recipe của repo → core → rồi mới tới kho khối ReUI. Kho khối là nguyên liệu, không phải đích đến.
- **AI đọc manifest** để biết có gì và được chọn gì, thay vì đoán.
- **Lint báo ngay lúc viết**, thay vì chờ tới lúc chấm.
- **Tách luật đúng sai khỏi phán đoán.** Luật đúng sai vào bộ kiểm. Phán đoán thì để AI đề xuất và người duyệt ở cổng.

Báo cáo trong ngành cũng đi hướng này: monday.com cho AI gọi công cụ tra hệ thay vì dựa vào lời nhắc, Indeed tách luật đúng sai khỏi phán đoán.
Hai ca này mới đọc qua tóm tắt.

## 10. Lộ trình đề xuất

| Chặng | Việc | Xong khi |
|---|---|---|
| **0. Màn mẫu chuẩn** | Làm sạch Liên hệ (hàng `hai-bang-mot-nep`, cộng tiêu đề cấp một và câu lỗi), khai làm mẫu của kiểu màn danh sách | Chạy lại phép đo ba tác tử, không còn mang sáu lỗi đã thấy |
| **1. Verification kit** | Mẫu chờ màn sẵn sàng, bài phá thử bắt buộc, giảm điểm ghim | Tỉ lệ làm lại do bài kiểm và hạ tầng giảm rõ so với mức 55 % |
| **2. Thử ở một nơi** | Dựng lưới có API đóng cho Bảng hàng và Liên hệ, thêm nhóm phần tử «Lưới», mẫu hồ sơ cạnh bảng và chia trang | Hai bảng trùng công thức dòng, không còn cấu hình riêng trong màn, 2 màn dùng API đóng mà không thêm prop kiểu dáng; số mục tự đoán giảm khi đo lại |
| **3. Đo trước khi rút** | Nối hai lưới còn lại của kit ở chế độ chỉ báo trên ba màn | Biết máy bắt được bao nhiêu phần trăm lỗi audit, và độ nhiễu |
| **4. Rút vào kit** | Đưa lược đồ `design/`, danh mục pattern, ma trận trạng thái, các luật lint không gắn kho vào kit | Một repo khác cài kit và chạy được mà không chép tay |
| **5. Repo thứ hai** | Đưa lưới sang onehub-invest hoặc radar, chạy đường nâng hạng lần đầu | Lưới thành core thật, repo đầu dùng lại từ nguồn chung |
| **6. Mở rộng theo mức** | Áp L1–L3 cho nhóm A rồi nhóm B | Có bảng độ phủ theo repo |

Chặng 0, 2 và 3 làm được ngay ở Quỹ hàng, mỗi chặng là một hàng riêng. Chặng 1 và từ chặng 4 trở đi thuộc phạm vi phát hành của kit.

## 11. Rủi ro và điều không làm

| Rủi ro | Cách giữ |
|---|---|
| Màn mẫu mang lỗi, mọi màn sau chép theo | Màn mẫu phải đạt đủ ma trận trạng thái, sửa lỗi ở màn mẫu trước |
| Core phình thành một cục ôm mọi thứ | Core giữ cấu hình, kiểu và trạng thái. Cuộn ảo, sửa trên ô gắn từ ngoài |
| Tệp token thành nguồn thứ hai | Sinh tự động và có bước kiểm. onehub-invest đã có mẫu làm việc này |
| Bản mã giữa các repo trôi khỏi nhau | Bài so với nguồn trong bộ kiểm |
| Khoá quá chặt, sản phẩm không khác được nhau | Recipe luôn mở, và ngoại lệ là đường hợp lệ |
| Ngoại lệ tăng dần, luật thành hình thức | Ngoại lệ có hạn, đo số quá hạn theo repo |
| Máy báo xanh nên tưởng là tốt | Báo cáo tách rõ «đúng hệ» và «đã thử với người dùng» |
| Một phiên bản kit làm hỏng nhiều repo | Ghim theo tag, nâng từng repo |

**Không làm:** một gói giao diện duy nhất cho mọi repo; đổi nền của repo chỉ để khớp hệ; hàng dọn riêng cả app (đã chốt ở Quỹ hàng); so ảnh
tự động trước khi tầng hành vi đứng vững; viết core theo suy đoán khi chưa có hai nơi dùng.

## Nguồn

- Brad Frost, [The art of design system recipes](https://bradfrost.com/blog/post/the-art-of-design-system-recipes/) — core, recipes, product, snowflakes, nâng hạng.
- Brad Frost, [Atomic Design, chương 2](https://atomicdesign.bradfrost.com/chapter-2/) — năm cấp, templates và pages.
- W3C Design Tokens Community Group, [Technical Reports 2025.10](https://www.designtokens.org/tr/2025.10/) · [FAQ](https://www.designtokens.org/faq/).
- shadcn, [Registry](https://ui.shadcn.com/docs/registry).
- Spotify Engineering, [How we use Golden Paths](https://engineering.atspotify.com/2020/08/how-we-use-golden-paths-to-solve-fragmentation-in-our-software-ecosystem/).
- Yaron Minsky, [Effective ML Revisited](https://blog.janestreet.com/effective-ml-revisited/).
- [Primer, UI patterns](https://primer.style/product/ui-patterns/) · Atlassian Foundations — đã đối chiếu ở lượt rà soát 09/11.
- Chỉ đọc tóm tắt tìm kiếm: [Indeed](https://www.designsystemscollective.com/fully-machine-readable-design-systems-3d43329ec3e3) · [monday.com](https://engineering.monday.com/?p=11682) · [Storybook manifest](https://tympanus.net/codrops/2025/12/09/supercharge-your-design-system-with-llms-and-storybook-mcp/) · [Governance](https://gravitee.io/corpus/gen-1683/design-system/governance-and-contribution-model-for-scaling-a-design-system-across-product-teams.html).
- Trong kho: `docs/plan/dong-nhat-bang-hang-lien-he.md`, `docs/adr/0024-he-bo-cuc.md`, `design/patterns/`, `packages/ui-lint/`.
