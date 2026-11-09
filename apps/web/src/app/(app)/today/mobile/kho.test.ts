// Hôm nay đầu chủ trên điện thoại (hàng 39: E1) — rẽ khổ qua đúng hàm màn đang dùng (useDienThoai → khoCuaSo, ngheKho).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { khoCuaSo, ngheKho, TRUY_VAN_DIEN_THOAI } from "./kho";

/** Ma trận viết trước 5 khổ → khổ mong (true = điện thoại). */
const MA: [number, boolean][] = [
  [375, true],
  [390, true],
  [767, true],
  [768, false],
  [1440, false],
];
type HamKho = typeof khoCuaSo;
const lechKho = (ham: HamKho) => MA.filter(([r, mong]) => ham({ innerWidth: r }) !== mong).map(([r]) => `${r}px`);

test("E1 rẽ khổ (5 khổ viết trước): dưới 768 là điện thoại, từ 768 là lưới — qua hàm màn đọc", () => {
  assert.equal(MA.length, 5);
  assert.deepEqual(lechKho(khoCuaSo), []);
});

test("E1 đối chứng đỏ: bản sao lấy mốc 1024 → bộ so nêu đúng khổ lệch", () => {
  assert.deepEqual(lechKho((w) => w.innerWidth < 1024), ["768px"]);
});

test("E1 màn nghe đổi khổ ở đúng mốc 767 px và gỡ khi rời", () => {
  const g: string[] = [];
  const f = () => {};
  const go = ngheKho(
    {
      matchMedia: (q) => {
        g.push(`hoi:${q}`);
        return { addEventListener: (_t, h) => void g.push(h === f ? "nghe" : "nghe-la"), removeEventListener: (_t, h) => void g.push(h === f ? "go" : "go-la") };
      },
    },
    f,
  );
  go();
  assert.equal(TRUY_VAN_DIEN_THOAI, "(max-width: 767px)");
  assert.deepEqual(g, ["hoi:(max-width: 767px)", "nghe", "go"]);
});

// Chốt nối: màn Hôm nay đầu chủ rẽ khổ bằng useDienThoai, không bằng hook khổ khác (mốc viết hai lần là đường lệch).
test("E1 màn rẽ khổ bằng useDienThoai của kho.ts, không còn useIsMobile", () => {
  const man = readFileSync(fileURLToPath(new URL("../hom-nay.tsx", import.meta.url)), "utf8");
  assert.match(man, /const dienThoai = useDienThoai\(\);/);
  assert.match(man, /import \{ useDienThoai \} from "\.\/mobile\/kho";/);
  assert.doesNotMatch(man, /useIsMobile/);
});
