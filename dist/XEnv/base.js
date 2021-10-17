import { matchEnv, pathToBaseRootEnv } from './../utils';
import { includes, isFalsy, onerror } from 'x-utils-es/umd';
import { join } from 'path';
export class XEnvBase {
    constructor(config, debug = false) {
        this.execProps = undefined;
        this.checkEnvPass = false;
        this._defaultExecType = 'ROBUST';
        this.debug = debug;
        if (isFalsy(config)) {
            onerror('[XEnv]', 'Config not provided');
            process.exit(0);
        }
        if (!config.envDir) {
            onerror('[XEnv]', 'Must provide {envDir} full path');
            process.exit(0);
        }
        if (!config.baseRootEnv)
            config.baseRootEnv = pathToBaseRootEnv();
        if (!config.envFileTypes.includes('dev.env') || !config.envFileTypes.includes('prod.env')) {
            onerror('[XEnv]', 'Must at least include: dev.env and prod.env');
            process.exit(0);
        }
        this.config = config;
        if (!this.config.execType)
            this.config.execType = this._defaultExecType;
        const types = ['CLI', 'ROBUST', 'DEFAULT'];
        if (!includes(this.config.execType, types)) {
            onerror('[XEnv]', `Invalid execType: ${this.config.execType}`);
            process.exit(0);
        }
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
