import { readSingle } from 'read-env-file';
import path from 'path';
import { ENV_NAME_CONVENTIONS } from './data';
export function xenvConfig(argv) {
    const regx = /^xenv_config_(path)=(.+)$/;
    const argEnvs = (_args) => {
        return _args.reduce((n, val) => {
            const mch = val.match(regx);
            if (mch)
                n[mch[1]] = mch[2];
            return n;
        }, {});
    };
    const args = argEnvs(argv);
    if (args.path) {
        const pth = path.isAbsolute(args.path) ? args.path : path.resolve(process.cwd(), args.path);
        args.path = pth;
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
export const pathToBaseRootEnv = (pth = '') => {
    pth = pth || path.resolve(process.cwd(), '.env');
    return path.isAbsolute(pth) ? pth : path.resolve(process.cwd(), pth);
};
export const readENV = (envRootFilePath, debug = false) => {
    envRootFilePath = pathToBaseRootEnv(envRootFilePath);
    try {
        return readSingle.sync(envRootFilePath);
    }
    catch (err) {
        if (debug)
            console.error(err.toString());
    }
    return undefined;
};
export const makeEnvFormat = (parsed) => {
    if (!parsed)
        return undefined;
    if (parsed) {
        const envData = Object.entries(parsed || {}).reduce((n, [k, val]) => {
            if (parsed[k] !== undefined) {
                n = n ? n + `${k}=${val.toString()}\n` : `${k}=${val.toString()}\n`;
            }
            return n;
        }, '');
        if (!envData)
            return undefined;
        else
            return envData;
    }
};
