import os
import glob
import chardet
import pandas as pd
from loguru import logger

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


def file_encoding(file: str) -> str:
    with open(file, "rb") as f:
        return chardet.detect(f.read()).get("encoding") or "utf-8"


def merge_csv_by_code(directory: str, code: str) -> None:
    directory = os.path.abspath(directory)
    if not os.path.isdir(directory):
        logger.error(f"Directory not found: {directory}")
        return
    files = glob.glob(os.path.join(directory, f"{code}_*.csv"), recursive=False)
    if len(files) == 0:
        logger.error(f"No files found for code: {code}")
        return
    dfs = []
    for file in files:
        encode = file_encoding(file)
        logger.info(file, encode)
        df = pd.read_csv(file, encoding=encode if encode != "ISO-8859-9" else "gbk", dtype=str)
        dfs.append(df.rename(columns={"成交金额": "成交额"})[columns.keys()])

    df = pd.concat(dfs)
    dst = os.path.join(directory, f"{code}.csv")
    df.to_csv(dst, index=False, encoding="utf8")


merge_csv_by_code("data/csv", "cs")
