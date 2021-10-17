import { copyFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { readENV, makeEnvFormat, matchEnv, _xEnvConfig, executeTypeOptions, dotEnvConfig, envFilePropConsistency } from '../utils';
import variableExpansion from 'dotenv-expand';
import { onerror, isFalsy, log, includes } from 'x-utils-es/umd';
import { XEnvBase } from './base';
class XEnv extends XEnvBase {
    constructor(config, debug) {
        super(config, debug);
        if (this.config.execType === 'ROBUST') {
            this.executeLoader(_xEnvConfig(process.argv));
        }
        if (this.config.execType === 'ROBUST') {
            this.loadConfigFile(this.config.execType);
            if (!this.validateEnvName()) {
                onerror('[XEnv]', `process.env.ENVIRONMENT is not set in your {name}.env file, or part of valid name conventions`);
                process.exit(0);
            }
        }
    }
    executeLoader(cli_args) {
        if (this.execProps)
            return;
        if (isFalsy(cli_args)) {
            onerror('[XEnv]', 'cli args are not set');
            process.exit(0);
        }
        else
            this.execProps = cli_args;
    }
    buildEnv(envName) {
        if (this.config.execType !== 'ROBUST') {
            this.loadConfigFile(this.config.execType);
            if (!this.validateEnvName()) {
                onerror('[XEnv]', `process.env.ENVIRONMENT is not set in your {name}.env file, or part of valid name conventions`);
                process.exit(0);
            }
        }
        if (!this.checkEnvFileConsistency()) {
            if (this.debug)
                onerror('[XEnv]', 'Failed consistency check!');
            return false;
        }
        const envNameConfirmed = this.setNewEnvConfig(envName);
        if (envNameConfirmed) {
            return this.makeENVFile(envNameConfirmed);
        }
        else {
            if (this.debug)
                onerror('[XEnv]', 'Environment name not set');
            return false;
        }
    }
    loadConfigFile(execType) {
        const execProps = this.execProps;
        const execOptions = this.execProps ? executeTypeOptions(execType) : [];
        console.log('execProps', execProps);
        const forSwitch = (type) => {
            let execSet = false;
            switch (type) {
                case 'CLI': {
                    if (!dotEnvConfig(execProps.path, this.debug)) {
                        execSet = false;
                        if (this.debug)
                            onerror('[XEnv]', `no path set for exec type CLI`);
                    }
                    else
                        execSet = true;
                    break;
                }
                case 'ROBUST': {
                    if (!dotEnvConfig(execProps.path, this.debug)) {
                        execSet = false;
                        if (this.debug)
                            onerror('[XEnv]', `no path set for exec type ROBUST`);
                    }
                    else
                        execSet = true;
                    break;
                }
                default:
                    onerror('[XEnv]', `No execute type matched: ${type}`);
            }
            return execSet;
        };
        let settings_loaded = false;
        console.log('execOptions', execOptions);
        for (let inx = 0; inx < execOptions.length; inx++) {
            if (forSwitch(execOptions[inx])) {
                settings_loaded = true;
                break;
            }
        }
        if (!settings_loaded) {
            onerror('[XEnv]', `No Setting loaded to exec type`);
            process.exit(0);
        }
    }
    environments(selected = false) {
        const env = (envFileName) => {
            const filePath = join(this.config.envDir, `./${envFileName}`);
            let data = readENV(filePath, false) || {};
            data = Object.assign(Object.assign({}, data), { type: envFileName });
            if (selected) {
                if (matchEnv(data.ENVIRONMENT) === this.ENVIRONMENT)
                    return data;
                else
                    return undefined;
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
            const mEnv = matchEnv(env.ENVIRONMENT);
            if (mEnv === this.ENVIRONMENT) {
                const fileName = mEnv === 'TEST' ? 'test.env' : mEnv === 'DEVELOPMENT' ? 'dev.env' : mEnv === 'PRODUCTION' ? 'prod.env' : undefined;
                if (fileName) {
                    dotEnvConfig(join(this.config.envDir, `./${fileName}`), this.debug);
                    process.env.NODE_ENV = env.ENVIRONMENT;
                    configSetFor = env.ENVIRONMENT;
                }
            }
        });
        return configSetFor;
    }
    makeENVFile(envName) {
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
            onerror('[XEnv]', `Wrong envName: ${envName}`);
            process.exit(0);
        }
        try {
            copyFileSync(sourcePath, destPath);
            const selectedEnv = this.environments(true)[0];
            let prependMsg = selectedEnv.type ? 'from file: ' + selectedEnv.type : '';
            delete selectedEnv.type;
            delete selectedEnv.NODE_ENV;
            const data = variableExpansion({ parsed: selectedEnv });
            if (data.parsed) {
                const envData = makeEnvFormat(data.parsed, prependMsg);
                if (envData)
                    writeFileSync(baseRootEnv, envData, { encoding: 'utf8' });
                if (this.debug)
                    log('[XEnv]', `{${envName}} environment set`);
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
            this.checkEnvPass = false;
            const envList = this.environments();
            const validFileConditions = envList.filter((n) => {
                let types = ['dev.env', 'prod.env', 'test.env'];
                return n.ENVIRONMENT && includes(n.type, types);
            });
            const mustHaveEnvironment = validFileConditions.length
                ? validFileConditions.length === 3 && this.config.envFileTypes.includes('test.env')
                : validFileConditions.length === 2;
            if (!mustHaveEnvironment) {
                if (this.debug)
                    onerror('[XEnv]', 'one of your {name}.env files is missing or {ENVIRONMENT} prop is not set');
                return false;
            }
            if (!envFilePropConsistency(envList)) {
                if (this.debug)
                    onerror('[XEnv]', 'File props consistency invalid');
                return false;
            }
            if (!this.envFile['test.env'] && this.config.envFileTypes.includes('test.env')) {
                if (this.debug)
                    onerror('[XEnv]', 'test.env file missing, but set as an option');
                return false;
            }
            this.checkEnvPass = true;
            return true;
        }
        catch (err) {
            onerror('[XEnv]', err.toString());
        }
        return false;
    }
}
export { XEnv };
export { readENV, _xEnvConfig };
