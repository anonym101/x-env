

import { readSingle } from 'read-env-file';
import { ENV, ENVIRONMENT, XENV_CLI_ARGS } from '@interface';
import path from 'path'
import { ENV_NAME_CONVENTIONS } from './data';


/** 
 * Implementation to parse process.args and process.argv options so we can use Xenv options
 * We are to expect {path} 
*/
export function xenvConfig(argv: string[]): XENV_CLI_ARGS {
    const regx = /^xenv_config_(path)=(.+)$/
    const argEnvs = (_args:Array<any>): XENV_CLI_ARGS => {
        return _args.reduce((n, val)=> {
            const mch = val.match(regx)
            if (mch) n[mch[1]] = mch[2]
            return n
        }, {})
    }
    const args = argEnvs(argv)
    if(args.path){
        // assing full path so we can resolve it
        const pth = path.isAbsolute(args.path) ?  args.path : path.resolve(process.cwd(), args.path)
        args.path = pth
    }
    return Object.assign({}, args, {}) as any
}

/** 
 *
 * Match to current NODE_ENV/ENTIRONMENT by comparison  */
export const matchEnv = (NODE_ENV: string): ENVIRONMENT => {
    if (!NODE_ENV) return undefined as any
    return Object.entries(ENV_NAME_CONVENTIONS).reduce((n, [k, val]) => {
        if (!n) {
            let _val: string[] = val as any
            if (_val.filter((x) => x === NODE_ENV).length) n = k as any
        }
        return n
    }, '') as ENVIRONMENT
}


/**
 * Get projects root .env file
 * @param pth optional if not supplied will lookup projects root .env
 */
export const pathToBaseRootEnv=(pth=''):string=>{
    pth = pth || path.resolve(process.cwd(), '.env');
    return path.isAbsolute(pth) ? pth : path.resolve(process.cwd(), pth);
}

/**
* Read current .env file as an object, already parsed
* @param {string} envRootFilePath defaults to root .env, or provide full url to current .env
*/
export const readENV = (envRootFilePath?: string, debug = false): ENV | undefined => {

    envRootFilePath = pathToBaseRootEnv(envRootFilePath)
   
    try {
        return readSingle.sync(envRootFilePath) as ENV | undefined
    } catch (err: any) {
        if (debug) console.error(err.toString())
    }
    return undefined
}

/**
 * Convert .env parsed data back to .env file readable format
 */
export const makeEnvFormat = (parsed: object): string | undefined => {
    if (!parsed) return undefined
    if (parsed) {
        const envData = Object.entries(parsed || {}).reduce((n, [k, val]) => {
            if (parsed[k] !== undefined) {
                n = n ? n + `${k}=${val.toString()}\n` : `${k}=${val.toString()}\n`
            }
            return n
        }, '')
        if (!envData) return undefined
        else return envData
    }
}

