// Ghi số nền của lõi nhập vào hồ sơ hàng 64: `node --import tsx packages/core/test/import/ghi-so-nen.ts`.
import { writeFileSync } from "node:fs";
import { SO_NEN_URL, tinhSoNen } from "./do";

writeFileSync(SO_NEN_URL, `${JSON.stringify(tinhSoNen(), null, 2)}\n`);
process.stdout.write(`đã ghi ${SO_NEN_URL.pathname}\n`);
