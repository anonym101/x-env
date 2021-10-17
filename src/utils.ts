

import { readSingle } from 'read-env-file';
import { ENV, ENVIRONMENT, ExecType, XENV_CLI_ARGS, XENV } from '@interface';
import path from 'path'
import { ENV_NAME_CONVENTIONS, regExp_path } from './data';
import { config as _dotEnvConfig, DotenvConfigOutput } from 'dotenv'
import { onerror } from 'x-utils-es/umd'

/**
 * dotenv config module wrapper 
 */
export const dotEnvConfig = (pth: string, _debug = false): DotenvConfigOutput => {
    if(!pth) return undefined as any
    try {
        return _dotEnvConfig({ path: pth })
    } catch (err: any) {
        if (_debug) onerror('[XEnv][dotEnvConfig]', err.toString())
    }
    return undefined as any
}

/** Make sure all {name}.env files have consistent prop names */
export const envFilePropConsistency = (list:XENV[]):boolean=>{

    /** props must match for both sides */
    const propCheck = (envKeys:string[],all:string[][]):boolean=>{
        
        let pass = 0
        for (let inx = 0; inx< all.length;inx++){
            let each = all[inx]
            if(envKeys.filter(x=> each.filter(y=>x===y).length).length===envKeys.length ){
                pass++
            }
        }

        return all.length  === pass
    }

   return list.filter((env,inx, all)=>{
        return propCheck(Object.keys(env), all.map(x=>Object.keys(x)))
    }).length === list.length
}


/** Process cli arguments 
 * @param {*} _args cli args
 * @param {*} regExp 
*/
 export const processArgs = (_args: Array<any>, regExp: RegExp): XENV_CLI_ARGS => {
     return _args.reduce((n, val) => {
         const mch = val.match(regExp)
         if (mch) n[mch[1]] = mch[2]
         return n
     }, {})
 }


/** 
 * Implementation to parse process.args and process.argv options so we can use XEnv options
 * We are to expect {path} 
 * @param {*} regExp {dir,path} are supported based on RegExp expressions
*/
export function _xEnvConfig(argv: string[], regExp: RegExp = regExp_path): XENV_CLI_ARGS {

    const args = processArgs(argv,regExp)
    if (args.path) {
        // assign full path so we can resolve it
        const pth = path.isAbsolute(args.path) ? args.path : path.resolve(process.cwd(), args.path)
        args.path = pth
    }

    if (args.dir) {
        // assign full path so we can resolve it
        const dir = path.isAbsolute(args.dir) ? args.dir : path.resolve(process.cwd(), args.dir)
        args.dir = dir
    }

    return Object.assign({}, args, {}) as any
}

/** 
 *
 * Match to current NODE_ENV/ENVIRONMENT by comparison  */
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
 * Available option types for executing XEnv
 */
export const executeTypeOptions = (execType?:ExecType):ExecType[]=>{
    return [execType==='CLI' ? 'CLI':null, execType==='ROBUST' ? 'ROBUST':null ].filter(n=>!!n) as ExecType[]
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
export function readENV(envRootFilePath?: string, debug = false): ENV | undefined {

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
export function makeEnvFormat(parsed: object,msg:string): string | undefined {
    if (!parsed) return undefined
    if (parsed) {
        const prepend = msg
        const envData = Object.entries(parsed || {}).reduce((n, [k, val]) => {
            if (parsed[k] !== undefined) {
                n = (n ? n + `${k}=${val.toString()}\n` : `${k}=${val.toString()}\n`);
            }
            return n
        }, '')
        if (!envData) return undefined
        else return envData ? prepend ? `# ${prepend}\n`+envData:envData:envData
    }
}

