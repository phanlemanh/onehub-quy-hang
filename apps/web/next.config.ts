import type { NextConfig } from "next";

const config: NextConfig = {
  // Các gói trong kho xuất thẳng mã TypeScript; Next biên dịch cùng app.
  transpilePackages: ["@quy-hang/core", "@quy-hang/api", "@quy-hang/connect"],
};

export default config;
