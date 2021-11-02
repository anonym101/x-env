/** Internal utility belt */
const path  = require('path')
const os = require('os')
const fs = require('fs') 

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
 * Resolve Xenv cognitional/optional callback file  
 * @param {string} envPath 
 * @returns {(env:ENV | any)=>ENV?} return updated env 
 */
function xConfigSupportFile(envPath = 'xenv.config.js') {
    if (!envPath) throw 'fileName not set?'

    const testConfig = (file='')=>{
        try{
            return fs.readFileSync(file).toString().length >0
        }catch(err){
            return false
        }
    }

    // try 2 chances
    try {
        let file = path.resolve(process.cwd(), envPath).replace(/\\/g,"/")
        // first check if we have xenv.config.js available at the project root
        if(!testConfig(file)) return undefined
      
        const cb =  require('../x-config')(`${file}`) //require(`${file}`)

        if (typeof cb === 'function') return cb
        else throw (' Your xenv.config.js must return callback')
    } catch (err) {
        console.error('[xenv][config]', err)
    }
    // try {
    //     let file = (envPath || '')[0] === '~' ? path.join(os.homedir(), (envPath || '').slice(1)) : envPath || ''
    //      // first check if we have xenv.config.js available at the project root
    //     if(!testConfig(file)) return undefined
    //     const cb = require(file)
    //     if (typeof cb === 'function') return cb
    //     else throw (' Your xenv.config.js must return callback')
    // } catch (err) {
    //     console.error('[xenv][config]', err)
    // }
    return undefined
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
 * Update process.envs 
 * @param {{}} envs 
 * @returns {void}
 */
const updateProcessEnvs = (envs)=>{
    try{
        for(let key in envs){
            if(envs.hasOwnProperty(key)){
                process.env[key] = envs[key]
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
                ...(process.env.NODE_ENV ? { NODE_ENV: process.env.NODE_ENV } : {})
            }
            return v
        }
    } catch (err) {
        console.log(err)
    }
    return {}
}
exports.xConfigSupportFile = xConfigSupportFile
exports.combinedENVS = combinedENVS
exports.envsOneLevelStandard = envsOneLevelStandard
exports.strignifyObjectValues = strignifyObjectValues
exports.updateProcessEnvs = updateProcessEnvs