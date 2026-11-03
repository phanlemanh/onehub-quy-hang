# Luật ẩn và bộ kiểm rò rỉ — thiết kế (hàng 31, dãy H)

Hàng 31 của lộ trình (`docs/plan/lo-trinh.json`, mã phạm vi K1, đợt `dau-khach-nhap`): mọi cửa ra lấy dữ liệu từ một bộ
luật ẩn ở lõi, và bộ kiểm rò rỉ chứng không trường nội bộ nào có trong trang khách, kể cả trong mã nguồn trang; luật ẩn phủ
cả liên hệ (mọi liên hệ không ra ngoài) và ngăn ảnh (chỉ ngăn Gửi được ra). Đứng trên hàng 11 (lớp trường nguồn), 18 (ảnh
ba ngăn), 85 (liên hệ). Hạng T3 theo lộ trình: chạm bất biến 2 và 4, thêm một kiểm bắt buộc vào CI.

Căn cứ đã chốt: bất biến 4 (`AGENTS.md`); Tham chiếu luật 23 («Mọi cửa ra dùng chung một bộ luật ẩn; thêm cửa mới là nối
vào bộ luật đó»), luật 24 (khách riêng ẩn mã căn, nhóm môi giới hiện đủ), luật 26 (căn đã cọc tự mờ), §7 (trường riêng
không lên trang khách), §13 (hiện «giá xác nhận X ngày trước»); Kiến trúc §2 («một hàm duy nhất quyết định trường nào được
ra ngoài»), §5 và §8 (bộ kiểm rò rỉ là kiểm bắt buộc, «kể cả trong mã nguồn trang»); ADR-0018 quyết định 6 (bộ kiểm chạy
trên cấu hình mở nhất); Sổ điểm biến thiên A4 (#12 `customer_page.show_confirmed_age`, #13
`customer_page.private_hides_unit_number`); `packages/core/src/data-classes.ts` (mỗi trường đúng một lớp, trần của lớp).

Không có màn: hàng này là lõi và CI. Trang khách (35), luồng Gửi (34), Phát hàng (43) dựng sau, trên hàm này.

## 1. Một hàm cho mọi cửa ra

```
packages/core/src/redaction/            nhập qua @quy-hang/core/redaction
  cua-ra.ts       CUA_RA (gui_link · gui_anh_tin · phat_hang) · NGUOI_NHAN (khach_rieng · nhom_moi_gioi)
                  · THU_MUC_CUA_RA (thư mục mã của từng cửa ở apps/web)
  lop-truong.ts   CanNoiBo (bản đầy đủ của một căn trong sàn) · LOP_TRUONG: mỗi khoá một lớp dữ liệu
  ban-ra.ts       banRaNgoai(can, { cua, nguoiNhan, cauHinh, today }) → CanRaNgoai · TRUONG_RA[nguoiNhan]
                  · CAU_HINH_MAC_DINH · CAU_HINH_MO_NHAT · bangTang()
  kiem-ro-ri.ts   timRoRi(vanBan, moi) → RoRi[] · kiemBanRa(hamBanRa) · kiemBangLop(bang)
  moi.ts          canMoi(): bản vào mà mọi trường không được ra mang một giá trị mồi riêng · giaTriMoi(can)
```

- **Danh sách được ra (allowlist), không danh sách chặn.** `banRaNgoai` dựng bản ra bằng cách chép đúng các khoá trong
  `TRUONG_RA[nguoiNhan]`; khoá nào của bản vào không có trong danh sách thì không bao giờ ra — kể cả khoá thêm sau này.
  Danh sách chặn thì trường mới chưa ai xếp lớp sẽ ra mặc định: hỏng mở, trái bất biến 4.
- **Ba cửa, một hàm.** `cua` chỉ để ghi và để hàng sau chọn mẫu; luật không rẽ theo cửa. Cửa mới (Đăng Platform…) là
  thêm một giá trị vào `CUA_RA` — không viết luật riêng (luật 23).
- **Người nhận đổi tập trường, không đổi trần.** Khách riêng và nhóm môi giới đều chỉ thấy lớp có trần `external` hoặc
  `by_agreement`; khác nhau ở vị trí căn (mục 3).
- **Cấu hình là tham số** (ADR-0018 quyết định 2): `cauHinh = { showConfirmedAge, privateHidesUnitNumber }`, mặc định
  đúng sổ (#12 có, #13 có). Lõi không đọc `company_settings`; API đọc rồi truyền vào. Cấu hình chỉ chọn cách hiện **trong
  trần**: không khoá nào làm một trường nội bộ ra ngoài.
- **`TRUONG_RA` là thực đơn của mẫu.** Mẫu phát hàng (#26) và mẫu bài theo kênh (#27) chỉ chọn cột, chỗ điền trong danh
  sách này — hàng 43, 50 đọc nó, không tự liệt kê trường.

## 2. Bảng lớp trường — bản vào

`CanNoiBo` gom mọi thứ một cửa ra có thể cầm trong tay khi dựng trang. `LOP_TRUONG` khai lớp cho TỪNG khoá bằng kiểu
`Record<KhoaCanNoiBo, DataClass>` — thiếu khoá là lỗi kiểu; bài kiểm còn so khoá thật của một bản `canMoi()` với bảng (bắt
khoá thêm qua `as` hay qua dữ liệu chạy).

| Nhóm | Khoá | Lớp | Ra ngoài |
|---|---|---|---|
| Căn (danh mục) | `buildingName`, `livingArea`, `bedroomsTotal`, `directionFaces`, `propertyType`, `propertySubType` | catalog | có |
| Vị trí căn | `unitNumber`, `upi`, `stack`, `floor`, `buildingFloorsTotal` | catalog | theo người nhận (mục 3) |
| Lần rao | `standardStatus`, `listPrice`, `feeInclusion`, `furnished`, `legalStatus`, `financing`, `occupantType`, `lastConfirmedAt` | shareable_listing | có, qua phép đổi ở mục 4 |
| Người gửi | `companyName`, `senderName` | shareable_listing | có (trang khách mang tên sàn và người gửi) |
| Ảnh | `photos` | shareable_listing (ảnh) · source (ngăn Nội bộ) | chỉ qua `anhRaNgoai` của hàng 18 |
| Giao dịch | `closePrice`, `closeDate` | transaction | không (thoả thuận có điều khoản riêng, không có ở cửa khách) |
| Nội bộ | `withdrawnReason`, `version`, `holderUserId`, `holderName` | company_internal | không |
| Trường riêng | `customFields` | custom_field | không (Tham chiếu §7; bật từng trường khi phát hàng là hàng 43/47) |
| Nguồn | `ownerName`, `ownerPhone`, `floorPrice`, `titleDeedPhoto` | source | không bao giờ |
| Liên hệ | `contacts` | source | không bao giờ — mọi liên hệ, kể cả liên hệ chỉ là Người mua |

Luật kiểm của bảng (`kiemBangLop`): mọi khoá của `TRUONG_RA` của mọi người nhận phải có lớp mà trần là `external` hay
`by_agreement`. Ai thêm `holderName` hay `customFields` vào danh sách được ra thì bài kiểm đỏ, nêu tên trường và lớp — ca
đỏ đủ năm lớp không ra (`company_internal`, `custom_field`, `transaction`, `behavior`, `source`).

Không hai nguồn sự thật: khoá nào đã có lớp ở bảng gốc của lõi thì `LOP_TRUONG` phải trùng — `OWNER_FIELDS` và
`SOURCE_KEYS` (hàng 11: chủ nhà, số, giá đáy, ảnh sổ → `source`), `COMPARTMENT_CLASS` (hàng 18: ngăn ảnh). Bài kiểm đọc các
bảng gốc ấy chứ không chép tay; bảng gốc đổi lớp một khoá mà `LOP_TRUONG` không đổi thì đỏ, nêu khoá. Khoá chưa có bảng gốc
nào (vị trí, lần rao, người giữ, người gửi) lần đầu được xếp lớp ở đây.

## 3. Vị trí căn theo người nhận (luật 24)

| Người nhận | `unitNumber` | `upi` | `stack` | `floor` | `floorBand` | `buildingName` |
|---|---|---|---|---|---|---|
| Khách riêng, mặc định (#13 bật) | — | — | — | — | «high» / «low» | có |
| Khách riêng, sàn tắt #13 | có | có | có | có | — | có |
| Nhóm môi giới | có | có | có | có | — | có |

`floorBand` (Hỏi-1): `floor > buildingFloorsTotal / 2` → `high`, còn lại `low`; thiếu số tầng toà (danh mục chưa có) →
`null`, trang chỉ hiện toà. Nhãn chữ «Tầng cao», «Tầng thấp» là việc của trang (35).

Đặc điểm căn với khách riêng (Hỏi-3): luật 24 chỉ nói vị trí, không nói đặc điểm. Diện tích, phòng ngủ, hướng cộng nấc
tầng có thể đủ để khách khớp ra một trục của toà. Hợp đồng viết theo khuyến nghị: khách riêng thấy `livingArea`,
`bedroomsTotal`, `directionFaces`, `propertyType`, `propertySubType`, `furnished`, `legalStatus`, `occupantType`,
`financing` nguyên giá trị — `TRUONG_RA.khach_rieng` là danh sách viết trước mà bài kiểm so nguyên văn.

## 4. Trạng thái, giá, độ tươi (luật 25–26, §13)

Bảng theo khuyến nghị Hỏi-4:

| `standardStatus` | `availability` | `listPrice`, `feeInclusion` | `confirmedAgeDays` (#12 bật) |
|---|---|---|---|
| Active | `available` | có | `freshness(lastConfirmedAt, today).ageDays` |
| Pending | `under_contract` (trang làm mờ) | có | như trên |
| Hold | `paused` (tạm ngưng — link sống, mở lại thì về `available`) | — | — |
| Closed, Withdrawn, Incomplete | `unavailable` | — | — |

Tuổi xác nhận dùng lại đúng hàm `freshness` của lõi hàng (ngày lịch UTC, `today` truyền vào) — trang khách và bàn làm
việc ra cùng một số. Bản ra không mang `standardStatus` thô, không mang mốc giờ `lastConfirmedAt` (chỉ số ngày), không mang
`closePrice`, `closeDate`, `withdrawnReason` ở bất kỳ trạng thái nào. #12 tắt → không có `confirmedAgeDays`.

## 5. Bộ kiểm rò rỉ

**Mồi.** `canMoi()` dựng một bản vào mà mọi trường không được ra với người nhận đang xét mang một giá trị riêng, không
trùng chữ nào khác của bản (chữ có dấu tiếng Việt, số điện thoại dạng `0900 000 0xx`, số tiền mười chữ số, mã ảnh nội bộ,
tên liên hệ `[Tên] …`). `giaTriMoi(can, nguoiNhan, cauHinh)` liệt kê cặp (trường, giá trị) không được xuất hiện. Không dữ
liệu thật (`AGENTS.md`).

**Quét văn bản, không chỉ khoá.** `timRoRi(vanBan, moi)` nhận chuỗi bất kỳ — JSON của bản ra, HTML của trang, tin soạn
sẵn, dòng CSV — vì rò có thể nằm trong giá trị ghép hay trong mã nguồn trang, nơi không còn khoá nào. Trước khi so, chuỗi
được đưa về các dạng: giải thực thể HTML (`&#7889;`, `&#x1ED1;`, `&amp;`), giải thoát JSON (`ố`), giải mã URL
(`%E1%BB%91`), chuẩn Unicode NFC và NFD, chữ thường. Số điện thoại so trên dãy chữ số, dùng lại `normalizePhone` của hàng 11 —
sáu cách viết đều trúng: liền, cách, chấm, gạch, `+84`, `84`; số tiền so trên dãy chữ số (bỏ dấu chấm, phẩy, cách ngăn
nghìn). Mỗi lần trúng trả (trường, dạng mã hoá) để thông điệp đỏ gọi tên.

**Ba lớp kiểm, mỗi lớp hai chiều trên cùng mồi.**
1. Bảng lớp (`kiemBangLop`) — vật lành xanh; bản sao bảng thêm khoá nội bộ vào danh sách được ra → đỏ nêu khoá.
2. Bản ra (`kiemBanRa`) — chạy hàm ra trên mồi ở 3 cửa × 2 người nhận × 4 cấu hình (gồm `CAU_HINH_MO_NHAT`), quét JSON:
   hàm thật → 0 lần trúng; đối chứng dương: quét chính bản vào → trúng đủ mọi mồi; bản sao hàm ra cố tình chép
   `ownerPhone` (hay `holderName`, hay `unitNumber` cho khách riêng) → đỏ nêu trường.
3. Văn bản (`timRoRi`) — mỗi dạng mã hoá một cặp: mồi được nhúng ở dạng ấy → trúng, gọi tên dạng; cùng văn bản không mồi →
   không trúng.

**Mã nguồn trang và cửa ra sau này.** Hàng này chưa có trang. Rào `cua-ra.test.ts` đọc cây `apps/web/src/app/` và
`packages/api/src/public/` (chỗ dành cho route công khai của trang khách), tính đường URL của từng `page.tsx`/`route.ts`
sau khi bỏ nhóm route (`(app)`, `(khach)`…), và coi là cửa ra mọi trang có URL bắt đầu bằng một tiền tố trong
`TIEN_TO_CUA_RA` (`/s/`, `/shares/new`, `/exports`, `/api/v1/public/`). Mỗi cửa ra phải có, trong cùng thư mục hay thư
mục cha tới gốc của cửa, một tệp `*.ro-ri.test.ts(x)` mà mã của nó gọi cả `canMoi` và `timRoRi` — tệp ấy dựng trang trên
mồi rồi quét mã nguồn trang. Thiếu → đỏ, nêu URL và tệp trang. Quan hệ «trang dựng từ `banRaNgoai`» không đo bằng chuỗi:
trang đi vòng luật ẩn mà cầm giá trị nội bộ thì chính lượt quét mồi trên mã nguồn trang đỏ. Hôm nay chưa cửa nào có trang
nên rào xanh; chiều đỏ đo trên cây mẫu dựng trong thư mục tạm.

## 6. CI và rào

- Script gốc `test:ro-ri` = chạy `packages/core/src/redaction/**/*.test.ts` cùng mọi `apps/web/src/**/*.ro-ri.test.ts(x)`.
- Job `ro-ri` trong `.github/workflows/ci.yml` (cài, chạy `npm run test:ro-ri`), thêm vào `needs` của `ci-ok` và `deploy`
  như `isolation` — đỏ thì không vào `main`, không phát hành. `AGENTS.md` câu «check bắt buộc» thêm `ro-ri`.
- `eslint.config.mjs`: bỏ qua `.acceptance-runs/**` (commit `b324429`, yêu cầu G-0311-6 của giám sát) — thư mục đợt chỉ
  có trên máy, git bỏ qua, nhưng lint cả cây quét bộ lõi đợt trong đó và làm hook đẩy đỏ.
- Không migration: luật ẩn là hàm thuần của lõi; lớp `source` đã bị chặn thêm ở cơ sở dữ liệu từ hàng 11, 13. Số 022 giữ
  chỗ vẫn để trống.

## 7. Đối chiếu ngành

| Năng lực | RESO | Sản phẩm (Đối chiếu ngành §1, §7, §8) | Ta định làm | Ta viết cứng — họ cho cấu hình |
|---|---|---|---|---|
| Trường nào ra công khai | Trường riêng tư tách khỏi trường công khai (`PrivateRemarks`, `ShowingInstructions` ↔ `PublicRemarks`); mỗi ảnh mang `Media.Permission` (Public, IDX, VOW, Agent Only) — [dd.reso.org Media](https://dd.reso.org/DD2.0/Media/) | BoomTown: website IDX chỉ hiện trường MLS cho phép (chi tiết **chưa kiểm**, [Consumer Website](https://boomtownroi.com/features/consumer-website/)); KW Command: Collection gửi khách (trường hiện **chưa kiểm**, [Saved Search vs Collection](https://answers.kw.com/hc/en-us/articles/360057912834-Saved-Search-vs-Collection)) | Danh sách được ra theo lớp ở lõi | **Có**: MLS/thành viên đặt quyền từng ảnh, từng payload; ta khoá tập trường theo trần lớp → Hỏi-2 |
| Quyền từng ảnh | `Media.Permission` theo từng ảnh | — | Ngăn ảnh do đầu chủ chọn (hàng 18) — đã là dữ liệu | Không |
| Vị trí căn với khách | Không định nghĩa | Không kiểm được ở sản phẩm Mỹ (MLS hiện địa chỉ đầy đủ) | Khách riêng ẩn mã căn, hiện toà + tầng cao/thấp (luật 24) | Ngưỡng tầng cao/thấp → Hỏi-1 |
| Cách hiện trên trang khách | — | Lofty, BoldTrail: theo dõi mở, bấm (§8) | Hai khoá #12, #13 của sàn | Không — đã là cấu hình |

## 8. Lựa chọn chỉ người có (lên thẻ Cổng Phạm vi)

- **Hỏi-1 — Tầng cao / thấp tính thế nào.** Khuyến nghị: tầng ở nửa trên số tầng của toà (theo danh mục) là «Tầng cao»,
  còn lại «Tầng thấp»; danh mục không biết số tầng toà thì trang chỉ hiện toà. Đặt ở một hằng có tên trong lõi; mở thành
  khoá sổ khi sàn đầu tiên xin. Lối khác: ba nấc thấp / trung / cao — trái chữ luật 24 «cao / thấp»; ngưỡng cố định (tầng
  10) — sai với toà thấp tầng.
- **Hỏi-2 — Tập trường được ra là cứng ở lõi hay sàn chỉnh.** Khuyến nghị: giữ cứng theo trần lớp (lý do «bất biến» —
  bất biến 2, 4); sàn chỉ chọn cách hiện trong trần qua sổ (#12–#14) và mẫu (#26, #27). Lối khác: cho sàn tắt bớt trường
  được ra (ẩn hướng, ẩn tình trạng pháp lý…) — thêm một khoá sổ kiểu «chọn trong thực đơn», chỉ được bớt, không được thêm;
  làm được ở hàng sau mà không đổi bộ kiểm.
- **Hỏi-3 — Khách riêng thấy đặc điểm căn tới đâu.** Khuyến nghị: thấy nguyên diện tích, phòng ngủ, hướng, loại hình,
  nội thất, pháp lý, tình trạng sử dụng, tài chính — khách cần để chọn căn; ẩn mã căn là chặn tra mã chính xác, link mang
  tên sàn và người gửi. Lối khác: làm tròn diện tích (tới 5 m²) và ẩn hướng khi có nấc tầng — khách khó khớp ra trục,
  nhưng mất thông tin khách hay hỏi đầu tiên.
- **Hỏi-4 — Tình trạng và giá theo trạng thái.** Khuyến nghị bảng mục 4: Đang giao dịch giữ giá (mờ) để đầu khách gợi căn
  thay cùng tầm giá (hàng 36); Tạm ngưng tách khỏi «không còn» vì có thể mở lại; các trạng thái không bán ẩn giá. Lối khác:
  ẩn giá căn đã cọc (khách không dùng giá ấy mặc cả căn khác); hoặc gộp Tạm ngưng vào «không còn» (ít chữ hơn trên trang).

## Đặc tả UX

Không có: hàng này không chạm giao diện (sổ quyết định, dòng «bỏ đặc-tả-UX»).
