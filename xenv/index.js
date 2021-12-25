
/**
 * @typedef { import('../types').xenv.ENVIRONMENT} ENVIRONMENT
 * @typedef {import('../types').xenv.ENV} ENV
 * @typedef { import('../types').xenv.NAME_CONVENTIONS} NAME_CONVENTIONS
 */

const dotEnvConfig = require('dotenv').config
const variableExpansion = require('dotenv-expand')
const {envsOneLevelStandard,strignifyObjectValues,updateProcessEnvs,processNODE_ENV} = require('./utils')
const scriptLoader = require('../x-config')

/** @type {NAME_CONVENTIONS} */
const ENV_NAME_CONVENTIONS = {
    DEVELOPMENT: ['DEV', 'dev', 'develop', 'DEVELOP', 'DEVELOPMENT', 'development'],
    PRODUCTION: ['PROD', 'prod', 'PRODUCTION', 'production'],
    TEST: ['TEST', 'test', 'TESTING', 'testing'],
}

/**
*
* Match to current NODE_ENV/ENVIRONMENT by comparison 
* @param {string} _NODE_ENV
* @returns {ENVIRONMENT}
**/
const matchEnv = (_NODE_ENV) => {
    if (!_NODE_ENV) return undefined

    // @ts-ignore
    return Object.entries(ENV_NAME_CONVENTIONS).reduce((n, [k, val]) => {
        if (!n) {
            /** @type {Array<string>} */
            let _val = val
            // @ts-ignore
            if (_val.filter((x) => x === _NODE_ENV).length) n = k
        }
        return n
    }, '')
}


/**
 * Return parsed ENVIRONMENT {name.env} based on process.env.NODE_ENV
 * - NODE_ENV available values matching ENV_NAME_CONVENTIONS[]
 * @param {boolean?} auto decide which file to load based on process.env.NODE_ENV
 * @param {string?} pth Optionally provide relative path to your {name}.env 
 * @param {boolean?} loadConfigFile to load xenv.config.js file from application root if available
 * @returns {ENV}
 */
const configParse = function (auto = true, pth = '', loadConfigFile=false) {
    if (!auto && !pth) throw 'When auto not set must provide path'

    /** @type {ENVIRONMENT} */
    // @ts-ignore
    let _NODE_ENV = processNODE_ENV()

    let envPath = pth
    if (auto) {
        if (!_NODE_ENV) throw 'NODE_ENV NOT SET'

        if (matchEnv(_NODE_ENV) === 'DEVELOPMENT') envPath = `./dev.env`
        if (matchEnv(_NODE_ENV) === 'PRODUCTION') envPath = `./prod.env`
        if (matchEnv(_NODE_ENV) === 'TEST') envPath = `./test.env`

    }

    /** execute config file if provided, catch any callback errors as well */
    const execute_config_cb = (parsedData)=>{
        try{

            const configSupportCB = scriptLoader('xenv.config.js')
            if(configSupportCB) return configSupportCB(Object.assign({}, parsedData)) || {}
            
        }catch(err){

            console.error('[xenv][config]',err)

        }
        return undefined
    }

    try {
        let data = dotEnvConfig({ path: envPath })

        // add xenv.config.js (optional) support so we can make conditional updates based on our {name}.env configuration
        if (loadConfigFile) {

            let availableData = execute_config_cb(data.parsed) 
            if (availableData) {
                if (!envsOneLevelStandard(availableData)) {
                    availableData = {}
                    console.error('process.env configuration return for xenv.config.js must be 1 level object/standard')
                }

                const clean_updatedEnvs = strignifyObjectValues(availableData)
                data.parsed = {
                    ...data.parsed,
                    ...clean_updatedEnvs
                }

                if (Object.keys(clean_updatedEnvs).length) updateProcessEnvs(data.parsed)
            }
        }
        
        const d = variableExpansion(data) // update value prefixes, (example): localhost:${PORT} > localhost:5555
        if (d.error) throw d.error
        else return d.parsed
    } catch (err) {
        console.log('[xenv][configParse]', `ENVIRONMENT not found for: ${envPath || _NODE_ENV}`)
    }
    return undefined
}

exports.configParse = configParse
