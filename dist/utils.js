import { readSingle } from 'read-env-file';
export const readENV = (envRootFilePath, debug = false) => {
    if (!envRootFilePath) {
        return undefined;
    }
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
        let envData = Object.entries(parsed || {}).reduce((n, [k, val]) => {
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
