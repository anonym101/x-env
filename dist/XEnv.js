import { copyFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { config as dotEnvConfig } from 'dotenv';
import { readENV, makeEnvFormat, pathToBaseRootEnv, matchEnv, xenvConfig } from './utils';
import variableExpansion from 'dotenv-expand';
import { onerror, isFalsy, log } from 'x-utils-es/umd';
class XEnv {
    constructor(config, debug = false) {
        this.checkEnvPass = false;
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
        this.loadConfigFile();
        if (!this.validateEnvName())
            throw 'process.env.ENVIRONMENT is not set in your {name}.env file';
    }
    validateEnvName() {
        if (!this.ENVIRONMENT) {
            if (this.debug)
                onerror('[XEnv]', 'process.env.ENVIRONMENT not set in your {name}.env');
            return false;
        }
        else
            return true;
    }
    loadConfigFile() {
        try {
            const options = xenvConfig(process.argv);
            if (options.path)
                dotEnvConfig({ path: options.path });
            else
                throw 'xenv_config_path to your {name}.env was not set at preflight';
        }
        catch (err) {
            if (this.debug)
                onerror('[XEnv][xenvConfig]', err.toString());
            throw `Issue loading with dotenv/config`;
        }
    }
    buildEnv(envName) {
        if (!this.checkEnvFileConsistency()) {
            if (this.debug)
                onerror('[XEnv]', 'Failed consistency check!');
            return false;
        }
        const envNameConfirmed = this.setNewEnvConfig(envName);
        if (envNameConfirmed) {
            return this.copyRenameToLocation(envNameConfirmed);
        }
        else {
            if (this.debug)
                onerror('[XEnv]', 'Environment name not set');
            return false;
        }
    }
    get envFile() {
        return Object.assign(Object.assign(Object.assign({}, (this.config.envFileTypes.includes('test.env') ? { ['test.env']: join(this.config.envDir, `./test.env`) } : {})), (this.config.envFileTypes.includes('dev.env') ? { ['dev.env']: join(this.config.envDir, `./dev.env`) } : {})), (this.config.envFileTypes.includes('prod.env') ? { ['prod.env']: join(this.config.envDir, `./prod.env`) } : {}));
    }
    get ENVIRONMENT() {
        return matchEnv((process.env.ENVIRONMENT || process.env.NODE_ENV));
    }
    environments(selected = false) {
        const env = (envFileName) => {
            const filePath = join(this.config.envDir, `./${envFileName}`);
            let data = readENV(filePath, false) || {};
            data = Object.assign(Object.assign({}, data), { type: envFileName });
            if (selected) {
                if (matchEnv(data.ENVIRONMENT) === this.ENVIRONMENT)
                    return data;
            }
            else
                return data;
        };
        return [this.envFile['test.env'] ? env('test.env') : null, this.envFile['dev.env'] ? env('dev.env') : null, this.envFile['prod.env'] ? env('prod.env') : null].filter((v) => !!v);
    }
    setNewEnvConfig(envName) {
        envName = matchEnv(envName);
        let configSetFor;
        if (!this.checkEnvPass) {
            configSetFor = '';
            if (this.debug)
                onerror('[XEnv]', 'checkEnvPass===false, did you call method: checkEnvFileConsistency() ?');
            return undefined;
        }
        if (!this.ENVIRONMENT) {
            if (this.debug)
                onerror('[XEnv]', 'ENVIRONMENT is not set ?');
            return undefined;
        }
        this.environments(true)
            .filter((env) => (envName && env ? envName === env.ENVIRONMENT : !!env))
            .forEach((env) => {
            if (!env)
                return;
            if (configSetFor)
                return;
            const matcheEnv = matchEnv(env.ENVIRONMENT);
            if (matcheEnv === this.ENVIRONMENT) {
                const fileName = matcheEnv === 'TEST' ? 'test.env' : matcheEnv === 'DEVELOPMENT' ? 'dev.env' : matcheEnv === 'PRODUCTION' ? 'prod.env' : undefined;
                if (fileName) {
                    dotEnvConfig({ path: join(this.config.envDir, `./${fileName}`) });
                    process.env.NODE_ENV = env.ENVIRONMENT;
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
        envName = matchEnv(envName);
        if (envName === 'TEST' && this.envFile['test.env'])
            sourcePath = this.envFile['test.env'];
        if (envName === 'DEVELOPMENT' && this.envFile['dev.env'])
            sourcePath = this.envFile['dev.env'];
        if (envName === 'PRODUCTION' && this.envFile['prod.env'])
            sourcePath = this.envFile['prod.env'];
        if (!sourcePath) {
            if (this.debug)
                onerror('[XEnv]', `Wrong envName: ${envName}`);
            throw new Error(`Wrong envName:${envName}`);
        }
        try {
            copyFileSync(sourcePath, destPath);
            const selectedEnv = this.environments(true)[0];
            delete selectedEnv.type;
            delete selectedEnv.NODE_ENV;
            const data = variableExpansion({ parsed: selectedEnv });
            if (data.parsed) {
                const envData = makeEnvFormat(data.parsed);
                if (envData)
                    writeFileSync(baseRootEnv, envData);
                log(`{${envName}} environment set`);
            }
            else {
                throw data.error;
            }
            return true;
        }
        catch (err) {
            onerror('[XEnv]', err.toString());
        }
        throw new Error(`File not found, or wrong envName: ${envName}`);
    }
    checkEnvFileConsistency() {
        try {
            const envList = this.environments();
            const envsset = envList.filter((n) => n.ENVIRONMENT !== undefined).length === 3;
            if (!envsset) {
                if (this.debug)
                    onerror('[XEnv]', 'One of your {name}.env is missing {ENVIRONMENT} property');
                return false;
            }
            this.checkEnvPass = false;
            const testFileKeys = this.envFile['test.env'] ? Object.keys(envList.filter((n) => n.type === 'test.env')[0] || {}) : [];
            const devFileKeys = Object.keys(envList.filter((n) => n.type === 'dev.env')[0] || {});
            const prodFileKeys = Object.keys(envList.filter((n) => n.type === 'prod.env')[0] || {});
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
            const mustHaveENVIRONMENT = devFileKeys.filter((v) => v === 'ENVIRONMENT').length === 1;
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
