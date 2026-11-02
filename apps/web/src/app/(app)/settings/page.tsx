import { redirect } from "next/navigation";

// Cài đặt sàn mở vào mục đầu của cột thứ hai — Người dùng.
export default function Page() {
  redirect("/settings/users");
}
