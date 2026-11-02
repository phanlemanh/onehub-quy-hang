import { LogOutIcon, MapPinIcon, PencilIcon, PlusIcon, SearchIcon, SendIcon, Trash2Icon, UserPlusIcon, UsersIcon } from "lucide-react";

// Phần của chuyển thể solution-users-8: bộ biểu tượng của khối, bỏ những cái của phần đã gỡ (xuất CSV, gia hạn khách,
// gửi lại lời mời, cảnh báo, SSO); thêm sửa, rời sàn và vùng.
export const UI_ICONS = {
  search: <SearchIcon aria-hidden="true" />,
  invite: <UserPlusIcon aria-hidden="true" />,
  send: <SendIcon aria-hidden="true" />,
  remove: <Trash2Icon aria-hidden="true" />,
  leave: <LogOutIcon aria-hidden="true" />,
  edit: <PencilIcon aria-hidden="true" />,
  people: <UsersIcon aria-hidden="true" />,
  zones: <MapPinIcon aria-hidden="true" />,
  add: <PlusIcon aria-hidden="true" />,
};
