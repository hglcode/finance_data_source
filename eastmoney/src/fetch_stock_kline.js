
import axios from 'axios'
import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import parallelLimit from 'async/parallelLimit.js'


const kline_type = {
    day: 101,
    week: 102,
    month: 103,
    minute5: 5,
    minute15: 15,
    minute30: 30,
    minute60: 60,
};


const fields = {
    f1: '股票代码', f2: '市场代码', f3: '股票名字', f4: '保留位数', f5: '数据总数', f6: '上次价格',

    f116: '总市值', f117: '流通值',
    f161: '内盘', f49: '外盘',

    f113: '上涨家数', f114: '下跌家数', f115: '平盘家数',

    f51: '日期',
    f52: '开盘', f53: '收盘',
    f54: '最高', f55: '最低',
    f56: '涨跌幅', f57: '涨跌额',
    f58: '成交量', f59: '成交额',
    f60: '振幅', f61: '换手率',

    f135: '主力流入',
    f136: '主力流出',
    f137: '主力净流入',
    f138: '超大单流入',
    f139: '超大单流出',
    f140: '静超大单',
    f141: '大单流入',
    f142: '大单流出',
    f143: '静大单',
    f144: '中单流入',
    f145: '中单流出',
    f146: '静中单',
    f147: '小单流入',
    f148: '小单流出',
    f149: '静小单',
};

const kline_fields = {
    f51: '日期',
    f52: '开盘', f53: '收盘',
    f54: '最高', f55: '最低',
    f56: '涨跌幅', f57: '涨跌额',
    f58: '成交量', f59: '成交额',
    f60: '振幅', f61: '换手率',
};




async function fetch_kline(code, opts) {
    const url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get';
    const args = {
        secid: code, // stock code
        fields1: 'f5',
        fields2: _.keys(kline_fields).join(','),
        klt: kline_type.day, // kline type
        fqt: 1,
        beg: '19000101', // start date
        end: '20990101', // end date
        lmt: 1e30, // fetch row number limit
    };
    return axios.get(url, { params: _.extendWith(args, opts, (ov, sv) => sv) }).then((rsp) => {
        const lines = rsp.data.data.klines;
        const data = `${_.values(kline_fields).join(',')}\n${lines.join('\n')}`;
        const dst = path.resolve(opts.dir, `${code}_${_.invert(kline_type)[args.klt]}.csv`);
        const dir = path.dirname(dst);
        if (!fs.existsSync(dir) || fs.lstatSync(dir).isFile()) {
            fs.mkdirSync(dir, { recursive: true });
            console.info(`${dir} Created!`)
        }
        fs.writeFileSync(dst, data, { encoding: 'utf8' });
        console.info(`${dst} Created!`);
    });
}

async function fetch_kline_ext(codes, opts) {
    const tasks = codes.map((code, i) =>
        (cb) => fetch_kline(code, opts)
            .then((rsp) => cb(null, i))
            .catch((rsn) => cb(rsn, i))
    );
    parallelLimit(tasks, 16, (err, results) => {
        if (err) {
            console.error(err);
        } else {
            console.info(`${results.length} Done!`);
        }
    });
}


const csv_path = 'data/沪深重要指数.csv';

const ctx = fs.readFileSync(path.resolve(csv_path), { encoding: 'utf8' });
const codes = ctx.split('\n').slice(1);
fetch_kline_ext(codes, { dir: 'data/indicators' })
