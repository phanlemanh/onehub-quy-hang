# Nhanh tức thì — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (native, main loop — feature-loop S3).
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bộ đồng bộ trên máy cho web: kéo hàng về kho trên máy theo luật API, ghi trên máy trước, hàng đợi qua mất mạng,
đụng nhau thành «cần xem», chỉ báo trên thanh trên, hỏi và xoá khi đăng xuất, trang thử ẩn.

**Architecture:** Mọi phần thuần (không DOM) ở `apps/web/src/lib/sync/`, nhận `goi` (hàm gọi API) và `kho` (kho trên máy)
từ ngoài nên kiểm bằng `node:test`. Bản trình duyệt thay `kho` bằng IndexedDB, `goi` bằng `fetch` cùng gốc. React chỉ
là lớp mỏng (`react.tsx`) và hai thành phần ở `apps/web/src/components/sync/`.

**Tech Stack:** TypeScript chặt, Next.js 16 / React 19, `node:test` + `tsx`, IndexedDB thô (không thêm gói), shadcn đã cài
(Badge, Sheet, AlertDialog, Button, Input, Select).

**Spec:** `docs/superpowers/specs/2026-10-31-nhanh-tuc-thi-design.md` · hợp đồng `_acceptance/nhanh-tuc-thi/contract.md` ·
bộ chấm `_acceptance/nhanh-tuc-thi/evals.yaml`

## Global Constraints

- Không thêm gói npm, không đổi `package-lock.json`; không đổi API, không migration.
- Vùng: `apps/web/src/lib/sync/**`, `apps/web/src/components/sync/**`, `apps/web/src/components/shell/**` (không chạm
  `placeholder.tsx`), `apps/web/src/app/(app)/proto/nhanh-tuc-thi/**`, `packages/core/src/listing/fold.ts` + test lõi;
  ba tệp dùng chung chỉ THÊM dòng (N-14): `_acceptance/config.yaml`, `apps/web/package.json`, `CONTEXT.md`.
- Chữ chỉ báo đúng nguyên văn: «Đang tải lần đầu» · «Đã đồng bộ · hh:mm» · «Đang gửi n thay đổi» · «Mất mạng · n thay
  đổi chờ gửi» · «Mất mạng · đang xem bản trên máy» · «n căn cần xem». Hỏi đăng xuất: «Còn n thay đổi chưa gửi lên —
  đăng xuất sẽ xoá chúng khỏi máy», nút «Ở lại» · «Vẫn đăng xuất». Lối cần xem: «Giữ của tôi» · «Lấy bản mới» · «Sửa lại» ·
  «Bỏ thay đổi»; dòng «Căn đã cọc» / «Căn đã bán».
- Chu kỳ: 15 giây khi có thao tác chờ hay đang mất mạng; 30 giây khi yên.
- Không khoá nguồn (`SOURCE_KEYS`, `OWNER_FIELDS`) nào vào kho trên máy. Dữ liệu mẫu trong test: `[Tên chủ mẫu]`,
  `0900 000 012`.
- Luật lint `quy-hang-ui` (mười luật, mức nợ 0); không màu thô.

## Review Focus

1. Thao tác chờ của căn mà máy chủ trả 404 (căn «Chỉ tôi» của người khác) — phải vào «cần xem» với lối «Bỏ thay đổi»,
   không kẹt — test ở Task 6.
2. Hai tab cùng người cùng mở — hai bộ đồng bộ cùng đọc một hàng đợi IndexedDB, cùng gửi một thao tác: đối chiếu phải
   nhận thao tác thứ hai là «đã áp trước», không thành «cần xem» — test ở Task 6 (hai bộ đồng bộ trên một kho bộ nhớ).
3. Bản kéo về đến khi còn thao tác chờ — bản trên máy phải là bản máy chủ gấp thêm các thao tác chờ, không bị bản kéo
   xoá giá vừa sửa — test ở Task 5.
4. Kéo về trả rỗng (sàn chưa có căn) — chỉ báo «Đã đồng bộ», không «Đang tải lần đầu» mãi — test ở Task 3.
5. Đổi sàn lúc đang gửi — lô đang bay của sàn cũ vẫn khép đúng, không ghi kết quả vào ngăn sàn mới — test ở Task 6.

---

### Task 1: Bước gấp `stepListing` trong lõi

**Files:** Modify `packages/core/src/listing/fold.ts` · Test `packages/core/src/listing/listing.test.ts`
**Evals:** E3 · **independent: true** · **Verify:** `npm test -w @quy-hang/core`

**Interfaces — Produces:** `stepListing(state: ListingState, e: ListingEvent): ListingState` (thuần, trả bản mới, không đổi
đầu vào; `version = e.seq`). `foldListing` dựng trạng thái đầu từ `created` rồi gọi `stepListing` cho từng sự kiện.

- [ ] Test «stepListing gấp từng bước bằng foldListing»: với một dãy viết tay 6 sự kiện (created, price_changed,
  details_changed, status_changed Active, owner_confirmed, status_changed Closed kèm closePrice), mọi tiền tố k ≥ 1:
  `deepEqual(stepListing(foldListing(ds.slice(0,k)), ds[k]), foldListing(ds.slice(0,k+1)))`; và đầu vào không bị đổi
  (`deepEqual` bản chụp trước/sau).
- [ ] Chạy → đỏ (chưa có hàm). Tách switch hiện tại thành `stepListing`; `foldListing` gọi nó. Chạy → xanh, mọi ca lõi cũ
  xanh. Phá thử: bỏ nhánh `price_changed` trong `stepListing` → ca đỏ nêu bước. Hoàn lại.
- [ ] Commit `refactor(core): tách stepListing khỏi foldListing`.

### Task 2: Lệnh kiểm web, từ vựng

**Files:** Modify `apps/web/package.json` (thêm `"test": "node --import tsx --test \"src/**/*.test.ts\""`,
`"test:db": "node --env-file-if-exists=../../.env.local --import tsx --test \"src/lib/sync/test-db/*.test.ts\""`) ·
`_acceptance/config.yaml` (thêm `web: "npm test -w @quy-hang/web"`, `web_db: "npm run test:db -w @quy-hang/web"` dưới
`executors.test`) · `CONTEXT.md` (bảng nhãn: «Chỉ báo đồng bộ» ↔ `SyncIndicator`; «Cần xem» ↔ `needsReview`; «Thao tác
chờ» ↔ `PendingOp`; «Kho trên máy» ↔ `LocalStore`).
**Evals:** — (nền cho mọi eval web) · **independent: true** · **Verify:** `npm test -w @quy-hang/web` chạy (0 tệp thì
`node --test` vẫn thoát 0 khi glob không khớp — Task 3 thêm tệp đầu tiên); `npm run lint` xanh.

- [ ] Kiểm `src/**/*.test.ts` không bị `next build`/`tsc` của web loại trừ sai (tsconfig web có `include` gì; test dùng
  `node:test` nên `@types/node` phải có — đã có ở gốc). Commit `chore(web): lệnh kiểm node:test cho bộ đồng bộ`.

### Task 3: Kho trên máy và chỉ báo

**Files:** Create `apps/web/src/lib/sync/types.ts`, `kho.ts`, `kho-indexeddb.ts`, `trang-thai.ts`; Test `kho.test.ts`,
`trang-thai.test.ts` (cùng thư mục)
**Evals:** E8, E10 · **independent: false** (sau Task 2) · **Verify:** `npm test -w @quy-hang/web`

**Interfaces — Produces:**
- `types.ts`: `ListingView = { id: string } & ListingState & { freshness: unknown; completeness: unknown; visibility: "Private" | "Company" }`;
  `PendingOp = { opId: string; listingId: string; type: EventType; payload: Record<string, unknown>; expectedVersion: number; clientSeq: number; createdAt: string }`;
  `NeedsReview = { listingId: string; kind: "dung-nhau" | "da-coc" | "da-ban" | "tu-choi"; mine: PendingOp[]; server?: { value: ListingView; byUserId: string; at: string }; reason?: string }`.
- `kho.ts`: `interface LocalStore { read(companyId): Promise<Ngan>; write(companyId, ngan: Ngan): Promise<void>; wipe(): Promise<void> }`
  với `Ngan = { listings: ListingView[] | null; history: Record<string, ListingEvent[]>; queue: PendingOp[]; review: NeedsReview[]; lastPullAt: string | null; lastAttempt: "ok" | "mang" | null; nextSeq: number }`;
  `taoKhoBoNho(userId: string, may: Map<string, unknown>): LocalStore` (nhiều người chung một `may` — để kiểm xoá đúng người).
- `kho-indexeddb.ts`: `taoKhoIndexedDb(userId: string): LocalStore` — cơ sở dữ liệu `quy-hang-sync:<userId>`, một object
  store `ngan` khoá theo `companyId`; `wipe()` = `indexedDB.deleteDatabase`.
- `trang-thai.ts`: `suyChiBao(n: Ngan, dangGui: number): { nhan: string; loai: "tai" | "xong" | "gui" | "mang" | "xem" }`
  theo bảng của AC-8 (cần xem thắng; `listings !== null` và `lastAttempt === "ok"` với 0 chờ → «Đã đồng bộ · hh:mm» giờ
  địa phương của `lastPullAt`); `canHoiKhiDangXuat(n: Ngan[]): { hoi: boolean; n: number }` (cộng mọi ngăn).

- [ ] Test «chỉ báo: bảng trạng thái → chữ» — bảng viết tay đúng sáu dòng của E8 (đếm số dòng đã so) + dòng Review Focus 4
  (listings = [] với lần kéo ok → «Đã đồng bộ»).
- [ ] Test «đăng xuất: hỏi đúng n, xoá sạch kho của người đó» — ba người A, B, C trên một `may`; như E10.
- [ ] Chạy đỏ → viết → xanh. Phá thử: cho «Mất mạng» thắng «cần xem» → ca đỏ nêu dòng. Commit.

### Task 4: Ghi trên máy trước

**Files:** Create `apps/web/src/lib/sync/ap-tren-may.ts`; Test `ap-tren-may.test.ts`
**Evals:** E3 · **independent: false** (Task 1, 3) · **Verify:** `npm test -w @quy-hang/web`

**Interfaces — Produces:** `apTrenMay(n: Ngan, listingId: string, type: EventType, payload: Record<string, unknown>, me: { userId: string; roles: string[] }, now: string, opId: string): { ok: true; ngan: Ngan; op: PendingOp } | { ok: false; errors: PayloadError[] | { kind: string; reason: string; missing?: unknown } }`
— kiểm `validatePayload`; `status_changed` thì `checkTransition(state.standardStatus, to, ctx từ state)`; hợp lệ: sự kiện
tạm `seq = state.version + 1`, `stepListing`, `expectedVersion = state.version`, `clientSeq = n.nextSeq`.
`banTrenMay(server: ListingView, ops: PendingOp[]): ListingView` — gấp các thao tác chờ của căn lên bản máy chủ (dùng ở Task 5).

- [ ] Hai test của E3 (đổi ngay = `foldListing` trên cùng dãy; chuỗi phiên bản [3, 4]; sai khuôn và Incomplete → Closed bị
  từ chối, hàng đợi và bản trên máy `deepEqual` trước/sau). Đỏ → viết → xanh → phá thử (xếp hàng dù khuôn sai) → commit.

### Task 5: Kéo về và đọc từ kho

**Files:** Create `apps/web/src/lib/sync/keo.ts`, `doc.ts`; Test `doc.test.ts`
**Evals:** E1 (phần thuần), E2 · **independent: false** (Task 3, 4) · **Verify:** `npm test -w @quy-hang/web`

**Interfaces — Produces:**
- `type Goi = (method: "GET" | "POST", path: string, body?: unknown) => Promise<{ status: number; body: unknown }>` (ném
  lỗi = mất mạng) — đặt ở `types.ts`.
- `keoVe(goi: Goi, n: Ngan, now: string): Promise<Ngan>` — `GET /api/v1/listings`; mỗi bản ghi qua `findSourceLeaks(rec)`
  của `@quy-hang/core/access`: có rò thì BỎ bản ghi đó và ném `Error("kéo về: bản ghi mang nguồn <mã>")` sau khi lọc
  (không ghi); thay trọn `listings`; `lastPullAt = now`, `lastAttempt = "ok"`.
- `keoLichSu(goi, n, listingId): Promise<Ngan>` — `GET /api/v1/listings/{id}`, lưu `history[id]` (qua cùng lưới nguồn).
- `doc.ts`: `locDanhSach(n: Ngan, loc: { trangThai?: StandardStatus[]; toa?: string[] }): ListingView[]` (mỗi căn là
  `banTrenMay(server, ops của căn)`); `moHoSo(n: Ngan, id: string): { can: ListingView; lichSu: ListingEvent[] } | null`.

- [ ] Test «đọc không chờ mạng: lọc, mở hồ sơ, dựng lại từ kho» như E2 (`goi` giả ném lỗi và đếm; đối chứng 1 lần gọi khi
  chủ động kéo). Test Review Focus 3: kéo về khi còn 2 thao tác chờ → `locDanhSach` hiện giá đã sửa. Test lưới nguồn: bản
  ghi cấy `ownerPhone` bị bắt, không vào kho. Đỏ → viết → xanh → phá thử → commit.

### Task 6: Gửi, đối chiếu, cần xem, biết có mạng lại

**Files:** Create `apps/web/src/lib/sync/gui.ts`, `doi-chieu.ts`, `mang.ts`, `dong-bo.ts`; Test `dong-bo.test.ts`,
`mang.test.ts`
**Evals:** E5, E6, E7, E9 (thuần), E4 (một phần) · **independent: false** (Task 3–5) · **Verify:** `npm test -w @quy-hang/web`

**Interfaces — Produces:**
- `guiHangDoi(goi: Goi, n: Ngan, me): Promise<{ ngan: Ngan; daGui: number; mang: boolean }>` — theo từng căn, thứ tự
  `clientSeq`; căn có mục `review` thì bỏ qua cả căn; 2xx → bỏ khỏi hàng đợi; lỗi mạng → dừng mọi căn, `lastAttempt="mang"`;
  409/400/403/404 → `doiChieu`.
- `doiChieu(goi, n, op, me): Promise<"da-ap-truoc" | NeedsReview>` — `GET /listings/{id}`: có sự kiện `seq > op.expectedVersion`,
  `actorUserId === me.userId`, cùng `type`, `payload` deepEqual, chưa được thao tác khác của mình nhận → «đã áp trước».
  404 → `tu-choi` lý do «căn không còn đọc được». Không khớp: trạng thái máy chủ Pending/Closed do người khác → `da-coc`/`da-ban`;
  409 → `dung-nhau` (kèm `server` = bản mới, người và lúc của sự kiện cuối); 400 → `tu-choi` kèm `reason` của máy chủ.
- `giuCuaToi(n, listingId, me): Ngan` (kiểm lại từng thao tác bằng `apTrenMay` trên bản máy chủ mới, nối chuỗi từ
  phiên bản mới; lỗi lõi → `tu-choi`); `layBanMoi(n, listingId)` (bỏ thao tác của căn, bỏ mục review); `boThayDoi(n, listingId)`;
  `suaLai(n, listingId): { ngan; nhap: Record<string, unknown> }` (trả giá trị của tôi để điền lại ô, bỏ thao tác).
- `mang.ts`: `taoNhip({ dongHo: { now(): number; setTimeout; clearTimeout }, thu: () => Promise<void>, coCho: () => boolean }): { quayLaiTrang(): void; coMang(): void; dung(): void }` — 15 000 ms khi `coCho()` hay lần cuối mất mạng, 30 000 ms khi yên.
- `dong-bo.ts`: `taoBoDongBo({ goi, kho, me: { userId; roles }, companyId, dongHo, taoMa }): BoDongBo` với
  `sua(listingId, type, payload)`, `danhSach(loc)`, `hoSo(id)`, `chiBao()`, `canXem()`, `giuCuaToi/layBanMoi/boThayDoi/suaLai(id)`,
  `thuNgay()`, `doiSan(companyId)`, `dangKy(lang: () => void): () => void`, `dung()`. Mỗi thao tác đọc/ghi qua `kho`
  (không giữ bản riêng trong bộ nhớ quá một lượt) — hai bộ đồng bộ trên một kho thấy cùng hàng đợi (Review Focus 2).
  Một lô gửi mang `companyId` lúc bắt đầu; kết quả ghi vào đúng ngăn đó (Review Focus 5).

- [ ] Test thuần với `goi` giả mô phỏng máy chủ (phiên bản, WINS_IMMEDIATELY, 404): ca từ chối 404 vào cần xem và
  «Bỏ thay đổi» trả căn về thường (Review Focus 1); hai bộ đồng bộ chung kho gửi cùng thao tác → một sự kiện, không cần xem
  (Review Focus 2); đổi sàn giữa lô (Review Focus 5); E9 với đồng hồ giả (14 s → 0, 15 s → 1, quay lại trang → +1, yên
  29 s → 0, 30 s → 1). Đỏ → viết → xanh → phá thử (bỏ đối chiếu → gửi trùng; chỉ dựa sự kiện online) → commit.

### Task 7: Bài kiểm trên API thật

**Files:** Create `apps/web/src/lib/sync/test-db/helpers.ts` (nhận `createApi` từ `@quy-hang/api` và helper từ
`../../../../../../packages/api/test-db/helpers`; `goiQuaApp(app, cookie): Goi`; `goiMatPhanHoi(goi): Goi` — chuyển lời gửi
rồi ném lỗi; `matMang`/`coMang` công tắc), `dong-bo.db.test.ts`
**Evals:** E1, E4, E5, E6, E7 · **independent: false** (Task 6) · **Verify:** `npm run test:db -w @quy-hang/web`
(DATABASE_URL tới Postgres dãy N, 5551; `npm run db:migrate` trước)

- [ ] Viết đúng các ca tên trong E1, E4 (hai ca), E5, E6 (ba ca), E7 (hai ca, mỗi ca lặp Đã bán); đếm sự kiện bằng
  `appPool` (vai chủ). Hàng «Toàn sàn» dựng bằng price_changed + details_changed + status_changed Active như
  `packages/api/test-db/visibility.test.ts`. Chạy xanh; phá thử mỗi lớp một lần (bỏ đối chiếu → E5 đỏ; ghi đè khi 409 → E6
  đỏ; gửi hàng đợi sàn A khi đứng ở B → E4 đỏ), hoàn lại. Commit.

### Task 8: Giao diện — provider, chỉ báo, cần xem, đăng xuất, trang thử

**Files:** Create `apps/web/src/lib/sync/react.tsx`, `apps/web/src/lib/sync/goi-fetch.ts`,
`apps/web/src/components/sync/chi-bao-dong-bo.tsx`, `bang-can-xem.tsx`, `hoi-dang-xuat.tsx`,
`apps/web/src/app/(app)/proto/nhanh-tuc-thi/page.tsx` (+ `trang-thu.tsx` client); Modify `apps/web/src/components/shell/app-shell.tsx`
(chỉ báo trước `<Notifications />` ở thanh máy tính; bọc `BoDongBoProvider` quanh vỏ với `userId`, `companyId`, `roles`),
`mobile-shell.tsx` (chỉ báo trước `<Notifications />`), `account-menu.tsx` (Đăng xuất → `hoiDangXuat()` rồi `kho.wipe()`
trước khi gọi sign-out).
**Evals:** E4b, E8b, E10 (nối) · **independent: false** (Task 6) · **Verify:** `npm run typecheck && npm run lint`, rồi
`npm run dev -w @quy-hang/web -- -p 3471` và nhìn ở 1440 và 375 (sáng, tối) theo DỰNG T của evals.yaml.

**Interfaces — Produces:** `BoDongBoProvider({ userId, companyId, roles, children })`; `useChiBao()`, `useCanXem()`,
`useDanhSachHang(loc)`, `useHoSoHang(id)`, `useSuaHang()`, `useDangXuat(): () => Promise<boolean>` (trả `false` khi người
chọn «Ở lại»). `goiFetch(): Goi` — `fetch` cùng gốc, `credentials: "same-origin"`, lỗi mạng ném.

- [ ] Chỉ báo: `Badge` biến thể theo `loai`, chữ = `nhan`; điện thoại: biểu tượng lucide + số, `aria-label` = chữ đầy đủ;
  bấm khi `loai === "xem"` mở `bang-can-xem` (Sheet: mỗi căn tên toà · mã căn, dòng «Căn đã cọc»/«Căn đã bán» khi có, giá
  máy chủ kèm người và giờ, giá của tôi, nút theo `kind`).
- [ ] Trang thử: `page.tsx` máy chủ kiểm vai có Bảng hàng (dùng `navigationFor(roles)` có nhà `inventory`), không có thì
  `notFound()`; không thêm lối vào điều hướng. Danh sách từ `useDanhSachHang({})`, mỗi dòng: toà, mã căn, trạng thái, `Input`
  giá (Enter = `price_changed` giữ `feeInclusion` cũ), `Select` trạng thái, nút «Lịch sử» mở số sự kiện + danh sách sự kiện.
- [ ] Nhìn theo bước E4b, E8b trên máy dev (chặn `*/api/v1/*` bằng công cụ trình duyệt); sửa đến khi khớp. Commit.

### Task 9: Tham chiếu

**Files:** Modify `docs/product/tham-chieu.md` (§12 một dòng 31/10: bộ đồng bộ trên máy — kéo theo luật ai thấy hàng,
không nguồn, ghi trên máy trước, cần xem, chỉ báo, xoá khi đăng xuất; Hỏi-1..4 đã chốt) · `docs/architecture/kien-truc-repo-va-stack.md`
dòng 156 chỉ khi lệch.
**Evals:** — · **independent: true** · **Verify:** đọc lại. Commit `docs: Tham chiếu §12 — bộ đồng bộ trên máy`.
