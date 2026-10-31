import type pg from "pg";
export function moSan(client: pg.ClientBase, p: { ten: string; email: string }): Promise<{ companyId: string; userId: string; daCo: number; chayLai: boolean }>;
