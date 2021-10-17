import { readSingle } from 'read-env-file';
import path from 'path';
import { ENV_NAME_CONVENTIONS, regExp_path } from './data';
import { config as _dotEnvConfig } from 'dotenv';
import { onerror } from 'x-utils-es/umd';
export const dotEnvConfig = (pth, _debug = false) => {
    if (!pth)
        return undefined;
    try {
        return _dotEnvConfig({ path: pth });
    }
    catch (err) {
        if (_debug)
            onerror('[XEnv][dotEnvConfig]', err.toString());
    }
    return undefined;
};
export const envFilePropConsistency = (list) => {
    const propCheck = (envKeys, all) => {
        let pass = 0;
        for (let inx = 0; inx < all.length; inx++) {
            let each = all[inx];
            if (envKeys.filter(x => each.filter(y => x === y).length).length === envKeys.length) {
                pass++;
            }
        }
        return all.length === pass;
    };
    return list.filter((env, inx, all) => {
        return propCheck(Object.keys(env), all.map(x => Object.keys(x)));
    }).length === list.length;
};
export const processArgs = (_args, regExp) => {
    return _args.reduce((n, val) => {
        const mch = val.match(regExp);
        if (mch)
            n[mch[1]] = mch[2];
        return n;
    }, {});
};
export function _xEnvConfig(argv, regExp = regExp_path) {
    const args = processArgs(argv, regExp);
    if (args.path) {
        const pth = path.isAbsolute(args.path) ? args.path : path.resolve(process.cwd(), args.path);
        args.path = pth;
    }
    if (args.dir) {
        const dir = path.isAbsolute(args.dir) ? args.dir : path.resolve(process.cwd(), args.dir);
        args.dir = dir;
    }
    return Object.assign({}, args, {});
}
export const matchEnv = (NODE_ENV) => {
    if (!NODE_ENV)
        return undefined;
    return Object.entries(ENV_NAME_CONVENTIONS).reduce((n, [k, val]) => {
        if (!n) {
            let _val = val;
            if (_val.filter((x) => x === NODE_ENV).length)
                n = k;
        }
        return n;
    }, '');
};
export const executeTypeOptions = (execType) => {
    return [execType === 'CLI' ? 'CLI' : null, execType === 'ROBUST' ? 'ROBUST' : null].filter(n => !!n);
};
export const pathToBaseRootEnv = (pth = '') => {
    pth = pth || path.resolve(process.cwd(), '.env');
    return path.isAbsolute(pth) ? pth : path.resolve(process.cwd(), pth);
};
export function readENV(envRootFilePath, debug = false) {
    envRootFilePath = pathToBaseRootEnv(envRootFilePath);
    try {
        return readSingle.sync(envRootFilePath);
    }
    catch (err) {
        if (debug)
            console.error(err.toString());
    }
    return undefined;
}
export function makeEnvFormat(parsed, msg) {
    if (!parsed)
        return undefined;
    if (parsed) {
        const prepend = msg;
        const envData = Object.entries(parsed || {}).reduce((n, [k, val]) => {
            if (parsed[k] !== undefined) {
                n = (n ? n + `${k}=${val.toString()}\n` : `${k}=${val.toString()}\n`);
            }
            return n;
        }, '');
        if (!envData)
            return undefined;
        else
            return envData ? prepend ? `# ${prepend}\n` + envData : envData : envData;
    }
}
