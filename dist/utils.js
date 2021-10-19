import { config as _dotEnvConfig } from 'dotenv';
import variableExpansion from 'dotenv-expand';
export const parsedEnvConfig = (auto = true, pth) => {
    if (!auto && !pth)
        throw 'When auto not set must provide path';
    const NODE_ENV = process.env.NODE_ENV;
    let envPath = pth;
    if (auto) {
        if (!NODE_ENV)
            throw 'NODE_ENV NOT SET';
        if (NODE_ENV === 'DEVELOPMENT')
            envPath = `./dev.env`;
        if (NODE_ENV === 'PRODUCTION')
            envPath = `./prod.env`;
        if (NODE_ENV === 'TEST')
            envPath = `./test.env`;
    }
    try {
        const parsed = _dotEnvConfig({ path: envPath });
        const d = variableExpansion(parsed);
        if (d.error)
            throw d.error;
        else
            return d.parsed;
    }
    catch (err) {
        console.log('[parsedEnvConfig]', err.toString());
    }
    return undefined;
};
