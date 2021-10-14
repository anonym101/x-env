import { copyFileSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { parse, config } from 'dotenv';
import { readENV, makeEnvFormat } from './utils';
import variableExpansion from 'dotenv-expand';
import { onerror, isFalsy, log } from 'x-utils-es/umd';
class XEnv {
    constructor(config, debug = false) {
        this.checkEnvPass = false;
        this.debug = debug;
        if (isFalsy(config))
            throw 'Config not provided';
        if (!config.envDir)
            throw 'Must provide {envDir} full path';
        if (!config.baseRootEnv)
            throw 'Must provide {baseRootEnv} full path';
        if (!config.envFileTypes.includes('dev.env') || !config.envFileTypes.includes('prod.env'))
            throw 'Must at least include: dev.env and prod.env';
        this.config = config;
    }
    buildEnv(envName) {
        if (!this.checkEnvFileConsistency()) {
            if (this.debug)
                onerror('[XEnv]', 'Failed consistency check!');
            return false;
        }
        let envNameConfirmed = this.setNewEnvConfig(envName);
        if (envNameConfirmed)
            return this.copyRenameToLocation(envNameConfirmed);
        else
            return false;
    }
    get envFile() {
        return Object.assign(Object.assign(Object.assign({}, (this.config.envFileTypes.includes('test.env') ? { ['test.env']: join(this.config.envDir, `./test.env`) } : {})), (this.config.envFileTypes.includes('dev.env') ? { ['dev.env']: join(this.config.envDir, `./dev.env`) } : {})), (this.config.envFileTypes.includes('prod.env') ? { ['prod.env']: join(this.config.envDir, `./prod.env`) } : {}));
    }
    environments(selected = false) {
        const env = (envFileName) => {
            const filePath = join(this.config.envDir, `./${envFileName}`);
            let data = readENV(filePath, false) || {};
            data = Object.assign(Object.assign({}, data), { type: envFileName });
            if (selected) {
                if (data.ENVIRONMENT === process.env.ENVIRONMENT)
                    return data;
            }
            else
                return data;
        };
        return [this.envFile['test.env'] ? env('test.env') : null, this.envFile['dev.env'] ? env('dev.env') : null, this.envFile['prod.env'] ? env('prod.env') : null].filter(v => !!v);
    }
    setNewEnvConfig(envName) {
        let configSetFor;
        if (!this.checkEnvPass) {
            configSetFor = '';
            if (this.debug)
                onerror('[XEnv]', 'checkEnvPass===false, did you call method: checkEnvFileConsistency() ?');
            return undefined;
        }
        if (!process.env.ENVIRONMENT) {
            if (this.debug)
                onerror('[XEnv]', 'process.env.ENVIRONMENT is not set ?');
            return undefined;
        }
        const ENVIRONMENT = process.env.ENVIRONMENT;
        this.environments(true).filter(env => envName && env ? envName === env.ENVIRONMENT : !!env).forEach(env => {
            if (!env)
                return;
            if (configSetFor)
                return;
            let fileData = env.ENVIRONMENT;
            if (fileData === ENVIRONMENT) {
                const fileName = env.ENVIRONMENT === 'TEST' ? 'test.env' : env.ENVIRONMENT === 'DEVELOPMENT' ? 'dev.env' : env.ENVIRONMENT === 'PRODUCTION' ? 'prod.env' : undefined;
                if (fileName) {
                    config({ path: join(this.config.envDir, `./${fileName}`) });
                    configSetFor = env.ENVIRONMENT;
                }
            }
        });
        return configSetFor;
    }
    copyRenameToLocation(envName) {
        let sourcePath, destPath;
        const baseRootEnv = this.config.baseRootEnv.indexOf('.env') === -1 ? join(this.config.baseRootEnv, '.env') : this.config.baseRootEnv;
        const rootEnvFilePath = baseRootEnv;
        destPath = rootEnvFilePath;
        if (envName === 'TEST' && this.envFile['test.env'])
            sourcePath = this.envFile['test.env'];
        if (envName === 'DEVELOPMENT' && this.envFile['dev.env'])
            sourcePath = this.envFile['dev.env'];
        if (envName === 'PRODUCTION' && this.envFile['prod.env'])
            sourcePath = this.envFile['prod.env'];
        if (!sourcePath) {
            if (this.debug)
                onerror('[XEnv]', `Wrong envName: ${envName}`);
            throw `Wrong envName:${envName}`;
        }
        try {
            copyFileSync(sourcePath, destPath);
            const data = variableExpansion({ parsed: parse(readFileSync(baseRootEnv)) });
            if (data.parsed) {
                const envData = makeEnvFormat(data.parsed);
                if (envData)
                    writeFileSync(baseRootEnv, envData);
                if (envName === 'TEST')
                    log('TEST environment set');
                if (envName === 'DEVELOPMENT')
                    log('DEVELOPMENT environment set');
                if (envName === 'PRODUCTION')
                    log('PRODUCTION environment set');
            }
            else {
                throw data.error;
            }
            return true;
        }
        catch (err) {
            onerror('[XEnv]', err.toString());
        }
        throw `File not found, or wrong envName: ${envName}`;
    }
    checkEnvFileConsistency() {
        try {
            let envList = this.environments();
            this.checkEnvPass = false;
            let testFileKeys = this.envFile['test.env'] ? Object.keys(envList.filter(n => n.type === 'test.env')[0] || {}) : [];
            let devFileKeys = Object.keys(envList.filter(n => n.type === 'dev.env')[0] || {});
            let prodFileKeys = Object.keys(envList.filter(n => n.type === 'prod.env')[0] || {});
            if (!devFileKeys.length) {
                if (this.debug)
                    onerror('[XEnv]', 'dev.env not set or not provided');
                return false;
            }
            if (!prodFileKeys.length) {
                if (this.debug)
                    onerror('[XEnv]', 'prod.env not set or not provided');
                return false;
            }
            if (this.envFile['test.env'] && !testFileKeys.length) {
                if (this.debug)
                    onerror('[XEnv]', 'test.env not set or not provided');
                return false;
            }
            let lenOk = devFileKeys.filter((x) => prodFileKeys.filter((y) => x === y).length).length === devFileKeys.length;
            if (this.envFile['test.env']) {
                if (testFileKeys.length !== devFileKeys.length) {
                    if (this.debug)
                        onerror('[XEnv]', 'test.env is not consistent with the other .env files');
                    lenOk = false;
                }
            }
            const mustHaveENVIRONMENT = devFileKeys.filter(v => v === 'ENVIRONMENT').length === 1;
            if (!mustHaveENVIRONMENT) {
                if (this.debug)
                    onerror('[XEnv]', 'All .env files should include {ENVIRONMENT} property');
                return false;
            }
            if (lenOk)
                this.checkEnvPass = true;
            return lenOk;
        }
        catch (err) {
            onerror('[XEnv]', err.toString());
        }
        return false;
    }
}
export { XEnv };
export { readENV };
