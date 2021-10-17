
/**
 * Cli executable construct for ./DEV, ./PROD, and ./TEST
 * Load env files by detecting XENV/ dir at PROJECT root, or load by xenv_dir=path/to/xenv`
 */

// TODO add debug so we can get printout

import { default_xenv_dir_name, regExp } from '../data'
import { onerror, log } from 'x-utils-es/umd'
import { processArgs, projectRoot } from '../utils'
import { XEnv, readENV } from '../XEnv'
import { join } from 'path'
import { readdirSync } from 'fs'
import { CLI_SCRIPT_ARGS, XCONFIG, XENV_CLI_ARGS } from '@interface'

type execForEnvironment = 'DEV' | 'PROD' | 'TEST'

export const CLI_PRE_PROCESS=(): CLI_SCRIPT_ARGS=> {
    const CLI: CLI_SCRIPT_ARGS = {
        DEBUG: false,
        XENV_DIR: '',
        _XENV_DIR: '',
    }

    const parseJson = (debug)=>{
        try{
            return JSON.parse(debug ||'' ) || false
        }catch(err){
            // debug
        }
        return false
    }

    const root = process.cwd()
    // process any args provided
    const argv: XENV_CLI_ARGS = processArgs(process.argv, regExp)

    CLI.DEBUG =  parseJson(argv.debug)
    CLI.XENV_DIR = projectRoot(argv.dir)

    // NOTE Check if user supplied xenv_dir=, or check if {default_xenv_dir_name} already exists in project root
    if (CLI.XENV_DIR) {
        CLI._XENV_DIR = join(root, CLI.XENV_DIR)

        //NOTE if dir exists but we provided a path use that instead
        try {
            readdirSync(CLI._XENV_DIR)
            // update to full path
            CLI.XENV_DIR = CLI._XENV_DIR
        } catch (err) {
            CLI.XENV_DIR = ''
        }
    }
    // otherwise check if dir exists instead when path to dir not provided
    else {
        CLI._XENV_DIR = join(root, `./${default_xenv_dir_name}`)
        try {
            readdirSync(CLI._XENV_DIR)
            CLI.XENV_DIR = CLI._XENV_DIR
        } catch (err) {
            CLI.XENV_DIR = ''
            // doesn't exist
            onerror(`[XEnv]`, `No ${default_xenv_dir_name} dir at root/ of your project`)
            process.exit(0)
        }
    }

    return CLI
}

/**
 * execute XEnv script for CLI execution type
 * @param {*} ARGS
 */
export const CLI_SCRIPT=(ARGS: CLI_SCRIPT_ARGS, execForEnvironment: execForEnvironment):void =>{
    const options: XCONFIG = {
        execType: 'CLI', // NOTE  << special setting for cli and using executeLoader option
        envDir: ARGS.XENV_DIR, // path.join(__dirname, './'),
        envFileTypes: ['dev.env', 'prod.env', 'test.env'],
    }

    const xEnv = new XEnv(options, true)
    // -- set dev as current ENVIRONMENT
    if (execForEnvironment === 'DEV') xEnv.executeLoader({ path: join(ARGS.XENV_DIR, './dev.env') })
    if (execForEnvironment === 'PROD') xEnv.executeLoader({ path: join(ARGS.XENV_DIR, './prod.env') })
    if (execForEnvironment === 'TEST') xEnv.executeLoader({ path: join(ARGS.XENV_DIR, './test.env') })

    // check build is ok
    if (!(xEnv.buildEnv(/** DEV */))) throw 'environment build failed'

    //------------------------------------------------------
    // ------------------------- app script, etc...
    // we are good to go
    if (ARGS.DEBUG) {
        log(readENV(/*options.baseRootEnv*/))
        log('true === ', process.env.ENVIRONMENT === readENV().ENVIRONMENT && readENV().ENVIRONMENT === process.env.NODE_ENV)
    }
}
