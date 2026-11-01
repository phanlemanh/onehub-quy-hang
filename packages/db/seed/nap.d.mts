// Khai kiểu cho phần bộ nạp bản thật (nap-ban-that.ts) dùng — mô-đun viết bằng JavaScript (như scripts/mo-san.d.mts).
import type pg from "pg";
export function napMau(client: pg.ClientBase, d: unknown, sanId?: string): Promise<{ san: string }>;
