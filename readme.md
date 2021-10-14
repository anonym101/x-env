### x-env
Project environment manager for `TEST`, `DEVELOPMENT`, or `PRODUCTION`  be used to assign .env values to your `process.env`



#### Why use it

- Custom project
- No ENVIRONMENT setup available
- Use .env at base of your project
- Same ENVIRONMENT structure for all of your projects



#### Installation

```sh
$/ npm i x-env
```

#### Setup
We have to setup pre process script that gets called before our application start, we could call via bash script, or npm script.

NPM example :
```js
 //  Execution script in projects dir at: ./xenvScript
 // ...package.json
   "scripts": {
    "env:dev": "rimraf ./.env && node -e 'DOTENV_CONFIG_ENVIRONMENT=DEVELOPMENT' && node -r dotenv/config ./xenvScript dotenv_config_path=./xenvScript/envs/dev.env",
    "env:prod": "rimraf ./.env && node -e 'DOTENV_CONFIG_ENVIRONMENT=PRODUCTION' &&node -r dotenv/config ./xenvScript dotenv_config_path=./xenvScript/envs/prod.env",
  }

  // /$ npm env:dev # generates new .env at root of your project 
```
Above `env:dev` gets executed removing pre/existing ./.env then sets ENVIRONMENT=DEVELOPMENT same as in your env:dev file, then executes the script at `./xenvScript/index` with dotenv>dev.env default settings.



#### Example usage
Run initial script before application

What happens here:

* Example Script showing how to setup your .env environment file for access in current environment setting
* Initially we have to setup pre process script that gets called before our application does, we could call a bash script, or an npm script, for DEVELOPMENT dev.env _(per Setup above)_:  
*  Above script will initially remove last .env file, then preset ENVIRONMENT we want to work with _(should match property value in dev.env)_, then execute initial script (xenvScript) including dev.env as default settings.


```js
// xenvScript

const {XEnv,readENV} = require('x-env')
const path = require('path')

const options = {
    /**  Dir location of xxx.env files */
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

``` 

### Access to env
Once `x-env` script (xenvScript/ your script) was executed before application, you will gain access to `./env`
root variables when using `process.env`, or `readENV()` example method as demonstrated above.

