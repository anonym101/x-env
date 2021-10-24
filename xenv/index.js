
/**
 * @typedef { 'TEST' | 'DEVELOPMENT' | 'PRODUCTION'} ENVIRONMENT
 * @typedef {{[prop: string]: string}} ENV
 * @typedef {{[name:string]:Array<string> }} NAME_CONVENTIONS
 */

const dotEnvConfig = require('dotenv').config
const variableExpansion = require('dotenv-expand')


/** @type {NAME_CONVENTIONS} */
const ENV_NAME_CONVENTIONS = {
    DEVELOPMENT: ['DEV', 'dev', 'develop', 'DEVELOP', 'DEVELOPMENT', 'development'],
    PRODUCTION: ['PROD', 'prod', 'PRODUCTION', 'production'],
    TEST: ['TEST', 'test', 'TESTING', 'testing'],
}

/**
* 
* @param {Array<string> } args 
* @returns {{NODE_ENV:string}}
*/
const processArgs = function (args) {
    const re = /^NODE_ENV=(.+)$/
    // @ts-ignore
    return args.reduce(function (acc, cur) {
        const matches = cur.match(re)
        if (matches) {
            acc['NODE_ENV'] = matches[1]
        }
        return acc
    }, {})
}

/**
* Parse NODE_ENV value from process.args[0]
* @param {Array<string> } args 
* @returns {boolean}
*/
const simpleParse = (args) => {
    const NODE_ENV = processArgs(args).NODE_ENV
    if (!NODE_ENV) return undefined
    else {
        process.env.NODE_ENV = NODE_ENV
    }
    return true
}


/**
*
* Match to current NODE_ENV/ENVIRONMENT by comparison 
* @param {string} NODE_ENV
* @returns {ENVIRONMENT}
**/
const matchEnv = (NODE_ENV) => {
    if (!NODE_ENV) return undefined

    // @ts-ignore
    return Object.entries(ENV_NAME_CONVENTIONS).reduce((n, [k, val]) => {
        if (!n) {
            /** @type {Array<string>} */
            let _val = val
            // @ts-ignore
            if (_val.filter((x) => x === NODE_ENV).length) n = k
        }
        return n
    }, '')
}


/**
 * Return parsed ENVIRONMENT {name.env} based on process.env.NODE_ENV
 * - NODE_ENV available values matching ENV_NAME_CONVENTIONS[]
 * @param {boolean?} auto decide which file to load based on process.env.NODE_ENV
 * @param {string?} pth Optionally provide relative path to your {name}.env 
 * 
 * @returns {ENV}
 */
const config = function (auto = true, pth = '') {
    if (!auto && !pth) throw 'When auto not set must provide path'

    /** @type {ENVIRONMENT} */
    // @ts-ignore
    const NODE_ENV = process.env.NODE_ENV

    let envPath = pth
    if (auto) {
        if (!NODE_ENV) throw 'NODE_ENV NOT SET'

        if (matchEnv(NODE_ENV) === 'DEVELOPMENT') envPath = `./dev.env`
        if (matchEnv(NODE_ENV) === 'PRODUCTION') envPath = `./prod.env`
        if (matchEnv(NODE_ENV) === 'TEST') envPath = `./test.env`
    }

    try {
        const parsed = dotEnvConfig({ path: envPath })
        const d = variableExpansion(parsed)
        if (d.error) throw d.error
        else return d.parsed
    } catch (err) {
        console.log('[xenv][config]', `ENVIRONMENT not found for: ${envPath || NODE_ENV}`)
    }
    return undefined
}

/**
 *  simpleParse > config() +{NODE_ENV}
 * @returns {{}}
 */
const combinedENVS = () => {
    try {
        if (simpleParse(process.argv)) {
            let v = {
                ...config(),
                ...(process.env.NODE_ENV ? { NODE_ENV: process.env.NODE_ENV } : {})
            }
            return v
        }
    } catch (err) {
        console.log(err)
    }
    return {}
}

exports.combinedENVS = combinedENVS
exports.config = config
exports.processArgs = processArgs
exports.simpleParse = simpleParse