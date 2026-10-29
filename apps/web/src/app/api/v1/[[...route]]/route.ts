import { api } from "@quy-hang/api";
import { handle } from "hono/vercel";

// Mọi đường /api/v1/** đi vào cùng một app Hono ở packages/api — app web không tự viết route API riêng.
const handler = handle(api);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
