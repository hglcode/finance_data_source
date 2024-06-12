import os
import chardet
import pandas as pd

columns = {
    "合约": "code",
    "日期": "date",
    "前收盘价": "pre_close",
    "前结算价": "pre_balance",
    "开盘价": "open",
    "最高价": "high",
    "最低价": "low",
    "收盘价": "close",
    "结算价": "balance",
    "涨跌1": "up_dwn_1",
    "涨跌2": "up_dwn_2",
    "成交量": "volume",
    "成交额": "turnover",
    "持仓量": "position",
}


def file_encoding(file):
    with open(file, "rb") as f:
        tmp = chardet.detect(f.read())
        return tmp["encoding"]


def merge_csv_by_code(dir, code):
    dir = os.path.abspath(dir)

    files = os.listdir(dir)
    files = filter(lambda x: x.startswith(f"{code}_"), files)
    files = map(lambda x: os.path.abspath(f"{dir}/{x}"), files)
    files = list(files)
    dfs = [0] * len(files)
    for i, file in enumerate(files):
        encode = file_encoding(file)
        print(file, encode)
        df = pd.read_csv(file, encoding=encode if encode != "ISO-8859-9" else "gbk")
        dfs[i] = df.rename(columns={"成交金额": "成交额"})[columns.keys()]

    df = pd.concat(dfs)
    dst = os.path.join(dir, f"{code}.csv")
    df.to_csv(dst, index=False, encoding="utf8")


merge_csv_by_code("data/csv", "cs")
