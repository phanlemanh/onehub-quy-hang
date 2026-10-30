// Nhãn năm vai trên màn (CONTEXT.md, ADR-0006); mã vai do API trả.
export const VAI: { ma: string; nhan: string }[] = [
  { ma: "telesales", nhan: "Telesales" },
  { ma: "listing_agent", nhan: "Đầu chủ" },
  { ma: "buyer_agent", nhan: "Đầu khách" },
  { ma: "team_lead", nhan: "Trưởng nhóm" },
  { ma: "company_admin", nhan: "Quản trị sàn" },
];
export const nhanVai = (ma: string) => VAI.find((v) => v.ma === ma)?.nhan ?? ma;
