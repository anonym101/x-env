
/**
 * @typedef { 'TEST' | 'DEVELOPMENT' | 'PRODUCTION'} ENVIRONMENT
 * @typedef {{[prop: string]: string}} ENV
 */

 const dotEnvConfig  = require('dotenv').config
 const variableExpansion =require('dotenv-expand')
 

const matching

 /**
  * Return parsed ENVIRONMENT {name.env} based on process.env.NODE_ENV
  * - NODE_ENV available values: DEVELOPMENT, PRODUCTION, TEST
  * @param {boolean} auto decide which file to load based on process.env.NODE_ENV
  * @param {string} pth
  * 
  * @returns {ENV}
  */
module.exports = xEnvConfig = (auto = true, pth) => {
     if (!auto && !pth) throw 'When auto not set must provide path'
 
     /** @type {ENVIRONMENT} */
     const NODE_ENV= process.env.NODE_ENV
 
     let envPath = pth
     if (auto) {
         if (!NODE_ENV) throw 'NODE_ENV NOT SET'
         if (NODE_ENV === 'DEVELOPMENT') envPath = `./dev.env`
         if (NODE_ENV === 'PRODUCTION') envPath = `./prod.env`
         if (NODE_ENV === 'TEST') envPath = `./test.env`
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
 