"""Bộ đọc .xlsx độc lập cho bài kiểm dữ liệu mẫu: chỉ thư viện chuẩn (zipfile + xml.etree), không dùng mã xlsx.mjs.

Cách dùng: python3 -I doc-xlsx.py <tệp.xlsx>  →  JSON {"sheet": tên, "dong": [[ô, …], …]} ra stdout.
Ô chữ là chuỗi, ô số là số (nguyên khi tròn), ô vắng là null. Zip hỏng hay CRC lệch → thoát khác 0.
"""

import json
import re
import sys
import xml.etree.ElementTree as ET
import zipfile

NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
NS_R = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
NS_PKG = "{http://schemas.openxmlformats.org/package/2006/relationships}"


def chi_so_cot(ref):
    chu = re.match(r"[A-Z]+", ref).group(0)
    n = 0
    for c in chu:
        n = n * 26 + ord(c) - 64
    return n - 1


def doc(duong):
    with zipfile.ZipFile(duong) as z:
        hong = z.testzip()
        if hong is not None:
            raise ValueError(f"CRC lệch ở mục {hong}")
        wb = ET.fromstring(z.read("xl/workbook.xml"))
        sheet = wb.find(f"{NS}sheets/{NS}sheet")
        rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        dich = next(r.get("Target") for r in rels.iter(f"{NS_PKG}Relationship") if r.get("Id") == sheet.get(f"{NS_R}id"))
        chung = []
        if "xl/sharedStrings.xml" in z.namelist():
            sst = ET.fromstring(z.read("xl/sharedStrings.xml"))
            chung = ["".join(t.text or "" for t in si.iter(f"{NS}t")) for si in sst.iter(f"{NS}si")]
        ws = ET.fromstring(z.read("xl/" + dich.lstrip("/").removeprefix("xl/")))
    dong = []
    for row in ws.iter(f"{NS}row"):
        o = {}
        for c in row.iter(f"{NS}c"):
            kieu = c.get("t")
            if kieu == "inlineStr":
                gt = "".join(t.text or "" for t in c.iter(f"{NS}t"))
            elif kieu == "s":
                gt = chung[int(c.find(f"{NS}v").text)]
            elif kieu == "str":
                gt = c.find(f"{NS}v").text or ""
            else:
                v = c.find(f"{NS}v")
                if v is None:
                    continue
                so = float(v.text)
                gt = int(so) if so.is_integer() else so
            o[chi_so_cot(c.get("r"))] = gt
        dong.append([o.get(i) for i in range(max(o) + 1)] if o else [])
    return {"sheet": sheet.get("name"), "dong": dong}


if __name__ == "__main__":
    print(json.dumps(doc(sys.argv[1]), ensure_ascii=False))
