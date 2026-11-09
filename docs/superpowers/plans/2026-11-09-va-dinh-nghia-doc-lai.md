# va-dinh-nghia-doc-lai Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> Trong vòng feature-loop của kho này: thực thi TUẦN TỰ trong phiên chính (S3), rồi chấm bằng Workflow S4.

**Goal:** Dòng định nghĩa bao phí ở hồ sơ căn không đọc dấu khi giá còn chờ gửi và đọc lại ngay khi giá lên máy chủ.

**Architecture:** Mô hình hồ sơ thêm `giaChoGui`, `keoLuc`. Một bộ đọc không dính React (`doc-dau.ts`) giữ thứ tự đọc; thành phần chỉ nối. Lời đọc đi qua hàm gọi API của bộ đồng bộ.

**Tech Stack:** TypeScript, Next.js, `node:test` với `tsx`, máy chủ giả `mayChuGia`, API thật trên Postgres dãy Q (cổng 5577), Chrome không đầu qua CDP.

**Spec:** `docs/superpowers/specs/2026-11-09-va-dinh-nghia-doc-lai-design.md` · hợp đồng `_acceptance/va-dinh-nghia-doc-lai/contract.md`

## Global Constraints

- Chữ dòng định nghĩa không đổi (`dongDinhNghia` giữ nguyên).
- Chỉ `price_changed` của chính căn mới chặn đọc.
- Mất mạng và 5xx là hỏng; 200 và 4xx là kết quả cuối.
- Không đổi máy chủ, cơ sở dữ liệu. Chỉ chạm vùng đã khai của hàng.

## Review Focus

- Phản hồi của lần đọc trước lúc chờ gửi về muộn: phải bị bỏ (Task 1).
- Đổi giá đi rồi đổi về đúng giá cũ: phải đọc lại (Task 1).
- Lần kéo định kỳ tới trong lúc lần đọc đầu đang bay: không được đọc chồng (Task 1).
- Giá bị từ chối: không bước nào đọc theo giá vừa bị từ chối (Task 2).
- React chạy hiệu ứng hai lần ở bản dev: chỉ một lời đọc (Task 1, E4).

---

### Task 1: Bộ đọc và mô hình

**Files:** Create `apps/web/src/app/(app)/units/ho-so/doc-dau.ts`, `dinh-nghia-doc-lai.test.ts`; Modify `mo-hinh.ts`, `dong-dinh-nghia.tsx`, `than-cot.tsx`, các fixture `VaoHoSo` trong test.
**Phục vụ:** E1, E2, E5, E6, E7, E8, E11, E12. **independent:** false.

**Interfaces — Produces:** `khoaGia(v)`, `khoaDoc(v, giu): string | null`, `chuDong(v, giu): string | null`, `docDau(goi, listingId): Promise<KetQuaDoc>`, `taoBoDocDau(doc)` với `{ vao(v), chu(v), dangKy(f), phienBan() }`; `HoSoCo.giaChoGui: boolean`, `HoSoCo.keoLuc: string | null`.

- [ ] Viết ma trận và chuỗi trên bộ đồng bộ thật (`mayChuGia`), đủ cặp đối chứng đỏ có thông điệp ghim. Verify: `TSX_TSCONFIG_PATH=tsconfig.test.json node --import tsx --test "src/app/(app)/units/ho-so/dinh-nghia-doc-lai.test.ts"` ở `apps/web`, thấy đỏ.
- [ ] Viết `doc-dau.ts`, sửa `mo-hinh.ts`, nối thành phần. Chạy lại, thấy xanh; `npm run typecheck && npm run lint`.
- [ ] Commit `feat(web): dòng định nghĩa đọc lại khi giá đồng bộ xong`.

### Task 2: Bộ đo trên API thật và màn đang chạy

**Files:** Create `apps/web/src/lib/sync/test-db/dinh-nghia-doc-lai.db-test.mts`, `_acceptance/va-dinh-nghia-doc-lai/thu/chay-db.mjs`, `thu/dung.mjs`, `thu/chay-ui.mjs`.
**Phục vụ:** E3, E4, E5b, E7b. **independent:** false (sau Task 1).

- [ ] Viết ba ca trên API thật. Verify: `node _acceptance/va-dinh-nghia-doc-lai/thu/chay-db.mjs` exit 0.
- [ ] Viết chỗ thử nhìn màn: chặn lệnh ghi sự kiện qua CDP, đổi tỉ lệ sàn, sửa giá ở ô Bảng hàng, bỏ chặn, đọc dòng ở cột hồ sơ. Verify: chạy, đối chiếu dòng JSON.
- [ ] Commit `test(web): bộ đo dòng định nghĩa đọc lại`.
