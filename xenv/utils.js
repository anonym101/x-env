/** Internal utility belt */
const path  = require('path')
const fs = require('fs') 

const processNODE_ENV= ()=>{
    try{
        return process.env.NODE_ENV
    }catch(err){
        return undefined
    }
}

/**
* @typedef {import('../types').xenv.ENV} ENV
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
 * Make all env values from xenv.config.js type string
 * @param {{}} env 
 */
const strignifyObjectValues = (env)=>{
   
        return Object.entries(env).reduce((n,[k,val])=>{
            try{
                if(typeof val!=='string'){
                    n[k]=JSON.stringify(val)
                } else n[k] = val
               
            }catch(err){
            }
            return n
        },{})
    }

/**
 * Provided envs must be in 1 level standard 
 * @param {{}} envs
 * @returns {boolean}
 */
function envsOneLevelStandard(envs) {
    try {
        let n = Object.entries(envs).reduce((n, [k, val]) => {
         
            if (typeof val==='boolean' || typeof val==='bigint' || typeof val==='number' || !val || typeof val=='string') {
                n[k] = val
            }          
            return n
        }, {})

        return Object.keys(n).length === Object.keys(envs).length
    } catch (err) {
        return false
    }
}




/**
* Parse NODE_ENV value from process.args[0]
* @param {Array<string> } args 
* @returns {boolean}
*/
const simpleParse = (args) => {
    const _NODE_ENV = processArgs(args).NODE_ENV
    if (!_NODE_ENV) return undefined
    else {
        // fixes left-hand assignment issue with webpack
        Object.assign(process.env,{NODE_ENV:_NODE_ENV}) 
    }
    return true
}

/**
 * Update process.envs 
 * @param {{}} envs 
 * @returns {void}
 */
const updateProcessEnvs = (envs)=>{
    try{
        for(let key in envs){
            if(envs.hasOwnProperty(key)){
                //process.env[key] = envs[key]
                // fix left-side assignment issue with webpack
                Object.assign(process.env,{[key]:envs[key]})
            }
        }
    }catch(err){
        // ups
    }
}

/**
 *  simpleParse > configParse() +{NODE_ENV}
 * @param {import("../types").xenv._configParse} _configParse
 * @returns {{}}
 */
const combinedENVS = (_configParse) => {
    try {
        if (simpleParse(process.argv)) {
            const loadConfigFile = true
            let v = {
                ..._configParse(true,null,loadConfigFile), 
                ...(processNODE_ENV() ? { NODE_ENV: processNODE_ENV()} : {})
            }
            return v
        }
    } catch (err) {
        console.log(err)
    }
    return {}
}
exports.combinedENVS = combinedENVS
exports.envsOneLevelStandard = envsOneLevelStandard
exports.strignifyObjectValues = strignifyObjectValues
exports.updateProcessEnvs = updateProcessEnvs
exports.processNODE_ENV = processNODE_ENV