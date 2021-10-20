
/**
 * @typedef { 'TEST' | 'DEVELOPMENT' | 'PRODUCTION'} ENVIRONMENT
 * @typedef {{[prop: string]: string}} ENV
 * @typedef {{[name:string]:Array<string> }} NAME_CONVENTIONS
 */

 const dotEnvConfig  = require('dotenv').config
 const variableExpansion =require('dotenv-expand')
 

 /** @type {NAME_CONVENTIONS} */
const ENV_NAME_CONVENTIONS = {
    DEVELOPMENT: ['DEV', 'dev', 'develop', 'DEVELOP', 'DEVELOPMENT', 'development'],
    PRODUCTION: ['PROD', 'prod', 'PRODUCTION', 'production'],
    TEST: ['TEST', 'test', 'TESTING', 'testing'],
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
  * @param {boolean} auto decide which file to load based on process.env.NODE_ENV
  * @param {string} pth
  * 
  * @returns {ENV}
  */
module.exports = function xEnvConfig (auto = true, pth){
     if (!auto && !pth) throw 'When auto not set must provide path'
 
     /** @type {ENVIRONMENT} */
     // @ts-ignore
     const NODE_ENV= process.env.NODE_ENV
 
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
         console.log('[parsedEnvConfig]', `ENVIRONMENT not found for: ${envPath || NODE_ENV}`)
     }
     return undefined
 }
 