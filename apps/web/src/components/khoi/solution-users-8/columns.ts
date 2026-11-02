// Phần của chuyển thể solution-users-8: cột của mỗi dòng giữ lớp của khối; bỏ cột «meta» (cách đăng nhập, công ty khách)
// vì Quỹ hàng không có dữ liệu ấy. Cột trạng thái chở vùng phụ trách nên được xuống dòng.
export const COL = {
  person: "min-w-0 basis-full @2xl:basis-0 @2xl:flex-1",
  status: "me-auto flex shrink-0 flex-wrap gap-1 @2xl:me-0 @2xl:w-40",
  control: "flex h-8 w-28 shrink-0 items-center @2xl:w-32",
  actions: "flex w-18 shrink-0 justify-end gap-1",
};
