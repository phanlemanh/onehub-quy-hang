import { getApi } from "@/lib/api";

// Mọi đường /api/v1/** đi vào cùng một app Hono ở packages/api — app web không tự viết route API riêng.
const handler = (req: Request) => getApi().fetch(req);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
