import type { ReactNode } from "react";

// Khung tạm của màn đăng nhập, chọn sàn, chưa gắn sàn — không vỏ (Tham chiếu §9). Chuyển thể khối ReUI `auth-15`
// sau khi hàng 4 gộp (ADR-0003, Hỏi-3); tới đó giữ tối giản như trang giữ chỗ.
export function Khung({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", maxWidth: 360, margin: "64px auto", padding: 24, lineHeight: 1.5 }}>
      <h1 style={{ fontSize: 22, margin: "0 0 16px" }}>{title}</h1>
      {children}
    </main>
  );
}

export const nut = { padding: "8px 14px", fontSize: 15, cursor: "pointer" } as const;
export const o = {
  display: "block",
  width: "100%",
  padding: 8,
  fontSize: 16,
  margin: "4px 0 12px",
  boxSizing: "border-box",
  border: "1px solid #8a8a8a",
  borderRadius: 6,
} as const;
