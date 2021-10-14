

const { readSingle } = require('read-env-file');

/**
* Read current .env file as an object, already parsed
* @param {string} envRootFilePath provide full url to the current environment
* @returns {object} transpiled and parsed .env to object
*/
exports.readENV = (envRootFilePath, debug = false) => {
    if (!envRootFilePath) {
        return undefined
    }
    try {
        return readSingle.sync(envRootFilePath)
    } catch (err) {
        if (debug) console.error(err.toString())
    }
    return undefined
}

/**
 * Convert .env parsed data back to .env file readable format
 * @param {object} parsed
 * @returns {string}
 */
exports.makeEnvFormat = (parsed) => {
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

