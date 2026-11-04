import { redirect } from "next/navigation";

// Tab Tôi (hàng 38) nay là Cài đặt › Cá nhân (hàng cai-dat-hop-nhat): địa chỉ cũ chuyển về một nội dung duy nhất.
export default function Page() {
  redirect("/settings/personal");
}
