
import axios from 'axios'
import _ from 'lodash'
import path from 'path'
import fs from 'fs'


const market_fields = {
    '深圳A股': 'm:0 t:6,m:0 t:80',
    '上证A股': 'm:1 t:2,m:1 t:23',
    '北证A股': 'm:0 t:81 s:2048',
    '沪深京A股': 'm:0 t:6,m:0 t:80,m:1 t:2,m:1 t:23,m:0 t:81 s:2048',
    '沪深重要指数': 'b:MK0010',
    '上证系列指数': 'm:1 t:1',
    '深圳系列指数': 'm:0 t:5',

};

function fetch_stock_code(opts) {
    const url = 'https://9.push2.eastmoney.com/api/qt/clist/get';
    const args = {
        pn: 1,
        pz: 20,
        po: 1,
        np: 1,
        fltt: 2,
        invt: 2,
        dect: 1,
        fid: 'f3',
        fs: market_fields['深圳A股'],
        fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152',
    };
    axios.get(url, { params: _.extendWith(args, opts, (ov, sv) => sv) }).then((rsp) => {
        const lines = rsp.data.data.diff.map(itm => `${itm.f13}.${itm.f12}`);
        //const data = `${['code', 'market'].join(',')}\n${lines.join('\n')}`;
        const data = `code\n${lines.join('\n')}`;
        const dst = path.resolve(opts.dir, opts.out || `${_.invert(market_fields)[args.fs]}.csv`);
        const dir = path.dirname(dst);
        console.info(`total: ${rsp.data.data.total}, count: ${lines.length}`)
        if (!fs.existsSync(dir) || fs.lstatSync(dir).isFile()) {
            fs.mkdirSync(dir, { recursive: true });
            console.info(`${dir} Created!`)
        }
        fs.writeFileSync(dst, data, { encoding: 'utf8' });
        console.info(`${dst} Created!`);
    });

}

//沪深京A股
for (const v of _.values(market_fields)) {
    fetch_stock_code({
        dir: './data',
        fs: v,
        fields: 'f12,f13',
        pn: 1,
        pz: 1e8,
    });
}
