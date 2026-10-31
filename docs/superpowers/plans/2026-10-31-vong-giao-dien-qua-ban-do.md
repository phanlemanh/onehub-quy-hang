# Kế hoạch — vong-giao-dien-qua-ban-do (hàng 60)

Thiết kế: `docs/superpowers/specs/2026-10-31-vong-giao-dien-qua-ban-do-design.md`. Hồ sơ: `_acceptance/vong-giao-dien-qua-ban-do/`.
Chạy tuần tự trong phiên chính (các task chạm chung `lib/ban-do.mjs` hay dùng kết quả của nhau).

| # | Task | Tệp | Kiểm từng task | Phục vụ | independent |
|---|---|---|---|---|---|
| 1 | Răng «màn ngoài bản đồ»: `manNgoaiBanDo` trong lib, nối vào `ban-do-khuon.mjs` (đầy đủ, `--base`, `--json`) và `kiem-chuan.mjs` | `packages/ui-lint/lib/ban-do.mjs`, `ban-do-khuon.mjs`, `kiem-chuan.mjs`, `tests/man-ngoai-ban-do.test.mjs` | `npm test -w @quy-hang/ui-lint` + lượt phá: bỏ nối ở `--base` → ca E5 đỏ | E4, E5, E5b | false |
| 2 | `doi-chieu.mjs`: `--base`, `--mau`, `--dung` | `packages/ui-lint/doi-chieu.mjs`, `tests/doi-chieu.test.mjs` | test + lượt phá: bỏ tệp chưa theo dõi → ca E1 đỏ; bỏ ô thiếu ảnh → ca E2 đỏ | E1, E2, E3a | false |
| 3 | `so-do-vong.mjs` + sổ `docs/design/lech-lot.md` | `packages/ui-lint/so-do-vong.mjs`, `tests/so-do-vong.test.mjs`, `docs/design/lech-lot.md` | test + lượt phá: không trừ lệch còn ở HEAD → ca c5 đỏ | E6, E7 | false |
| 4 | Luật chữ: `vo-va-ia.md` §2, skill `quy-hang-ui` (mục mới + dòng bảng luật), `trang-tam.md` KH-tt-roi-nhom trỏ luật nhóm mới | `docs/design/vo-va-ia.md`, `.agents/skills/quy-hang-ui/SKILL.md`, `design/patterns/trang-tam.md` | `npm run lint` (kiem-chuan đọc skill) | E8 | false |
| 5 | Hồ sơ tự áp: cấu hình `web-a`, khoá `executors.script.ho_so_vong_giao_dien`, `thu/kiem-ho-so.mjs` + test hai chiều; chụp màn mẫu ở bước chấm (E3), ghi `khuon-so-do.json` | `.claude/launch.json`, `_acceptance/config.yaml`, `_acceptance/vong-giao-dien-qua-ban-do/thu/**` | `node --test _acceptance/vong-giao-dien-qua-ban-do/thu/*.test.mjs` | E9 | false |

Lựa chọn tải trọng: răng nằm ngoài `kiemCay` (hàm riêng, cộng vào danh sách lệch ở hai lệnh) để dòng tóm tắt bốn nhóm của
hàng 58 không đổi.
