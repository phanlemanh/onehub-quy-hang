import type { NextConfig } from "next";

const config: NextConfig = {
  // Các gói trong kho xuất thẳng mã TypeScript; Next biên dịch cùng app.
  transpilePackages: ["@quy-hang/core", "@quy-hang/api", "@quy-hang/connect"],
  // Chỉ máy dev: mở máy dev qua 127.0.0.1 để có kho cookie riêng — cookie không tách theo cổng, nên mọi máy dev của các
  // dãy trên `localhost` chung một cookie phiên (va-pool-ket-noi, bài nhìn E3). Bản build không đọc khoá này.
  allowedDevOrigins: ["127.0.0.1"],
};

export default config;
