

import { readSingle } from 'read-env-file';
import { ENV } from '@interface';
import path from 'path'

/**
* Read current .env file as an object, already parsed
* @param {string} envRootFilePath defaults to root .env, or provide full url to current .env
*/
export const readENV = (envRootFilePath?: string, debug = false): ENV | undefined => {

    const normalizePath=(pth=""):string=> {
        pth = pth || path.resolve(process.cwd(), '.env');
        return path.isAbsolute(pth) ? pth : path.resolve(process.cwd(), pth);
    }

    envRootFilePath = normalizePath(envRootFilePath)
   
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

