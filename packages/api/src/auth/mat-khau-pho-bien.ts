// Mật khẩu phổ biến, đóng gói trong kho — không gọi dịch vụ ngoài (thiết kế §2 luật 1, §4). Chỉ giữ chuỗi từ 8 ký tự
// trở lên (ngắn hơn đã bị luật độ dài chặn), chữ thường, bỏ dấu và dấu cách — so sau khi chuẩn hoá cùng cách.
export const MAT_KHAU_PHO_BIEN: ReadonlySet<string> = new Set([
  "password", "password1", "password12", "password123", "password1234", "passw0rd", "p@ssw0rd", "p@ssword",
  "iloveyou", "iloveyou1", "iloveyou2", "princess", "princess1", "sunshine", "football", "football1", "baseball",
  "superman", "starwars", "whatever", "trustno1", "welcome1", "welcome123", "letmein1", "letmein123", "computer",
  "michelle", "jennifer", "corvette", "mercedes", "maverick", "1q2w3e4r", "1q2w3e4r5t", "1qaz2wsx", "1qaz2wsx3edc",
  "zaq12wsx", "qazwsxedc", "q1w2e3r4", "q1w2e3r4t5", "a1b2c3d4", "abc12345", "abcd1234", "abcde12345", "aa123456",
  "qwerty12", "qwerty123", "qwerty1234", "qwertyui", "qwertyuiop", "asdfghjk", "asdfghjkl", "zxcvbnm1", "zxcvbnmm",
  "12345678", "123456789", "11111111", "00000000", "88888888", "66666666", "99999999", "12341234", "11223344", "12121212", "12344321",
  "123123123", "123321123", "147258369", "159753456", "1234567890", "0987654321", "987654321", "123456789a",
  "a123456789", "12345678a", "dragon12", "monkey12", "shadow12", "master12", "jordan23", "hello123", "hello1234",
  "admin123", "admin1234", "administrator", "changeme", "changeme1", "default1", "secret12", "loveyou1", "fuckyou1",
  "pokemon1", "minecraft", "samsung1", "freedom1", "liverpool", "chelsea1", "arsenal1", "barcelona", "manchester",
  "chocolate", "butterfly", "basketball", "matkhau1", "matkhau123", "matkhau1234", "matkhaumoi", "anhyeuem", "anhyeuem1",
  "emyeuanh", "emyeuanh1", "yeuemmai", "yeuanhnhieu", "vietnam1", "vietnam123", "vietnam2026", "hanoi123", "saigon123",
  "hochiminh", "tienganh", "khongbiet", "khongcomatkhau", "conmeo123", "matkhaucuatoi", "batdongsan", "batdongsan1",
  "nhadat123", "moigioi123", "123456aa", "123456ab", "123456qq", "qq123456", "abc123456", "abc123abc", "zxcv1234",
  "asdf1234", "qwer1234", "1234qwer", "1234asdf", "1234abcd", "passpass", "testtest", "test1234", "guest123",
  "summer2026", "winter2026", "spring2026", "autumn2026", "welcome2026", "password2026", "admin2026",
]);
