

/**
* Example Script showing how to setup your .env environment file for access in current environment setting
* Initially we have to setup pre process script that gets called before our application, we could call a bash script, or an npm script, for DEVELOPMENT dev.env: 
* `rimraf ./example/.env && node -e 'DOTENV_CONFIG_ENVIRONMENT=DEVELOPMENT' && node -r dotenv/config example dotenv_config_path=./example/envs/dev.env`  
*  Above script will initially remove last .env file, then preset ENVIRONMENT we want to work with, should match  property value of dev.env, then execute initial script (this example script) including dev.env default settings
*/

const {XEnv,readENV} = require('../esm')

const path = require('path')
const options = {
    /**  Dir location of {xxx}.env files */
    envDir:path.join(__dirname,'./envs'),
    /** 
     * Environment types in our project, current support: test.env (optional), dev.env (required), prod.env (required) - these should exist in {envDir}, have consistent property names with at least {ENVIRONMENT} being set
     */
    envFileTypes:['dev.env','prod.env','test.env'],
    /** Full path with filename, usually project root ./
      * This file gets updated based on current environment  
    */
    baseRootEnv: path.join(__dirname,'../.env')
}
    
const xEnv = new XEnv(options,true)

/** 
* - Check if dev.env and prod.env exist in {envDir} 
* - Check if checkEnvFileConsistency was ren and passed
* - Check consistency, each file should include same property names
* - Each xx.env file should {ENVIRONMENT} variable set
* - Check if process.env.ENVIRONMENT is already set by initial script setting in package.json
* - Check to see if {name}.env for each available file has {ENVIRONMENT} set, and compares with process.env.ENVIRONMENT
* - Finally re-process process.env config base on {process.env.ENVIRONMENT} file selection
*/

// can optionally set environment type, otherwise detected based on package.json script setting
if(!xEnv.buildEnv(/** DEVELOPMENT */)) throw('environment build failed')
 
console.log(readENV(options.baseRootEnv))
console.log('true === ',process.env.ENVIRONMENT === readENV(options.baseRootEnv).ENVIRONMENT)

