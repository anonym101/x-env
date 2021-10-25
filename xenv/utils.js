/** Internal utility belt */

const {configParse} = require('.')

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
 *  simpleParse > configParse() +{NODE_ENV}
 * @returns {{}}
 */
const combinedENVS = () => {
    try {
        if (simpleParse(process.argv)) {
            let v = {
                ...configParse(),
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