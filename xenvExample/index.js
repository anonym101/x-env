
const {XEnv,readENV} = require('../cjs')
const path = require('path')

const options = {
    /**  Dir location of xxx.env files. 
     * @required
    */
    envDir:path.join(__dirname,'./envs'),

    /** 
     * Environment types in our project, support: test.env (optional), dev.env (required), prod.env (required), with consistent property names, and at least {ENVIRONMENT} set
     * @required
     */
    envFileTypes:['dev.env','prod.env','test.env'],

    /** Full path and filename, usually project root ./
      * This file gets updated based on current environment  
      * @required
    */
    baseRootEnv: path.join(__dirname,'../.env')
}
    
const xEnv = new XEnv(options,true)


/** 
* - Check if dev.env and prod.env exist in {envDir} 
* - Check consistency, each file should include same property names
* - Check to see if {name}.env for each available file has {ENVIRONMENT} set, and compares with process.env.ENVIRONMENT
* - Finally re-process process.env config base on {process.env.ENVIRONMENT} file selection
*/

// can optionally set environment type, otherwise detected based on package.json script setting
if(!xEnv.buildEnv(/** DEVELOPMENT */)) throw('environment build failed')
 
console.log(readENV(options.baseRootEnv))
console.log('true === ',process.env.ENVIRONMENT === readENV(options.baseRootEnv).ENVIRONMENT)


