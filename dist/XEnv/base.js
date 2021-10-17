import { matchEnv, pathToBaseRootEnv } from './../utils';
import { includes, isFalsy } from 'x-utils-es/umd';
import { join } from 'path';
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
    get ENVIRONMENT() {
        return matchEnv((process.env.ENVIRONMENT || process.env.NODE_ENV));
    }
    get envFile() {
        return Object.assign(Object.assign(Object.assign({}, (this.config.envFileTypes.includes('test.env') ? { ['test.env']: join(this.config.envDir, `./test.env`) } : {})), (this.config.envFileTypes.includes('dev.env') ? { ['dev.env']: join(this.config.envDir, `./dev.env`) } : {})), (this.config.envFileTypes.includes('prod.env') ? { ['prod.env']: join(this.config.envDir, `./prod.env`) } : {}));
    }
    validateEnvName() {
        if (!this.ENVIRONMENT) {
            return false;
        }
        else
            return true;
    }
}
