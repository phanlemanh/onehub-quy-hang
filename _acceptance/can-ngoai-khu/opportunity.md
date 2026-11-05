---
schema_version: 1
slug: can-ngoai-khu
feature: Hàng tạo được trên lô thấp tầng trong khu và trên nhà, đất ngoài khu định danh bằng địa chỉ chuẩn; căn ngoài khu là bản ghi của sàn, sàn khác không thấy, và hàng cũ gấp lại ra đúng như trước
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-05T12:56:24Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 76
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 76 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/moi-loai-hinh-3110.md#ccc48fc8fec00f5ce684d6e9f4d9a9c953db1b21` — chưa có trang: trang nền, mã LH5

Hàng tạo được trên lô thấp tầng trong khu và trên nhà, đất ngoài khu định danh bằng địa chỉ chuẩn; căn ngoài khu là bản ghi của sàn, sàn khác không thấy, và hàng cũ gấp lại ra đúng như trước

Vì sao: Sự kiện created bắt buộc buildingName và cột building_name not null (ADR-0008, migration 004): nhà không có toà không tạo được hàng; ADR-0016 quyết định 3, 4

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Tạo được hàng Townhouse, Single Family Residence, Unimproved Land qua lệnh API; căn ngoài khu cùng khoá địa chỉ trong một sàn là một căn; bảng căn ngoài khu bật và ép luật theo dòng, có ca trong bộ kiểm cách ly; xoá trắng bảng hàng rồi gấp lại từ sự kiện ra đúng bảng cũ, kể cả sự kiện cũ mang buildingName; payload mang khoá nguồn vẫn bị từ chối» chưa?
- Kết quả nào là SỐNG: [đề xuất] Tạo được hàng Townhouse, Single Family Residence, Unimproved Land qua lệnh API; căn ngoài khu cùng khoá địa chỉ trong một sàn là một căn; bảng căn ngoài khu bật và ép luật theo dòng, có ca trong bộ kiểm cách ly; xoá trắng bảng hàng rồi gấp lại từ sự kiện ra đúng bảng cũ, kể cả sự kiện cũ mang buildingName; payload mang khoá nguồn vẫn bị từ chối
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Tạo được hàng Townhouse, Single Family Residence, Unimproved Land qua lệnh API; căn ngoài khu cùng khoá địa chỉ trong một sàn là một căn; bảng căn ngoài khu bật và ép luật theo dòng, có ca trong bộ kiểm cách ly; xoá trắng bảng hàng rồi gấp lại từ sự kiện ra đúng bảng cũ, kể cả sự kiện cũ mang buildingName; payload mang khoá nguồn vẫn bị từ chối» khi hết timebox
- Timebox: …
