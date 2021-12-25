const fs = require('fs');
const path = require('path')



/**
 * @param {string} _path 
 * @returns {any} parsed script to javascript
 * @notes providing custom require resolves error messages from angular compilation, example: `index.d.ts is missing from the TypeScript compilation. Please make sure it is in your tsconfig via the 'files' `
 */
module.exports = function scriptLoader(_path = './xenv.config.js') {

    const testConfig = (f='')=>{
        try{
            let filepath = path.resolve(process.cwd(), f).replace(/\\/g,"/")
            let file =  fs.readFileSync(filepath).toString()
            if(file.length >0) return file
        }catch(err){
            return undefined
        }
    }
    const configRawData = testConfig(_path)
 
    if(!configRawData) throw('xenv.config.js doesnt exist')
    try{
        return eval(configRawData);
    }catch(err){
        console.log('[scriptLoader][eval][error]',err.toString())
        return undefined
    }
}