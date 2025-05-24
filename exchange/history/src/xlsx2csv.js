import fs from 'fs'
import path from 'path'

import xlsx from 'xlsx'


export function xlsx2csv(src, dst, options) {
    src = path.resolve(src);
    const dirname = path.dirname(src);
    const filename = path.parse(src).name;
    dst = dst || dirname;
    dst = path.resolve(dst, `${filename}.csv`);
    const ret = fs.readFileSync(src, 'hex');
    console.error(`${ret.slice(0, 26)}   ${path.basename(src)}`);
    // src.endsWith('.csv')
    if (ret.slice(0, 26) !== '504b0304140006000800000021') {
        return new Promise((resolve, reject) => {
            fs.copyFile(src, dst, (error) => {
                if (error) {
                    console.error(error);
                    reject(error);
                } else {
                    console.info(`${src} ==> ${dst}`);
                    resolve('done');
                }
            })
        });
    }

    const ctx = xlsx.readFile(src);

    const sheet = ctx.Sheets[ctx.SheetNames[0]];
    const csv = xlsx.utils.sheet_to_csv(sheet);

    return new Promise((resolve, reject) => {
        fs.writeFile(dst, csv, 'utf8', (error) => {
            if (error) {
                reject(error);
            } else {
                console.info(`${src} ==> ${dst}`)
                resolve('done');
            }
        });
    });
}
