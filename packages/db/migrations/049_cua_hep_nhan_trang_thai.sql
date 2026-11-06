-- 049_cua_hep_nhan_trang_thai.sql · Cửa hẹp cho quản trị sàn khi gỡ nhãn trạng thái riêng (hàng 46 trang-thai-rieng, sau
-- luật 046 của hàng bang-quyen-theo-vai). Từ 046 quản trị sàn không đọc, không ghi được hàng và sự kiện hàng, nên màn
-- Trạng thái riêng mất hai việc cần cho quản trị: đếm căn đang mang một mã nhãn (để báo «N căn đang mang — cần nhãn thay»)
-- và chuyển mỗi căn còn mang mã bị gỡ sang nhãn thay. Chủ kho chốt «Cửa hẹp, mig 049» (sổ quyết định của
-- _acceptance/trang-thai-rieng): không nới luật theo dòng của 046, mở đúng hai hàm security definer dưới — chỉ quản trị sàn
-- của sàn đang làm gọi được, chỉ chạm căn của sàn đang làm, hàm chuyển chỉ đổi cột `status_label` và `version` của bản tính
-- cùng một sự kiện `status_changed {to: trạng thái hiện tại, label: nhãn thay}` mỗi căn — đúng bước gấp «đổi nhãn tại chỗ»
-- của lõi (`stepListing`), nên bảng hàng vẫn bằng bản gấp lại từ sự kiện. Không bảng mới, không cột mới. Số 049 do giám sát
-- cấp.
--
-- Khuôn hàm chép 027 và 046: security definer, search_path rỗng, sàn lấy từ `app.current_company_id()`, xét vai bằng
-- `app.current_user_roles()`, chỉ `quy_hang_app` được gọi. P0002: người gọi không phải quản trị của sàn đang làm. 22023
-- 'ma-nhan': mã sai khuôn `^[a-z][a-z0-9_]{0,31}$` (hằng `MA_NHAN_RE` của lõi). 22023 'nhan-thay': nhãn thay không còn
-- trong bộ nhãn của sàn hay neo trạng thái khác trạng thái của căn.

-- ---- Đếm ----
-- Số căn của sàn đang làm (chưa gỡ khỏi Quỹ hàng) đang mang mã nhãn.
create or replace function app.count_listings_with_status_label(p_code text) returns integer
  language plpgsql stable security definer set search_path = ''
  as $$
  declare
    san uuid := app.current_company_id();
  begin
    if san is null or not ('company_admin' = any (app.current_user_roles())) then
      raise exception 'không có quyền đếm căn mang nhãn' using errcode = 'P0002';
    end if;
    if p_code is null or p_code !~ '^[a-z][a-z0-9_]{0,31}$' then
      raise exception 'ma-nhan' using errcode = '22023';
    end if;
    return (select count(*)::int from public.listings l
            where l.company_id = san and l.status_label = p_code and not l.voided);
  end
  $$;
revoke all on function app.count_listings_with_status_label(text) from public;
grant execute on function app.count_listings_with_status_label(text) to quy_hang_app;

-- ---- Chuyển ----
-- Mỗi căn của sàn đang làm còn mang `p_code` ở lúc gọi (khoá theo hàng; căn đã rời mã giữa chừng thì bỏ qua) nhận một sự
-- kiện `status_changed {to: trạng thái hiện tại, label: p_replacement}` ghi bằng người đang gọi và vai lúc làm, không tính là
-- xác nhận với chủ nhà; bản tính đổi `status_label` và `version`. `p_replacement` null = nhãn mặc định của neo. Trả số căn đã
-- chuyển. Người gọi giữ khoá bộ nhãn của sàn (API `khoaBoTrangThai`) trước khi gọi.
create or replace function app.relabel_listings_status_label(p_code text, p_replacement text) returns integer
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    san uuid := app.current_company_id();
    toi text := app.current_user_id();
    vai text[] := app.current_user_roles();
    so int := 0;
    r record;
  begin
    if san is null or toi is null or not ('company_admin' = any (vai)) then
      raise exception 'không có quyền chuyển nhãn của căn' using errcode = 'P0002';
    end if;
    if p_code is null or p_code !~ '^[a-z][a-z0-9_]{0,31}$'
       or (p_replacement is not null and p_replacement !~ '^[a-z][a-z0-9_]{0,31}$') then
      raise exception 'ma-nhan' using errcode = '22023';
    end if;
    for r in
      select l.id, l.version, l.standard_status from public.listings l
      where l.company_id = san and l.status_label = p_code and not l.voided
      order by l.id
      for update
    loop
      if p_replacement is not null and not exists (
        select 1 from public.company_settings s
        where s.company_id = san and s.key = 'labels.status.' || p_replacement
          and s.value ->> 'anchor' = r.standard_status
      ) then
        raise exception 'nhan-thay' using errcode = '22023';
      end if;
      insert into public.listing_events
        (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner, device, made_offline, import_id)
      values
        (san, r.id, r.version + 1, 'status_changed',
         jsonb_build_object('to', r.standard_status, 'label', p_replacement),
         toi, vai, false, null, false, null);
      update public.listings set status_label = p_replacement, version = r.version + 1
        where company_id = san and id = r.id;
      so := so + 1;
    end loop;
    return so;
  end
  $$;
revoke all on function app.relabel_listings_status_label(text, text) from public;
grant execute on function app.relabel_listings_status_label(text, text) to quy_hang_app;
