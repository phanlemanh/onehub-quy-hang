# Kế hoạch thi công — cai-dat-hop-nhat (T2, không có chốt duyệt kế hoạch)

Hợp đồng: `contract.md` (duyệt 04/11). Thiết kế: `design.md`. Mọi task tuần tự trong phiên chính (cùng chạm vỏ).

| Task | Việc | Tệp | Kiểm từng task | Phục vụ | independent |
|---|---|---|---|---|---|
| T1 | Lõi điều hướng: mọi vai có cột nhà có nhà «Cài đặt»; nhãn nhà «Cài đặt»; đích nhà Cài đặt theo quyền (`settingsLanding`); tab Tôi mở `/settings/personal`; tab đang chọn theo đường (`activeTab`), không bao giờ hai tab | `packages/core/src/navigation.ts`, `navigation.test.ts` | `npm test -w @quy-hang/core` | E1, E3, E8 | false |
| T2 | Vỏ: cột Cài đặt hai nhóm từ hàm thuần `cotCaiDat(roles, tenSan)`; menu tài khoản theo vai `mucTaiKhoan(roles)`; tab điện thoại dùng `activeTab`, nhãn tab «Cài đặt sàn» | `components/shell/second-column.tsx`, `cai-dat.ts` (+test), `account-menu.tsx`, `mobile-shell.tsx`, `nav-labels.ts`, `app-shell.tsx`, `tieu-de.ts` | `npm test -w @quy-hang/web` | E2, E3b | false |
| T3 | Trang: `/settings/personal` dựng `ToiThat` trong khuôn Tôi đường dẫn «Cài đặt › Cá nhân», câu phạm vi, câu báo `?chi-quan-tri=1`; `/me` chuyển; `/settings` theo `settingsLanding`; mọi mục sàn gọi hàm chặn `chanMucSan`; bảng chữ phạm vi; «trên máy này» ở dòng cài, thông báo | `app/(app)/settings/**`, `app/(app)/me/**` | `npm test -w @quy-hang/web` | E4, E5, E6 | false |
| T4 | Bố cục Đọc hẹp: gốc thân «doc» mang `max-w-(--container-doc)`, không `mx-auto` | `components/bo-cuc/bo-cuc.tsx`, `bo-cuc.test.ts` | `npm test -w @quy-hang/web` | E7 | false |
| T5 | Tài liệu và khuôn: mục sửa đổi 04/11 ở vỏ, ADR-0024; Tham chiếu §9, §12; CONTEXT; `design/patterns/toi.md`, `cai-dat-san.md`; bài kiểm tài liệu `thu/tai-lieu.test.mjs` | docs, `design/patterns/*`, `_acceptance/cai-dat-hop-nhat/thu/` | `npm run lint`; `node --test _acceptance/cai-dat-hop-nhat/thu/*.test.mjs` | E9, E10, E10b | false |
| T6 | Chỗ thử ui-check: `thu/dung-h.mjs`, `thu/chay-ui.mjs` (theo hàng 38/43) | `_acceptance/cai-dat-hop-nhat/thu/` | chạy ở lượt chấm | E11 | false |

Cuối: `npm run typecheck && npm run lint && npm test`.
