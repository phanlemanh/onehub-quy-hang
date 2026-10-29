---
name: verify
description: Kiểm kho onehub-quy-hang trước khi commit hoặc báo xong — kiểm kiểu, lint, test, build, bài tự kiểm của rào, và bộ kiểm cách ly khi chạm cơ sở dữ liệu. Dùng khi người dùng nói "verify", "kiểm lại", "chạy test", hoặc trước khi commit một thay đổi code.
allowed-tools: Bash(git *) Bash(npm *) Bash(docker *) Bash(node *)
---

# /verify

Chạy từ gốc kho, theo thứ tự; dừng ở bước đỏ đầu tiên và báo đúng lỗi.

1. `npm run typecheck`
2. `npm run lint`
3. `npm test`
4. `npm run test:hooks` — khi đổi `.claude/` hoặc `.githooks/`
5. `npm run build` — khi đổi `apps/web` hoặc gói nó dùng
6. Khi đổi `packages/db/`: dựng Postgres tạm rồi chạy bộ kiểm cách ly, xong thì xoá container.

```bash
docker run --rm -d --name quy-hang-db -e POSTGRES_PASSWORD=quyhang -p 5544:5432 postgres:16
export DATABASE_URL=postgres://postgres:quyhang@localhost:5544/postgres
npm run db:migrate && npm run db:test
docker rm -f quy-hang-db
```

Báo lại bằng một bảng: bước · kết quả · số test qua / đỏ. Bước bỏ qua thì ghi lý do. Không báo «xong» khi còn bước đỏ.
