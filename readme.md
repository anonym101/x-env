### x-env
Project environment manager for `TEST`, `DEVELOPMENT`, or `PRODUCTION`  be used to assign .env values to your `process.env`



#### Why use it

- Custom project
- No ENVIRONMENT setup available
- Use .env at base of your project
- Same ENVIRONMENT structure for all of your projects



#### Instalation

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

const XEnv = require('x-env')
const path = require('path')

const options = {
    /**  Dir location of xxx.env files 
    * minimum requirement for dev.env, and prod.env
    */
    envDir:path.join(__dirname,'./envs'),
    /** 
     * Environment types in our project, support: test.env (optional), dev.env (required), prod.env (required) - and should exist in {envDir}
     */
    envFileTypes:['dev.env','prod.env'],
    /** Full path with filename, usually project root ./
      * This file gets updated based on current environment  
    */
    baseRootEnv: path.join(__dirname,'../.env')
}
    
const xEnv = new XEnv(options,true)

/**
* - Check if dev.env and prod.env exist in {envDir} 
* - Check consistency, each file should include same property names
* - Each xx.env file should {ENVIRONMENT} variable set
*/
if (!xEnv.checkEnvFileConsistency()) throw '{name}.env consistency is not valid'

/** 
* - Check if checkEnvFileConsistency was ren and passed
* - Check if process.env.ENVIRONMENT is already set by initial script setting in package.json
* - Check to see if {name}.env for each available file has {ENVIRONMENT} set, and compares with process.env.ENVIRONMENT
* - Finally re-process process.env config base on {process.env.ENVIRONMENT} file selection
*/
if(!xEnv.setEnvironment()) throw('environment not set')



/**
* *NOW WE HAVE ACCESS* TO our env and can run this script anywhere in your app.
* Print object data of current environment of .env file at root of your application 
* @returns {}
*/
const getEnvConfig = ()=>{
    const variableExpansion = require('dotenv-expand')
    // will provide environment from application root

    const myEnv = xEnv.dotenv.config()
    const env = variableExpansion(myEnv)
    // console.log(env.error || env.parsed)
    return env
}

console.log(getEnvConfig())
console.log('true === ',process.env.ENVIRONMENT === getEnvConfig().parsed.ENVIRONMENT)

``` 

### Access to env
Once `x-env` script (xenvScript/ your script) was executed before application, you will gain access to `./env`
root variables when using `process.env`, or `getEnvConfig()` example method as demonstrated above.

