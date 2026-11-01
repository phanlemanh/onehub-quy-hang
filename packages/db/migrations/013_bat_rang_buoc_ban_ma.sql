-- 013_bat_rang_buoc_ban_ma.sql · Bật hẳn hai ràng buộc chặn số chủ để rõ của 008 và 009 khi bảng đã sạch (hàng
-- bat-rang-buoc-ban-ma, ADR-0013). Chỉ chủ bảng validate được, và trên bản thật vai chủ chỉ chạy qua job deploy
-- (ADR-0009 §2) — nên việc bật đi bằng migration. Xét từng bảng: còn số rõ thì không validate (validate sẽ ném và kéo
-- deploy hỏng), chỉ nhắc chạy lệnh mã hoá lại — lệnh ấy tự validate. Lời nhắc nêu số dòng, không nêu số. Ràng buộc đã
-- bật thì không làm gì, chạy lại vô hại. Vai migrate bỏ qua luật theo dòng (local superuser; thật `quy_hang_owner`
-- bypassrls) nên phép đếm thấy mọi sàn.

do $$
declare
  r record;
  con_so bigint;
begin
  for r in
    select * from (values
      ('listing_owners', 'listing_owners_phone_chi_ban_ma'),
      ('leads', 'leads_phone_chi_ban_ma')
    ) as t(bang, rang_buoc)
  loop
    if (select convalidated from pg_constraint
        where conname = r.rang_buoc and conrelid = format('public.%I', r.bang)::regclass) then
      continue;
    end if;
    execute format('select count(*) from public.%I where owner_phone is not null', r.bang) into con_so;
    if con_so = 0 then
      execute format('alter table public.%I validate constraint %I', r.bang, r.rang_buoc);
    else
      raise notice '% còn % dòng số rõ — ràng buộc % chưa bật; chạy packages/api/van-hanh/ma-hoa-lai.ts (lệnh tự bật)',
        r.bang, con_so, r.rang_buoc;
    end if;
  end loop;
end
$$;
