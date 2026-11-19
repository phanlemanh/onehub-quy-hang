// Bảng tên lệnh cũ → mới của kit 3.0, chép từ migration/chay-thu-phien/bang-ten.json (kho delivery-loop, nhánh chuyen-nha,
// khoá «lenh»). Một nguồn cho bài quét tên cũ (thu/) và bài đối chiếu với cây kit (rang/doi-chung.mjs --duong).
export const BANG = {
  "dieu-phoi:mo-dot": "dispatch:open",
  "dieu-phoi:dong-dot": "dispatch:close",
  "dieu-phoi:tiep-tuc": "dispatch:resume",
  "dieu-phoi:ban-giao": "dispatch:handoff",
  "dieu-phoi:xem": "dispatch:status",
  "road-map:xem": "roadmap:status",
  "road-map:ghim": "roadmap:pin",
  "road-map:bo-ghim": "roadmap:unpin",
  "road-map:tra-lai": "roadmap:undo",
  "road-map:gui": "roadmap:suggest",
  "tri-thuc:ghi": "knowledge:ingest",
  "tri-thuc:kiem": "knowledge:health",
  "acceptance-gate:cat-luot": "acceptance-gate:scope-slice",
  "acceptance-gate:gom-tin-hieu": "acceptance-gate:signal-intake",
};
