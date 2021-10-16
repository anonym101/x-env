### x-env-es
Project (.env) manager for `DEVELOPMENT`, `PRODUCTION` and  `TEST` environments, used to assign `.env` file values to your `process.env`


### Why use it

- Custom project
- No ENVIRONMENT setup available
- Use .env at base of your project
- Use dev.env, prod.env and test.env environments
- Same ENVIRONMENT structure for all of your projects
- CJS, ESM, Typescript support
- DefinitelyTyped

### Installation

```sh
$/ npm i x-env-es
```

### Setup
To setup pre process script called before our application, we run an npm script.

NPM example :
```js
 //  Execution script at: ./app.example
 // ...package.json
  "scripts": {
    "app:dev": "rimraf ./.env && node ./app.example xenv_config_path=./app.example/XENV/dev.env",
    "app:prod": "rimraf ./.env && node ./app.example xenv_config_path=./app.example/XENV/prod.env",
    "app:test": "rimraf ./.env && node ./app.example xenv_config_path=./app.example/XENV/test.env",
  }

  //$ npm app:dev # generates new .env at project root
```
npm `app:dev` removes pre/existing ./.env, then executes `./app.example/index` following dev.env settings.



### Support versions 

Versions: Typescript, ESM, CJS _(Commonjs)_

```js
// Typescript, use source
import {XEnv,readENV} from 'x-env-es/src';
// @types import {ENVIRONMENT,XCONFIG,EnvFile,EnvFileType,ENV,XENV_CLI_ARGS} from 'x-env-es/src';

// ESM
import {XEnv,readENV} from 'x-env-es';

// CJS
import {XEnv,readENV} from 'x-env-es/cjs';
const {XEnv,readENV} = require('x-env-es/cjs');

```


### Example usage
Run initial script before application

- refer to **example** [readme](https://github.com/anonym101/x-env/blob/master/app.example/readme.md)



What happens here:

* Example Script showing how to setup your .env file for access in current environment setting
* Initially we have to setup pre process script before our application starts  
* Your current environment settings are parsed and transpiled to root .env file


```js

// app.example/** script

const {XEnv,readENV,XCONFIG} = require('x-env-es')
const path = require('path')

/** @type {XCONFIG} */
const options = {
    /** 
     * @required 
     * Dir location of xxx.env files. 
    */
    envDir:path.join(__dirname,'./envs'),

    /** 
     * @required
     * Environment types in our project, support: test.env (optional), dev.env (required), prod.env (required), with consistent property names, and at least {ENVIRONMENT} set
     */
    envFileTypes:['dev.env','prod.env','test.env'],

    /** 
     * @optional
     * Full path and filename, usually project root ./
     * This file gets updated based on current environment  
     * If not set selected automatically
    */
   // baseRootEnv: path.join(__dirname,'../.env')
}

// Our class constructor
const DEBUG = true
const xEnv = new XEnv(options,DEBUG)


/** 
* - Check if dev.env and prod.env exist in {envDir} 
* - Check consistency, each file should include same property names
* - Check to see if {name}.env for each available file has {ENVIRONMENT} set, and compares with process.env.ENVIRONMENT
* - Finally re-process process.env config base on {process.env.ENVIRONMENT} file selection
*/

// can optionally set environment type, otherwise detected based on package.json script setting
if(!xEnv.buildEnv(/** DEVELOPMENT */)) throw('environment build failed')
 
console.log(readENV(/*options.baseRootEnv*/))
console.log('true === ',
            (process.env.ENVIRONMENT === readENV().ENVIRONMENT) && 
            readENV().ENVIRONMENT === process.env.NODE_ENV)
       

// -------------
// continue with application in the current process
// load above script before application starts

``` 



*app.example/index.js*
```js

require('./app.example/XENV'); // process.env updated
require('./app.example') // application now has access

```

&nbsp;


### Access to env
Once `x-env-es` script (app.example/** ) was executed before application, you gain access to `./env`
root variables using `process.env`, or `readENV(...)`.

&nbsp;

### ENVIRONMENTS
Typical environment structure.
XEnv requires minimum of ENVIRONMENT property to be set, all other variables must have *consistent* property names

* Available `ENVIRONMENT` name standards:
  * **DEVELOPMENT**: DEV, dev, develop, DEVELOP, DEVELOPMENT, development,
  * **PRODUCTION**: PROD, prod, PRODUCTION, production,
  * **TEST**: TEST, test, TESTING, testing


*dev.env*
```sh
# dev.env
ENVIRONMENT=DEV
# example data
IP=::1
PORT=5000

# host api server url
HOST=http://localhost:${PORT}
```


*prod.env*
```sh
# prod.env
ENVIRONMENT=PROD
# example data
IP=0.0.0.0
PORT=12345
# host api server url
HOST=http://${IP}:${PORT}
```


When current environment is in PRODUCTION *.env* root file would transpile to:

*.env*
```sh
# from file: prod.env
IP=0.0.0.0
PORT=12345
ENVIRONMENT=PROD
HOST=http://0.0.0.0:12345
```



&nbsp;



## Contact
Have questions, or would like to submit feedback [contact eaglex.net](https://eaglex.net/app/contact?product=x-env-es)



