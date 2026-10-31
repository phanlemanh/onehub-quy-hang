# Răng giữ khuôn — thiết kế (hàng 59)

Hồ sơ `_acceptance/rang-giu-khuon/` · đợt `ban-do-khuon-3110` (mã QK2) · dãy D, đợt điều phối `nen-2`. Gộp thêm Ngoài-5
của hàng 58 (khối cấm của ba nhóm màn chưa bị chặn — chủ kho chọn «mở hợp đồng mới», giám sát giao vào hàng này).

## Vì sao

Lời dặn không giữ được điểm chọn khuôn khi tác tử viết mã. Hàng 58 đã có bản đồ `design/patterns/` và lệnh kiểm
`packages/ui-lint/ban-do-khuon.mjs` đo trạng thái cây, nhưng chưa có gì chặn lúc viết: chưa ai chạy lệnh ấy trong
`npm run lint`, và khối cấm khai cho ba nhóm màn chưa được kiểm. Răng rẻ trước, đắt sau: lint cấm nhập theo vùng chạy
trong trình soạn và CI, rồi bài quét cho phần lint không phủ (gốc khuôn, khe, trạng thái trần).

## Ba lớp răng

1. **Luật lint `quy-hang-ui/ban-do-khuon`** (`packages/ui-lint/rules/ban-do-khuon.mjs`, đăng ký trong plugin — cấu hình
   eslint của kho tự bật mọi luật của plugin ở mức error cho `apps/web/src`). Với tệp khớp `nhan_dien` của một nhóm
   (trừ ngoại lệ và tệp khuôn của chính nhóm): mỗi lần nhập một tên trong `cam_ngoai_khuon` là một lỗi tại dòng nhập,
   thông điệp nêu tệp, khối, nhóm, khuôn phải dùng và tệp bản đồ. So theo **tên gốc** của khối (`Frame as F` vẫn là
   `Frame`). Bản đồ đọc lỗi (thiếu khoá, ngoại lệ thiếu lý do…) → một lỗi ở đầu mọi tệp của `apps/web/src`, nêu lỗi đọc.
   Đây là phần chặn Ngoài-5: khối cấm của nhóm màn nay bị chặn.
2. **Bài quét trong `npm run lint`**: `packages/ui-lint/kiem-chuan.mjs` (đã chạy cuối `npm run lint`, CI job `check`)
   thêm bước gọi bộ kiểm của hàng 58 — lỗi đọc bản đồ hay lệch gốc/khe/trạng thái là một dòng lệch và lệnh đỏ. Dòng
   tóm tắt khi sạch: `khuôn: 4 nhóm · 0 lỗi đọc · 0 lệch`.
3. **Chế độ theo diff `--base <ref>`** của `ban-do-khuon.mjs`: chỉ chấm tệp đổi so `<ref>` (`git diff --name-only <ref>` cộng tệp
   chưa theo dõi `git ls-files --others --exclude-standard`), và trong tệp đổi chỉ chấm lệch nằm trên dòng thêm/đổi
   (`git diff -U0`; tệp mới thì mọi dòng); lệch trên dòng không đổi in nhãn «nợ cũ», không làm đỏ. Không tệp nào đổi thuộc `nhan_dien` của nhóm nào và `design/patterns/` không đổi → im (một
   dòng «khuôn: không tệp nào của nhóm đổi», thoát 0) — kể cả khi cây còn nợ cũ ở tệp khác. Đổi `design/patterns/` thì
   lỗi đọc bản đồ vẫn được nêu. Kit sẽ dùng chế độ này ở bước chấm (finding §11.4 «kiem --base»).

## Không làm

- Bắt khối báo đổi tên trong bài quét trạng thái (Ngoài-4 hàng 58, đã ghi giới hạn); lint (lớp 1) đã so tên gốc ở
  dòng nhập.
- Ảnh màn mới cạnh màn mẫu, luật nhóm mới — hàng 60.

## Tài liệu

Skill `quy-hang-ui` (bảng luật «Mười luật» → mười một), `vo-va-ia.md` §2 (một câu: lint và bài quét giữ bản đồ).

## Đặc tả UX

Bỏ — hàng không chạm màn nào (sổ quyết định, dòng «bỏ đặc-tả-UX»).
