

import { readSingle } from 'read-env-file';
import { ENV } from "@interface";

/**
* Read current .env file as an object, already parsed
* @param {string} envRootFilePath provide full url to the current environment
*/
export const readENV = (envRootFilePath: string, debug = false): ENV | undefined => {
    if (!envRootFilePath) {
        return undefined
    }
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
        let envData = Object.entries(parsed || {}).reduce((n, [k, val]) => {
            if (parsed[k] !== undefined) {
                n = n ? n + `${k}=${val.toString()}\n` : `${k}=${val.toString()}\n`
            }
            return n
        }, '')
        if (!envData) return undefined
        else return envData
    }
}

