# Kế hoạch thi công — tab-toi (hàng 38)

**Mục tiêu:** tab Tôi thật cho mọi vai, và đường «báo mất máy» xoá kho của người bị báo trên máy bị báo — qua tin đẩy
`xoa-may` (máy có mạng) hoặc lần đầu máy chạm máy chủ (401 `device_reported_lost`), trong khi hết phiên thường giữ nguyên.

**Duyệt:** Manh Phan 03/11/2026 (Gate 1.5).

**Căn cứ:** `contract.md` (đã duyệt 03/11), `evals.yaml`, `design.md`, sổ `decisions.jsonl` (Hỏi-1 … Hỏi-4 theo khuyến
nghị). Migration số **029** (giám sát giữ chỗ, H-6). Chạm `(auth)/login` và `packages/api/src/auth` đã gửi `cham-tep`
(H-8, H-9).

## Ràng buộc chung

- TypeScript chặt; code tiếng Anh, chú thích nghiệp vụ và chữ giao diện tiếng Việt; dữ liệu mẫu `[Tên]`, `0900 000 0xx`.
- Không sửa migration đã commit; dấu ở schema `identity`, vai `quy_hang_app` không có quyền.
- Mã phiên không bao giờ lưu thô: dấu lưu `sha256(token)` hex.
- Hạn dấu = lúc thu + `SESSION_EXPIRES_SEC` (`packages/api/src/auth/constants.ts`), không chép số.
- Tin đẩy đúng bốn khoá `title, body, url, tag` (ràng buộc `push_outbox`); `tag: "xoa-may"`, mã người đi trong `url`.
- `apps/web/src/lib/sync/**` đang được hàng `ghi-thiet-bi-va-mat-mang` sửa: chỉ thêm, không đổi hàm có sẵn.
- Giao diện: khối đích `settings-2`, thang dùng lại của `.claude/rules/giao-dien.md`, trạng thái qua `TrangThai`.

## Vùng tệp (khai thêm vào hàng)

Ngoài vùng đã khai ở Cổng Phạm vi, kế hoạch chạm thêm: `packages/core/src/thiet-bi/**` (hàm thuần loại máy dùng chung
cho API và web), `apps/web/src/lib/api.ts` (`readMe` nhận mã máy bị báo), `apps/web/public/sw.js` (nhánh `xoa-may`),
`apps/web/src/app/(app)/today/dai-bat.tsx` (dùng bảng nhãn chung, không đổi chữ).

## Tasks

### Task 1 — Bảng dấu máy bị báo (migration 029) · independent: true

- Files: `packages/db/migrations/029_may_bi_bao.sql`; `packages/db/tests/isolation.test.mjs` (thêm ca cuối tệp).
- Bảng `identity.reported_device (token_hash text primary key check (token_hash ~ '^[0-9a-f]{64}$'), user_id text not null
  references identity."user"("id") on delete cascade, reported_at timestamptz not null default now(), expires_at
  timestamptz not null)`; index `(user_id)`; `revoke all … from quy_hang_app` (bảng không mang `company_id`, không thuộc
  luật theo dòng của công ty).
- Ca kiểm: `set local role quy_hang_app` rồi `select` và `insert` vào bảng → `permission denied`; chiều đỏ trên bản sao
  migration có `grant select` → ca đỏ nêu tên bảng.
- Verify: `npm run db:migrate && npm run test:isolation -w @quy-hang/db` trên Postgres dãy H (cổng 5574).
- Phục vụ: E9.

### Task 2 — Dấu và chặn máy bị báo ở API · independent: false (sau Task 1)

- Files: `packages/api/src/auth/may-bi-bao.ts` (mới), `packages/api/src/app.ts` (đăng ký lối chặn trước các đường
  `/api/v1/*` trừ `${AUTH_BASE_PATH}/*`), `packages/api/test-db/tab-toi/may-bi-bao.test.ts`.
- Interfaces:
  - `export const DEVICE_REPORTED_LOST = "device_reported_lost"`
  - `bamPhien(token: string): string` — sha256 hex.
  - `maPhienTuCookie(cookieHeader: string | null): string | null` — giá trị `qh.session_token` / `__Secure-qh.session_token`,
    phần trước dấu chấm chữ ký.
  - `ghiDau(identityPool: pg.Pool, d: { tokens: string[]; userId: string; now: Date }): Promise<number>` — `expires_at =
    now + SESSION_EXPIRES_SEC`.
  - `docDau(identityPool: pg.Pool, token: string, now: Date): Promise<{ userId: string } | null>` — bỏ dấu quá hạn.
  - `chanMayBiBao(deps: ApiDeps): MiddlewareHandler` — có cookie phiên, `getSession` trả null, `docDau` có dấu → 401
    `{ error: "device_reported_lost", userId }`; còn lại đi tiếp (401 thường của từng đường giữ nguyên).
- Verify: `npm run typecheck -w @quy-hang/api && npm run test:db -w @quy-hang/api -- --test-name-pattern "máy bị báo"`.
- Phục vụ: E7, E9 (vế hạn dấu và dấu quá hạn).

### Task 3 — Đường `/api/v1/me/devices` và báo mất máy · independent: false (sau Task 2)

- Files: `packages/core/src/thiet-bi/loai-may.ts` (+ `index.ts`, export `./thiet-bi` trong `packages/core/package.json`
  — chỉ thêm một dòng), `packages/api/src/me/routes.ts` (mới), `packages/api/src/app.ts` (đăng ký),
  `packages/api/test-db/tab-toi/thiet-bi.test.ts`.
- Interfaces:
  - `loaiMay(userAgent: string | null): "iphone" | "android" | "may-tinh" | "khac"` (iPad báo Mac có chạm → `iphone`
    không đo được ở máy chủ: máy chủ trả `may-tinh`, web sửa bằng `maxTouchPoints` cho dòng «Máy này»).
  - `GET /api/v1/me/devices` → `{ devices: { id: string; kind: LoaiMay; browser: string; lastUsedAt: string; current:
    boolean }[] }` từ `auth.api.listSessions` (chỉ phiên còn hạn, không trả `token`).
  - `POST /api/v1/me/devices/report-lost` thân `{ pushEndpoint?: string }` → `{ revoked: number }`. Thứ tự: đọc phiên
    khác → `ghiDau` → với từng sàn người là thành viên (`withCompany`): lấy đăng ký của người trừ `pushEndpoint`, gửi tin
    `{ title: "Quỹ hàng", body: "Quỹ hàng đã đăng xuất trên máy này", url: "/login?bi-bao-mat=1&u=<userId>", tag:
    "xoa-may" }` bằng `deps.pushSender ?? webPushSender` (lỗi gửi chỉ ghi nhật ký) rồi `goDangKy` → `auth.api.
    revokeOtherSessions`.
- Verify: `npm run test:db -w @quy-hang/api -- --test-name-pattern "thiết bị|báo mất"` và `npm test -w @quy-hang/core`.
- Phục vụ: E5, E6, E11b.

### Task 4 — Máy bị báo tự xoá kho (web) · independent: false (sau Task 2)

- Files: `apps/web/src/lib/sync/may-bi-bao.ts` (mới), chỉ thêm ở `lib/sync/gui.ts`, `keo.ts`, `types.ts`, `dong-bo.ts`,
  `react.tsx`; `apps/web/src/lib/push/dang-ky.ts` (thêm `huyDangKyTrenMay`); `apps/web/src/lib/api.ts` (`readMe` trả
  `{ biBaoMat: userId }` khi 401 mang mã); `apps/web/src/components/shell/shell-layout.tsx` (chuyển
  `/login?bi-bao-mat=1&u=…`); `apps/web/src/app/(auth)/login/` (khối báo + lời gọi xoá); `apps/web/public/sw.js` (hàm
  thuần `xuLyTinXoaMay(du, idb, reg)` + nhánh `tag === "xoa-may"`); bài kiểm `may-bi-bao.test.ts`, `sw-xoa-may.test.ts`.
- Interfaces:
  - `LanThu` thêm `"bi-bao-mat"`; gửi/kéo nhận 401 có `error === "device_reported_lost"` → lần thử `"bi-bao-mat"` mang
    `userId`; 401 khác giữ `"phien"` như cũ.
  - `xoaMayBiBao(userId: string, deps?: { xoaKho; huyDay }): Promise<void>` — xoá đúng `quy-hang-sync:<userId>`, huỷ
    đăng ký đẩy; không đụng kho khác.
- Verify: `npm test -w @quy-hang/web`.
- Phục vụ: E7b, E8, E11.

### Task 5 — Màn Tôi · independent: false (sau Task 3, 4)

- Files: `apps/web/src/app/(app)/me/page.tsx` (bỏ `Placeholder`), `me/nhom-dong.ts`, `me/cai-dat.ts`, `me/dong-may.ts`,
  `me/man-toi.tsx`, các `*.test.ts`; `apps/web/src/lib/push/nhan.ts` (bảng nhãn trạng thái thông báo, dải bật Hôm nay
  dùng lại — không đổi chữ); `apps/web/src/components/shell/dang-xuat-tren-may.ts` (hàm đăng xuất chung của menu tài
  khoản và tab Tôi).
- Interfaces:
  - `nhomDong(me: { email: string; companies: unknown[] }): NhomDong[]` — sáu nhóm theo thứ tự hợp đồng.
  - `phanLoaiCai(d: { daCai: boolean; coLoiMoi: boolean; ios: boolean }): "da-cai" | "co-nut" | "ios-ba-buoc" | "khac"`.
  - `trangThaiDongMay(s: { devices: number; dang: "doc" | "bao" | "xong" | "loi" | null; daThu?: number }): …` — năm
    trạng thái của E5b.
- Verify: `npm test -w @quy-hang/web && npm run lint && npm run typecheck`.
- Phục vụ: E1, E2, E3, E4, E5b, E10; mặt người E1b, E7c chấm ở S4.

### Task 6 — Môi trường chấm · independent: true

- Postgres dãy H: container `quy-hang-db-dkn-H` cổng 5574; gửi `yeu-cau khac` để giám sát ghi `.env.local`
  (`DATABASE_URL`) — luật 7, tin G-0311-14. Dữ liệu mẫu cho E1b, E7c: tài khoản mẫu một máy và ba máy tạo ngay trong ca
  kiểm (không thêm dữ liệu cá nhân thật).
- Verify: `npm run db:migrate && npm run db:test` xanh trên cây trước Task 1.

## Thứ tự

Task 6 và Task 1 trước (song song được), rồi 2 → 3 và 4 → 5. Chạy tuần tự trong phiên (các task phụ thuộc giao diện
nhau). Xong Task 5: `npm run typecheck && npm run lint && npm test && npm run build`, rồi hợp đồng sang `implemented`
và lượt chấm S4.

## Trọng tâm soi

1. Lời gọi có cookie phiên bị thu nhưng `getSession` của better-auth tự xoá cookie trước khi lối chặn đọc được — lối
   chặn phải đọc mã từ cookie gửi lên, không từ phản hồi.
2. Máy dùng chung có kho của hai người: chỉ kho của người bị báo bị xoá (E7b, E7c).
3. Người thuộc hai sàn: gỡ đăng ký ở cả hai, gửi tin xoá trước khi gỡ (E6, E11b).
4. Hết phiên thường vẫn giữ hàng đợi — ca dong-bo-tu-lanh AC-2 chạy nguyên văn (E8).
5. Máy đang bấm chưa bật thông báo (không `pushEndpoint`): mọi đăng ký của người bị gỡ, máy đang bấm không mất phiên.
