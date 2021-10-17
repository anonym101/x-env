'use strict';
import { default_xenv_dir_name, regExp } from '../data';
import { onerror, log } from 'x-utils-es/umd';
import { processArgs, projectRoot } from '../utils';
import { XEnv, readENV } from '../XEnv';
import { join } from 'path';
import { readdirSync } from 'fs';
export const CLI_PRE_PROCESS = () => {
    const CLI = {
        DEBUG: false,
        XENV_DIR: '',
        _XENV_DIR: '',
    };
    const root = process.cwd();
    const argv = processArgs(process.argv, regExp);
    CLI.DEBUG = JSON.parse(argv.debug || '') || false;
    CLI.XENV_DIR = projectRoot(argv.dir);
    if (CLI.XENV_DIR) {
        CLI._XENV_DIR = join(root, CLI.XENV_DIR);
        try {
            readdirSync(CLI._XENV_DIR);
            CLI.XENV_DIR = CLI._XENV_DIR;
        }
        catch (err) {
            CLI.XENV_DIR = '';
        }
    }
    else {
        CLI._XENV_DIR = join(root, `./${default_xenv_dir_name}`);
        try {
            readdirSync(CLI._XENV_DIR);
            CLI.XENV_DIR = CLI._XENV_DIR;
        }
        catch (err) {
            CLI.XENV_DIR = '';
            onerror(`[XEnv]`, `No ${default_xenv_dir_name} dir at root/ of your project`);
            process.exit(0);
        }
    }
    return CLI;
};
export const CLI_SCRIPT = (ARGS, execForEnvironment) => {
    const options = {
        execType: 'CLI',
        envDir: ARGS.XENV_DIR,
        envFileTypes: ['dev.env', 'prod.env', 'test.env'],
    };
    const xEnv = new XEnv(options, true);
    if (execForEnvironment === 'DEV')
        xEnv.executeLoader({ path: join(ARGS.XENV_DIR, './dev.env') });
    if (execForEnvironment === 'PROD')
        xEnv.executeLoader({ path: join(ARGS.XENV_DIR, './prod.env') });
    if (execForEnvironment === 'TEST')
        xEnv.executeLoader({ path: join(ARGS.XENV_DIR, './test.env') });
    if (!(xEnv.buildEnv()))
        throw 'environment build failed';
    if (ARGS.DEBUG) {
        log(readENV());
        log('true === ', process.env.ENVIRONMENT === readENV().ENVIRONMENT && readENV().ENVIRONMENT === process.env.NODE_ENV);
    }
};
