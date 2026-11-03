# Luật ẩn và bộ kiểm rò rỉ — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Một hàm lõi `banRaNgoai` dựng mọi dữ liệu ra ngoài sàn theo danh sách được ra, cùng bộ kiểm rò rỉ (mồi + quét
văn bản) chạy thành job CI bắt buộc `ro-ri`.

**Architecture:** Mô-đun thuần `packages/core/src/redaction/` (không I/O trừ rào cửa ra đọc cây thư mục): bảng lớp của bản
vào, danh sách được ra theo người nhận, hàm ra, mồi, máy quét văn bản. Job CI chạy `npm run test:ro-ri` gồm bài của mô-đun
và mọi `*.ro-ri.test.ts(x)` của cửa ra sau này.

**Tech Stack:** TypeScript chặt, `node --import tsx --test`, ESLint 9, GitHub Actions.

**Spec:** `_acceptance/luat-an-va-kiem-ro-ri/design.md` · hợp đồng `contract.md` (duyệt 03/11) · bộ đo `evals.yaml`.

## Global Constraints

- Code, tên khoá tiếng Anh theo RESO khi có (`unitNumber`, `livingArea`…); comment nghiệp vụ tiếng Việt; tên hàm Việt không
  dấu như phần còn lại của lõi (`anhRaNgoai`, `kiemTepAnh`).
- Không dữ liệu thật: mồi dùng `[Tên] …`, số `0900 000 07x`.
- Lõi không đọc đồng hồ: `today` (`YYYY-MM-DD`) truyền vào; tuổi xác nhận = `freshness(lastConfirmedAt, today).ageDays`.
- Không chạm `data-classes.ts`, `agreements.ts`, migration, `package-lock.json`. Tệp ngoài vùng chỉ đúng các dòng giám sát
  duyệt ở H-1, H-2 (thêm dòng; `config.yaml` đúng hai khoá; `eslint.config.mjs` đúng hai dòng của `b324429`).
- Mỗi phép đo mới đi kèm cặp hai chiều trên cùng mồi, thông điệp đỏ ghim tên trường / dạng / URL.

## Review Focus

1. Mồi số tiền 10 chữ số trùng một số khác trong bản ra (diện tích × 1000, mã ảnh có số) → báo rò oan. Mồi chọn dãy số
   không xuất hiện ở trường được ra; bài E3 dương/âm bắt.
2. Văn bản có số ngắn (tầng 12, 2 PN) → không được coi là mồi; ca «12» không trúng (E8).
3. Căn chưa có danh mục (`floor`, `buildingFloorsTotal` null; `livingArea` null) → bản ra bỏ khoá null? Quy ước: khoá có
   trong danh sách vẫn ra với giá trị `null` (khoá ổn định cho trang), riêng khoá theo trạng thái (giá, tuổi) vắng hẳn.
4. Ảnh `photos` rỗng → `photos: []`, không lỗi.
5. Nhóm route lồng hai lớp (`(khach)/(mo)/s/[ma]/page.tsx`) và tệp `route.ts` → rào vẫn ra URL `/s/[ma]` (E9).

---

### Task 1: Người nhận, cửa ra, bảng lớp, mồi

phục vụ E2 (và nền cho E1, E3–E8) · independent: false

**Files:**
- Create: `packages/core/src/redaction/cua-ra.ts`, `lop-truong.ts`, `moi.ts`, `index.ts`, `lop-truong.test.ts`
- Modify: `packages/core/package.json` (thêm `"./redaction": "./src/redaction/index.ts"` vào `exports`)

**Interfaces — Produces:**
- `CUA_RA = ["gui_link","gui_anh_tin","phat_hang"] as const` · `type CuaRa`
- `NGUOI_NHAN = ["khach_rieng","nhom_moi_gioi"] as const` · `type NguoiNhan`
- `type LienHeVao = { id: string; fullName: string | null; contactTypes: ContactType[]; phones: readonly string[] }`
- `type CanNoiBo` — đúng các khoá của bảng `design.md` §2 (`buildingFloorsTotal: number | null`, `contacts: readonly
  LienHeVao[]`, `photos: readonly UnitPhoto[]`, `customFields: Readonly<Record<string, unknown>>`, `standardStatus:
  StandardStatus`, `version: number`, các trường còn lại `string | number | null` theo kiểu của lõi hàng, danh mục).
- `LOP_TRUONG: Readonly<Record<keyof CanNoiBo, DataClass>>` — lớp đúng bảng §2 (`contacts` → `source`, `photos` →
  `shareable_listing`).
- `KHOA_CHUA_CO_BANG_GOC: readonly (keyof CanNoiBo)[]` — mọi khoá trừ `ownerName, ownerPhone, floorPrice, titleDeedPhoto,
  photos`.
- `kiemBangLop(bang: Readonly<Record<string, DataClass>>, nguonRa: Readonly<Record<NguoiNhan, readonly string[]>>,
  khoaBanVao: readonly string[]): string[]` — lỗi `"<khoá>: chưa xếp lớp"` (khoá bản vào không có trong bảng) và
  `"<khoá>: lớp <lớp> không ra ngoài"` (khoá nguồn của danh sách được ra có trần khác `external`/`by_agreement`).
- `kiemBangGoc(bang, goc: { ownerFields: Readonly<Record<string, DataClass>>; sourceKeys: readonly string[];
  compartmentClass: Readonly<Record<string, DataClass>> }): string[]` — lỗi `"<khoá>: lệch bảng gốc (<lớp gốc> ≠ <lớp>)"`.
- `canMoi(): CanNoiBo` — mọi giá trị không được ra là duy nhất: chữ `[Tên] MỒI-…` có dấu, số `0900 000 07x`, tiền
  `9 876 543 21x` (10 chữ số), mã `moi-noi-bo-…`; hai liên hệ (Chủ bán số `0900000071`, Người mua số `0900000072`); ảnh:
  3 Gửi được (thứ tự 2, 0, 1; bìa là thứ tự 1; thứ tự 2 `isSample`), 2 Nội bộ mã `moi-anh-noi-bo-1/2`; vị trí `unitNumber
  "Z-97.53"`, `upi "UPI-MOI-9753"`, `stack "53"`, `floor 12`, `buildingFloorsTotal 15`.
- `giaTriMoi(can: CanNoiBo, nguoiNhan: NguoiNhan, cauHinh: CauHinhRa): GiaTriMoi[]` (kiểu ở Task 3) — mọi giá trị của khoá
  có lớp không ra, tên/số/mã liên hệ, mã ảnh Nội bộ; thêm `unitNumber`, `upi`, `stack` khi khách riêng ẩn mã căn.

- [ ] **Step 1: Viết `lop-truong.test.ts`** — ca «bảng lớp trọn» đúng E2: `kiemBangLop(LOP_TRUONG, NGUON_RA, Object.keys(
  canMoi()))` = []; khoá `canMoi()` = khoá `LOP_TRUONG`; round-trip `kiemBangGoc` với `OWNER_FIELDS`, `SOURCE_KEYS`,
  `COMPARTMENT_CLASS` nhập thật = []; `KHOA_CHUA_CO_BANG_GOC` deepEqual danh sách viết trong test. Ca đỏ: bảng gốc sao đổi
  `ownerName` → `company_internal` ⇒ đúng 1 lỗi chứa `ownerName`; khoá `ghiChuNoiBo` thêm vào bản vào ⇒ chứa `ghiChuNoiBo`
  và `chưa xếp lớp`; năm ca thêm vào nguồn ra khách riêng `holderName`, `customFields`, `closePrice`, khoá mồi lớp
  `behavior` (bảng sao), `ownerPhone` ⇒ mỗi ca đúng 1 lỗi nêu khoá và lớp. (`NGUON_RA` ở Task 2 — viết Task 1 cùng Task 2
  trong một lượt chạy test.)
- [ ] **Step 2:** `npm test -w @quy-hang/core` — FAIL (mô-đun chưa có).
- [ ] **Step 3:** Viết bốn tệp theo Interfaces; `index.ts` xuất lại mọi thứ của mô-đun.
- [ ] **Step 4:** chạy lại sau Task 2 — PASS.

### Task 2: Hàm ra `banRaNgoai`

phục vụ E1, E4, E6, E7 · independent: false (dùng Task 1)

**Files:** Create `packages/core/src/redaction/ban-ra.ts`, `ban-ra.test.ts`

**Interfaces — Produces:**
- `type CauHinhRa = { showConfirmedAge: boolean; privateHidesUnitNumber: boolean }` · `CAU_HINH_MAC_DINH` (true, true) ·
  `CAU_HINH_MO_NHAT` (true, false) · `CAU_HINH_TAT_CA` (4 tổ hợp).
- `type Availability = "available" | "under_contract" | "paused" | "unavailable"` · `AVAILABILITY: Record<StandardStatus,
  Availability>` theo bảng §4.
- `type KhoaRa` = `buildingName | unitNumber | upi | stack | floor | floorBand | livingArea | bedroomsTotal |
  directionFaces | propertyType | propertySubType | furnished | legalStatus | occupantType | financing | availability |
  listPrice | feeInclusion | confirmedAgeDays | photos | companyName | senderName`.
- `NGUON_RA: Record<KhoaRa, readonly (keyof CanNoiBo)[]>` (khoá bản vào mà mỗi khoá ra đọc: `floorBand` ← `floor`,
  `buildingFloorsTotal`; `availability` ← `standardStatus`; `confirmedAgeDays` ← `lastConfirmedAt`; còn lại cùng tên).
- `TRUONG_RA: Record<NguoiNhan, readonly KhoaRa[]>` — tập lớn nhất của mỗi người nhận (khách riêng gồm cả bốn khoá vị trí,
  bật/tắt theo `privateHidesUnitNumber`); `truongRa(nguoiNhan, cauHinh): readonly KhoaRa[]` — tập thật dùng ở lượt dựng.
- `bangTang(floor: number | null, tongTang: number | null): "high" | "low" | null` — `floor > tongTang / 2` → high.
- `type AnhRa = { id: string; label: string; width: number; height: number }` qua `anhRaNgoai` + `nhanAnh`.
- `banRaNgoai(can: CanNoiBo, tuy: { cua: CuaRa; nguoiNhan: NguoiNhan; cauHinh?: CauHinhRa; today: string }):
  CanRaNgoai` — chỉ chép khoá của `truongRa`; giá và điều kiện phí chỉ khi `available`/`under_contract`;
  `confirmedAgeDays` chỉ khi thêm có giá và `showConfirmedAge` (null khi chưa xác nhận).
- Ghi lại tại `index.ts`.

- [ ] **Step 1: Viết `ban-ra.test.ts`** — các ca E1 (6 ô khoá ⊆, khoá lạ `ghiChuNoiBo`, ba cửa deepEqual; chiều đỏ: bản
  sao `banRaNgoaiChepCa` trong test ⇒ thông điệp nêu `ghiChuNoiBo`), E4 (deepEqual danh sách 18 khoá Hỏi-3 ở cấu hình mặc
  định với căn Active; không bốn khoá vị trí; bảng `bangTang` 5 ô; đối chứng môi giới / tắt ẩn có `unitNumber`; bản sao bỏ
  điều kiện ẩn ⇒ nêu `unitNumber`), E6 (thứ tự `[bìa, thứ tự 0, thứ tự 2]`, nhãn, đúng bốn khoá; bản sao lấy mọi ảnh ⇒ nêu
  `moi-anh-noi-bo-1`), E7 (bảng 6 trạng thái × 3, sáu trạng thái không có năm khoá cấm, ba ô ngày 10/1/0 gọi `freshness`
  thật, tắt #12, chưa xác nhận → null; bản sao Hold → available ⇒ nêu `Hold`; bản sao tính giờ trôi ⇒ ô đầu ra 9).
- [ ] **Step 2:** `npm test -w @quy-hang/core` — FAIL.
- [ ] **Step 3:** Viết `ban-ra.ts`.
- [ ] **Step 4:** `npm test -w @quy-hang/core` — PASS (cả Task 1). `npm run typecheck -w @quy-hang/core` — 0 lỗi.
- [ ] **Step 5:** Commit `feat(core): luật ẩn một hàm cho mọi cửa ra (hàng 31)`.

### Task 3: Máy quét rò rỉ

phục vụ E3, E5, E8 · independent: false (dùng Task 1, 2)

**Files:** Create `packages/core/src/redaction/kiem-ro-ri.ts`, `kiem-ro-ri.test.ts`, `khong-ro.test.ts`

**Interfaces — Produces:**
- `type GiaTriMoi = { truong: string; giaTri: string | number; kieu: "chu" | "so_dien_thoai" | "so_tien" }`
- `type RoRi = { truong: string; dang: DangMaHoa }` · `DANG_MA_HOA` = `nguyen_van, html_thap_phan, html_thap_luc_phan,
  html_co_ten, json_unicode, url, nfd, nfc, hoa_thuong, so_lien, so_cach, so_cham, so_gach, so_84, so_cong_84,
  so_tien_ngan`.
- `timRoRi(vanBan: string, moi: readonly GiaTriMoi[]): RoRi[]` — một trúng mỗi (trường, dạng đầu tiên khớp); số điện thoại
  qua `normalizePhone` của hàng 11 trên mọi dãy số ≥ 9 chữ số; số tiền so dãy chữ số sau khi bỏ `.`, `,`, khoảng trắng.
- `kiemBanRa(ham: typeof banRaNgoai, can: CanNoiBo, today: string): string[]` — 3 cửa × 2 người nhận × `CAU_HINH_TAT_CA`,
  thông điệp `"<cửa>/<người nhận>/<cấu hình>: rò <trường> (<dạng>)"`.

- [ ] **Step 1: Viết test** — `kiem-ro-ri.test.ts`: ma trận 16 dạng × (có mồi, bỏ mồi) = 32 assert trên một văn bản HTML
  mẫu (script, thuộc tính, chú thích); ca «12» không trúng; bản sao bỏ giải thực thể ⇒ ô thập phân đỏ nêu dạng; bản sao bỏ
  `+84` ⇒ ô `so_cong_84` đỏ. `khong-ro.test.ts`: E3 (24 ô = []; dương: quét JSON bản vào trúng đủ danh sách trường viết
  trước; ba bản sao chép `ownerPhone` / `floorPrice` / `holderName` ⇒ mỗi bản nêu đúng trường) và E5 (24 ô, không khoá
  `contacts`; 2 số × 6 cách viết = 12 trúng; bản sao chép tên người mua ⇒ đỏ).
- [ ] **Step 2:** FAIL → **Step 3:** viết `kiem-ro-ri.ts` → **Step 4:** `npm test -w @quy-hang/core` PASS.
- [ ] **Step 5:** Commit `feat(core): bộ kiểm rò rỉ quét mồi trên văn bản (hàng 31)`.

### Task 4: Rào cửa ra

phục vụ E9 · independent: true (chỉ cần `cua-ra.ts` của Task 1)

**Files:** Modify `packages/core/src/redaction/cua-ra.ts`; Create `cua-ra.test.ts`

**Interfaces — Produces:**
- `TIEN_TO_CUA_RA = ["/s/", "/shares/new", "/exports", "/api/v1/public/"] as const`
- `urlCuaTrang(duongTuGocApp: string): string` — bỏ đoạn `(…)`, bỏ `page.tsx`/`route.ts`; tệp dưới `packages/api/src/public/`
  ra `/api/v1/public/<thư mục>`.
- `timCuaRaThieuKiem(goc: string): { url: string; tep: string }[]` — đọc `<goc>/apps/web/src/app` và
  `<goc>/packages/api/src/public` (thiếu thư mục = bỏ qua); một trang cửa ra đạt khi có tệp `*.ro-ri.test.ts(x)` ở thư mục
  của nó hoặc thư mục cha (tới gốc app) mà nội dung có cả `canMoi` và `timRoRi`.

- [ ] **Step 1:** Test 6 ô của E9 trên cây mẫu trong `os.tmpdir()`, cộng ca nhóm route hai lớp (Review Focus 5) và ca cây
  thật của kho = [].
- [ ] **Step 2:** FAIL → **Step 3:** viết → **Step 4:** PASS. **Step 5:** commit `feat(core): rào cửa ra phải có bài kiểm
  rò rỉ`.

### Task 5: CI, rào lint, tài liệu

phục vụ E9, E9b, E10 · independent: false (bài phá thử chạy bộ kiểm của Task 1–3)

**Files:**
- Modify: `package.json` (thêm script `"test:ro-ri": "node --import tsx --test \"packages/core/src/redaction/**/*.test.ts\"
  \"apps/web/src/**/*.ro-ri.test.ts\" \"apps/web/src/**/*.ro-ri.test.tsx\" \"packages/api/src/**/*.ro-ri.test.ts\""`)
- Modify: `.github/workflows/ci.yml` (job `ro-ri`: checkout, setup-node theo `.nvmrc`, `npm ci`, `npm run test:ro-ri`;
  thêm `ro-ri` vào `needs` của `deploy` và `ci-ok`; comment một dòng như job `isolation`)
- Modify: `eslint.config.mjs` (cherry-pick `b324429`)
- Modify: `_acceptance/config.yaml` (hai khoá dưới `executors.script`:
  `ro_ri: "npm run test:ro-ri"` và `lint_bo_qua: "node --test \"_acceptance/luat-an-va-kiem-ro-ri/thu/*.test.mjs\""`)
- Modify: `AGENTS.md` (câu CI: thêm `ro-ri`; bất biến 4: thêm «bộ kiểm rò rỉ `npm run test:ro-ri` là check bắt buộc»),
  `docs/adr/0022-dinh-vi-va-chuan-doi-chieu.md` (B4: «hàng 31, chưa dựng; tới khi ấy là luật chữ» → «hàng 31, job CI
  `ro-ri`»), `docs/product/tham-chieu.md` (thêm một dòng §6 sau dòng «Lớp trường»: luật ẩn và bộ kiểm rò rỉ đã dựng 03/11)
- Create: `_acceptance/luat-an-va-kiem-ro-ri/thu/ci-ro-ri.test.mjs`, `pha-thu.test.mjs`, `lint-bo-qua.test.mjs`

- [ ] **Step 1: Viết ba bài `thu/`** — đường gốc kho suy từ vị trí tệp (`new URL("../../../", import.meta.url)`).
  `ci-ro-ri`: đọc `ci.yml` bằng gói `yaml`: job `ro-ri` có bước `npm run test:ro-ri`, `ro-ri` ∈ needs của `ci-ok` và
  `deploy`, `package.json` có `test:ro-ri` (4 assert); bản sao YAML bỏ `ro-ri` khỏi needs của `ci-ok` ⇒ hàm đọc trả lỗi
  nêu `ci-ok`. `pha-thu`: chép `packages/core/src` sang `mkdtemp`, chèn `"holderName", ` vào danh sách nguồn ra khách
  riêng của bản sao `ban-ra.ts`, chạy lệnh `test:ro-ri` đọc từ `package.json` với đường lõi đổi sang bản sao (cwd gốc kho)
  ⇒ mã ≠ 0 và đầu ra chứa `holderName`; bản sao không sửa ⇒ mã 0. `lint-bo-qua`: `new ESLint({ cwd: gốc })` —
  `isPathIgnored(".acceptance-runs/x/loi/a.mjs")` true, `lintText` mã lỗi với `filePath` dưới `packages/core/src/redaction/`
  ⇒ lỗi > 0; cấu hình tạm ở `mkdtemp` nhập cấu hình thật bằng đường tuyệt đối và lọc bỏ khối `ignores` chứa
  `.acceptance-runs/**` ⇒ `isPathIgnored` false.
- [ ] **Step 2:** `node --test "_acceptance/luat-an-va-kiem-ro-ri/thu/*.test.mjs"` — FAIL.
- [ ] **Step 3:** Sửa các tệp ở danh sách Files (cherry-pick `git cherry-pick -n b324429`).
- [ ] **Step 4:** `npm run test:ro-ri` PASS; lệnh bước 2 PASS; `npm run typecheck && npm run lint && npm test` PASS.
- [ ] **Step 5:** Commit `ci: job ro-ri bắt buộc, rào lint bỏ qua thư mục đợt (hàng 31)`.

## Thứ tự

Task 1 + 2 (một lượt test) → Task 3 → Task 4 → Task 5. Chạy tuần tự trong phiên (chỉ Task 4 độc lập — không đủ hai task
độc lập để tách song song).
