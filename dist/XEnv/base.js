import { pathToBaseRootEnv } from './../utils';
import { includes, isFalsy } from 'x-utils-es/umd';
export class XEnvBase {
    constructor(config, debug = false) {
        this.execProps = undefined;
        this.checkEnvPass = false;
        this._defaultExecType = 'ROBUST';
        this.debug = debug;
        if (isFalsy(config))
            throw new Error('Config not provided');
        if (!config.envDir)
            throw new Error('Must provide {envDir} full path');
        if (!config.baseRootEnv)
            config.baseRootEnv = pathToBaseRootEnv();
        if (!config.envFileTypes.includes('dev.env') || !config.envFileTypes.includes('prod.env'))
            throw new Error('Must at least include: dev.env and prod.env');
        this.config = config;
        if (!this.config.execType)
            this.config.execType = this._defaultExecType;
        const types = ['CLI', 'ROBUST', 'DEFAULT'];
        if (!includes(this.config.execType, types))
            throw `Invalid execType: ${this.config.execType}`;
    }
}
