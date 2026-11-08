# Hình tại điểm quyết định — va-nut-ci-gitleaks

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 kiểm băm gitleaks trước khi giải nén (d-20261108T070834Z-3) | 2 nhánh rẽ (kiểm · không kiểm như ci.yml) | luong-nut.html |
| Hỏi-2 cách đo bước cài trước gộp (d-20261108T071750Z-8; gap-probe P0 thứ hai, human-gate1) | 2 nhánh rẽ (dựng lại tại máy + Đường đo · luồng thử trên ubuntu thật) | luong-nut.html |
| Hỏi-3 hai hồ sơ đã ký đo tệp luồng (d-20261108T071750Z-9; gap-probe P0 thứ nhất, human-gate1) | 2 nhánh rẽ (ghim lại cả hai · để cũ) | luong-nut.html |

## Đề bài hình `luong-nut`

- Loại hình: luồng (flowchart dọc) các bước của nút «Ghim lại hồ sơ cần bản thật» trên GitHub Actions.
- Nút theo thứ tự: Chỉ từ main → checkout goc (main) → checkout nhanh (nhánh PR) → setup-node → Lấy kit theo tag → **[MỚI] Cài gitleaks** (tải tệp → kiểm băm sha256 → giải nén → GITHUB_PATH) → Chặn hồ sơ còn eval chạy bộ kiểm ghi → npm ci --ignore-scripts → Ghim lại (bí mật bản thật; bên trong: bộ kiểm chung có «bài tự kiểm của rào» cần gitleaks khi CI=true) → Quét bí mật → Gửi tệp đính kèm.
- Đánh dấu ba chỗ quyết (nhãn bằng chữ): Hỏi-1 ở bước kiểm băm (kiểm · không kiểm); Hỏi-2 cạnh bước cài (đo trước gộp: dựng lại tại máy · luồng thử ubuntu); Hỏi-3 cạnh Ghim lại (hai hồ sơ đã ký đo tệp luồng: ghim lại · để cũ).
- Một chú thích nhỏ: lượt bấm run 42440631323 đỏ ở «bài tự kiểm của rào» vì thiếu gitleaks. AC liên quan: AC-1 (bước cài), AC-2 (chạy bước cài), AC-3 (bài tự kiểm).
