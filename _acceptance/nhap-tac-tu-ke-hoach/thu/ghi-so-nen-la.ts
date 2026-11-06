import { writeFileSync } from "node:fs";
import { SO_NEN_LA_URL, tieuDeDaBiet, tinhSoNenLa } from "./bo-la";

const biet = tieuDeDaBiet();
if (biet.length) throw new Error(`bộ lạ còn tiêu đề từ điển đã biết: ${biet.join(", ")}`);
writeFileSync(SO_NEN_LA_URL, JSON.stringify(tinhSoNenLa(), null, 2) + "\n");
