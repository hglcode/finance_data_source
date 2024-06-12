
import fs from 'fs'
import path from 'path'

import { xlsx2csv } from './xlsx2csv.js'

export function convert_to_csv(src, dst) {
    dst = dst || 'csv';
    const dest = path.resolve(path.dirname(src), dst);
    if (!fs.existsSync(dest) || fs.lstatSync(dest).isFile()) {
        fs.mkdirSync(dest, { recursive: true });
        console.log(`Directory ${dest} created.`);
    } else {
        console.log(`Directory ${dest} already exists.`);
    }
    let files = fs.readdirSync(path.resolve(src));
    for (const file of files) {
        xlsx2csv(path.resolve(src, file), dest);
    }
}
