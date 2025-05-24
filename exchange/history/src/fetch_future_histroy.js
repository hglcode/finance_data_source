import path from 'path'
import { chromium } from '@playwright/test'
import { future_name_code_map } from './future_codes.js'
import { unzip_origin } from './unzip.js'
import { convert_to_csv } from './process_origin_data.js'


function get_future_code_prefix_by_name(name) {
    return future_name_code_map[name];
}

async function fetch_dalian_future_history(future_name, dst) {
    console.log(`start: ${future_name}`);
    const browser = await chromium.launch({
        headless: true,
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('http://www.dce.com.cn/dalianshangpin/xqsj/lssj/index.html');
    const select = await page.getByRole('combobox');
    const texts = await select.allTextContents();
    const options = texts[0].split('年').filter(w => w.length > 0);
    //const options = ['2021']
    const dest = path.resolve(dst);
    for (const opt of options) {
        console.debug(`\t${opt}`);
        await page.getByRole('combobox').selectOption(opt);
        const radio = await page.getByRole('radio', { name: future_name, exact: true });
        if ((await radio.allTextContents()).length <= 0) {
            continue
        }
        await page.getByRole('radio', { name: future_name, exact: true }).check();
        const downloadPromise = page.waitForEvent('download');
        await page.getByRole('link', { name: '下载' }).click();
        const download = await downloadPromise;
        const code = get_future_code_prefix_by_name(future_name);
        dst = path.resolve(dest, `${code}_${opt}${path.extname(download.suggestedFilename())}`);
        await download.saveAs(dst);
    }
    // ---------------------
    await context.close();
    await browser.close();
    console.log(`end: ${future_name}}`);
}

export async function fetch_all_dalian_future_history(dst) {
    for (const name in future_name_code_map) {
        await fetch_dalian_future_history(name, dst);
    }
}


async function main() {
    const origin_dir = path.resolve('data/origin');
    await fetch_all_dalian_future_history(origin_dir);
    convert_to_csv(unzip_origin(origin_dir));
}

main()
