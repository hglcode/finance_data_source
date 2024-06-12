import fs from 'fs'
import path from 'path'
import AdmZip from 'adm-zip'

function get_files_with_ext(dir, ext = 'zip') {
    const dirs = fs.readdirSync(dir);
    const zips = dirs.filter(f => f.endsWith(ext) && fs.lstatSync(path.join(dir, f)).isFile());
    for (let i = 0; i < zips.length; i++) {
        const zip = zips[i];
        zips[i] = path.resolve(dir, zip);
    }
    return zips;
}

function get_all_directory(dir) {
    let dirs = fs.readdirSync(dir);
    dirs = dirs.filter(n => fs.lstatSync(path.join(dir, n)).isDirectory());
    return dirs.map(d => path.resolve(dir, d));
}

function extract_all(dir) {
    const zips = get_files_with_ext(dir);
    for (const zip of zips) {
        const zipper = AdmZip(zip);
        zipper.extractAllTo(`${path.dirname(zip)}/${path.parse(zip).name}`, true);
    }
}

function move_to_origin(dir, target) {
    const dirs = get_all_directory(dir);
    for (const d of dirs) {
        const files = fs.readdirSync(d);
        target = target || path.dirname(d);
        for (const file of files) {
            const old_path = path.join(d, file);
            const new_path = path.join(target, `${path.basename(d)}${path.parse(file).ext}`);
            fs.renameSync(old_path, new_path);
            fs.rmdirSync(d);
        }
    }
}

export function copy_to_extract(src, dst) {
    let files = fs.readdirSync(src);
    files = files.map(f => path.resolve(src, f));
    files = files.filter(f => !f.endsWith('.zip') && fs.lstatSync(f).isFile());

    dst = dst || path.dirname(src);
    const dest = path.resolve(dst, 'extract');
    if (!fs.existsSync(dest) || fs.lstatSync(dest).isFile()) {
        fs.mkdirSync(dest, { recursive: true });
        console.log(`Directory ${dest} created.`);
    } else {
        console.log(`Directory ${dest} already exists.`);
    }
    files.forEach(file => {
        dst = path.join(dest, path.basename(file));
        fs.copyFileSync(file, dst);
        console.log(`${file} ==> ${dst}`);
    });
    console.info(`Extract to directory: ${dest}!`);
    return dest;
}

export function unzip_origin(origin_dir) {
    extract_all(origin_dir);
    move_to_origin(origin_dir);
    return copy_to_extract(origin_dir);
}
