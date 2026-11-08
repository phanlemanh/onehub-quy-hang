# Vá nút «Ghim lại hồ sơ cần bản thật»: làn ghim lại tìm được kit trên máy chủ GitHub

Ngày 08/11/2026 · hàng `va-nut-ci-ag-root` (T3) · dãy Q, đợt `dau-khach-nhap` · Cổng Đáng: giám sát «build» (Q-12),
chủ kho giữ quyền kéo lại.

## Vì sao

Lượt bấm đầu tiên của nút (run 42421859175, 08/11, hồ sơ moi-truong-that, nhánh của PR #192) đỏ ở bước «Ghim lại»:

```
resolve-plugin: no usable install of "acceptance-gate" found … searched /home/runner/.claude/plugins/cache
```

Làn ghim lại (`repin-lane.mjs`) cần bộ máy của acceptance-gate (`lib/`, `scripts/recheck-evidence.cjs`). Vắng cờ
`--ag-root`, nó dò thư mục plugin dưới `$HOME/.claude/plugins/cache`. Máy chủ GitHub không cài plugin, nên làn dừng
(thoát 2) trước khi chạy suite hay eval nào. Luồng đã lấy kit theo `KIT_TAG` vào `$RUNNER_TEMP/kit` và đặt
`CLAUDE_PLUGIN_ROOT`, nhưng chỉ dùng biến đó để gọi tệp `repin-lane.mjs`, không chuyển cho làn làm gốc bộ máy.

Phép đo cũ của hàng ghim-lai-ban-that-qua-ci (E4, `kiem-nut.mjs --trong`) gọi `repin-lane.mjs` trên máy có plugin cài
sẵn và tự dựng dòng lệnh riêng, nên không thấy lỗi này.

## Thiết kế

1. Bước «Ghim lại» của `.github/workflows/ghim-lai-ban-that.yml` thêm `--ag-root "$CLAUDE_PLUGIN_ROOT"`. Cờ trỏ vào kit
   lấy theo tag ngoài cây kho, không trỏ cây nhánh (`.`): bộ máy của làn đến từ tag mà luồng của main chọn. Nhánh PR
   không thay được bộ máy ấy, cùng nguyên tắc «gác lấy từ main» của hàng ghim-lai-ban-that-qua-ci (sổ d-20261107T115018Z-2).
2. Không đổi bước nào khác của luồng, không đổi `KIT_TAG`, bộ chặn, bộ quét hay `config.yaml`.

## Bộ đo của hàng (`_acceptance/va-nut-ci-ag-root/thu/kiem-ag-root.mjs`)

Chỉ đọc cây kho. Kit, kho tạm và HOME rỗng nằm ở thư mục tạm của hệ điều hành.

- `--chay`: mọi thứ rút từ tệp luồng, chạy như máy chủ GitHub. Chạy khối `run` của bước lấy kit với `RUNNER_TEMP` và
  `GITHUB_ENV` tạm (kit theo `KIT_TAG` ở env của job). Dựng kho git tạm có một hồ sơ, đóng vai thư mục `nhanh`. Chạy dòng
  `run:` của bước «Ghim lại» với env của job + `GITHUB_ENV` + env của bước (biểu thức GitHub thay giá trị giả; bí mật thành
  chuỗi kết nối không kết nối được), `working-directory`, vỏ `bash --noprofile --norc -eo pipefail` và `HOME` rỗng. Ca
  này đòi làn chạy suite và eval, thoát 0, sổ chạy có dòng `kind: repin`. Đối chứng: cùng dòng bỏ `--ag-root` → thoát
  khác 0 với «no usable install of acceptance-gate», không pin — đúng lỗi run 42421859175. Trước gộp không có máy chủ
  GitHub thật nào chạy được bước này (nút tự chặn ref khác main), nên máy chủ thật là Đường đo sau gộp.
- `--tinh`: vế tĩnh `--ag-root "$CLAUDE_PLUGIN_ROOT"` và «CLAUDE_PLUGIN_ROOT là kit lấy theo `refs/tags/$KIT_TAG` vào
  `$RUNNER_TEMP/kit`», ghi qua `GITHUB_ENV` ở bước đứng trước «Ghim lại»; cùng bốn bản phá, mỗi bản hỏng đúng một vế: bỏ cờ, cờ trỏ `.`, kit lấy
  theo nhánh main, biến chỉ đặt ở env của bước lấy kit.

## Hồ sơ khác bị chạm

Hồ sơ ghim-lai-ban-that-qua-ci (đã ký) có eval đo tệp luồng (`paths`), nên đổi luồng làm nó cũ. Làn ghim lại của kit chạy
lại cả năm eval của nó trên cây mới rồi ghim lại. Khuyến nghị (câu hỏi cho chủ kho ở Cổng Phạm vi): không sửa tệp nào của
hồ sơ ấy; E4 của nó chạy trên máy có kit cài sẵn nên không chứng «nút chạy được trên máy chủ GitHub» — bằng chứng ấy là
AC-1 của hàng này (ghi ở Notes hợp đồng).

## Đường đo sau gộp

Bấm nút cho moi-truong-that trên nhánh của PR #192. Tệp đính kèm phải có dòng `kind: repin` (không `repin-do`), và PR #192
phải hết «bằng chứng cũ». Không làm được trước gộp vì `workflow_dispatch` chỉ chạy luồng có ở main.
