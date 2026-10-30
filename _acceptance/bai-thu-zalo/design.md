# Thiết kế — bài thử Zalo (hàng 3)

Ngày 30/10/2026 · dãy T · đợt nen-dau · hạng T2

## Câu hỏi bài thử trả lời

Kiến trúc §9 bước 1 (c): trang khách và luồng Gửi phải đứng trên hành vi thật của Zalo. Bốn vế của ngưỡng sống
(`opportunity.md`):

1. Link trang khách dán vào Zalo trên **Android** và **iPhone** hiện ảnh xem trước.
2. Lượt Zalo tự lấy trang hay ảnh để dựng xem trước **không vào số mở**; khách bấm mở thì vào.
3. Trên **iPhone**, web chia sẻ được **ảnh + tin** sang Zalo qua bảng chia sẻ của máy.
4. Trên **máy tính**, kéo (hoặc dán) ảnh từ Zalo máy tính vào trình duyệt được.

Bài thử kết bằng số đo trong `ket-qua.md` và một ADR mới (luật đợt 5) chọn cách làm cho trang khách thật.

## Cách làm

Một máy chủ Node thuần, không phụ thuộc gói ngoài, nằm trong `_acceptance/bai-thu-zalo/thu/` (luật đợt 5: mã thử
không thành mã sản phẩm). Zalo không quan tâm khung dựng trang — nó đọc thẻ trong HTML trả về — nên máy chủ thuần trả lời
đúng câu hỏi mà không chạm `apps/web`.

| Đường | Làm gì | Ghi vào nhật ký |
| --- | --- | --- |
| `GET /s/<mã>` | Trang mẫu dựng sẵn ở máy chủ: thẻ Open Graph đủ (`og:title`, `og:description`, `og:image` URL tuyệt đối, `og:url`, `og:type`, `twitter:card`), nội dung mẫu nhãn «Mẫu». Một đoạn JS nhỏ báo «đã mở» về máy chủ, và hỏi người thử ba câu bằng nút | `tai-trang` (mã, UA, lớp, đầu yêu cầu prefetch) |
| `GET /og/<mã>.png` | Ảnh xem trước PNG 1200×630, dựng bằng zlib của Node | `tai-anh` |
| `POST /mo` | Lượt báo từ JS: chỉ có khi trình duyệt thật chạy trang | `mo` (tính hay bị loại, vì sao) |
| `GET /chia-se` | Nút «Gửi ảnh + tin»: `navigator.share` với tệp nếu `canShare({files})`; không thì link + tin; không có thì báo | `chia-se` (kết cục) |
| `GET /keo-anh` | Ô thả + dán ảnh; hiện ảnh nhận được | `nhan-anh` (kiểu, cỡ, các kiểu của DataTransfer) |
| `POST /ghi` | Câu trả lời của người thử bấm trên trang | `quan-sat` |
| `GET /dem` | Bảng đếm theo mã (JSON) | — |

**Hai thước cho «lượt mở»**, ghi song song để ADR chọn trên số chứ không đoán trước:

- *Thước JS*: một lượt mở = một lượt báo từ JS của trang, khác phiên, UA không thuộc lớp máy. Máy lấy xem trước không
  chạy JS nên không bao giờ báo.
- *Thước UA*: mọi lượt tải trang, trừ UA thuộc lớp máy. Bài thử đo xem máy của Zalo có tự xưng là máy hay mạo trình duyệt.

Lớp máy (`phanLop`): UA chứa `bot`, `crawler`, `spider`, `preview`, `facebookexternalhit`, `curl`, `wget`, `python-`,
`node-fetch`, `headless`; hoặc đầu yêu cầu `purpose`/`sec-purpose` mang `prefetch`. Danh sách này là điểm khởi đầu —
nhật ký phiên thật cho biết UA của Zalo để ADR bổ sung.

**Một lệnh chạy** (`node _acceptance/bai-thu-zalo/thu/chay.mjs`): máy chủ ở cổng 3463 (cổng của dãy T, luật đợt 7), mở
đường hầm công khai — `cloudflared` nếu có, không thì `ssh` tới localhost.run — in ba link mã mới (A cho Android, I cho
iPhone, K là link «chỉ dán, không bấm») cùng link trang chia sẻ, trang kéo ảnh và các bước; nhật ký ở
`.acceptance-runs/bai-thu-zalo/thu-<giờ>/nhat-ky.jsonl` (ngoài kho, `.gitignore` đã chặn). IP không ghi thô: băm kèm
muối của lượt chạy. `Ctrl+C` ghi `tom-tat.json`. Cờ `--khong-ham` chạy chỉ trên máy.

Sau phiên với Zalo thật: `tom-tat.mjs` đọc nhật ký, bỏ băm IP, ghi bản sạch `nhat-ky-zalo.jsonl` vào hồ sơ và in bảng đếm
giữa hai mốc `<!-- dem -->` của `ket-qua.md`. Bài kiểm khớp bảng trong `ket-qua.md` với nhật ký — số trong kết quả là số
máy tính ra, không chép tay.

## Không gian đã quét (morphological-scan, preset test-matrix)

Chân sản phẩm: Kiến trúc §1, §7, §9 [SUY-TỪ-REPO: docs/architecture/kien-truc-repo-va-stack.md], Tham chiếu dòng 40, 46
[SUY-TỪ-REPO: docs/product/tham-chieu.md]. Chân ngành: giao thức Open Graph (ogp.me) [NGÀNH: Open Graph protocol]; máy
lấy xem trước tự xưng UA như `facebookexternalhit`, `Slackbot-LinkExpanding` [NGÀNH: Facebook Sharing Debugger, Slack
unfurl]; chia sẻ tệp từ web [NGÀNH: W3C Web Share API Level 2, `canShare`]; kéo thả và dán [NGÀNH: HTML Drag and Drop,
Clipboard API].

- Trục A — bề mặt: Zalo Android · Zalo iPhone · Zalo máy tính · Safari iPhone [thước CE: Kiến trúc §7 bảng giới hạn]
- Trục B — hành vi: xem trước link · mở link · chia sẻ ra · nhận ảnh vào [thước CE: bốn vế `bat_khi` của hàng 3]
- Trục C — ai gọi trang: máy Zalo lấy xem trước · người mở trong trình duyệt của Zalo · prefetch/quét link · máy khác
  [thước CE: ngành Open Graph crawlers; UA của Zalo chưa biết — nhật ký phiên thật là thước]
- Trục D — kết cục: đạt · không đạt · không hỗ trợ có đường lui [thước CE: Web Share API `canShare`]

Core: Android·xem trước · iPhone·xem trước · (Android, iPhone)·mở × (máy lấy không tính, người tính, prefetch không tính)
· Safari iPhone·chia sẻ ảnh+tin · Zalo máy tính→trình duyệt·kéo/dán. Later: chia sẻ trên Android (Kiến trúc §7 đã
ghi «Được»), xem trước trên Zalo máy tính, web đã cài trên iPhone so với Safari, nhận ảnh trên Android qua web đã cài.
Never: gửi tin qua Zalo hộ người (bất biến 3), Zalo OA (Kiến trúc §8: để sau, quyết riêng).

## Ngoài phạm vi

- Trang khách thật trong `apps/web/src/app/s/**` — dựng ở hàng dựng sau ADR, không ở bài thử.
- Chia sẻ trên Android, xem trước trên Zalo máy tính, web đã cài trên iPhone — Later ở trên.
- Đăng nhập, đọc hay gửi tin Zalo; Zalo OA.

## Bỏ có tên

- Không chạy nghi thức design-pass và không viết Đặc tả UX: ba trang thử là dụng cụ đo cho người thử bấm, không phải màn
  sản phẩm; màn trang khách thật đi tầng 5 (`docs/design/vo-va-ia.md`).
