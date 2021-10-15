### x-env
Project (.env) manager for `DEVELOPMENT`, `PRODUCTION` and  `TEST` environments, used to assign `.env` file values to your `process.env`


#### Why use it

- Custom project
- No ENVIRONMENT setup available
- Use .env at base of your project
- Use dev.env, prod.env and test.env environments
- Same ENVIRONMENT structure for all of your projects
- CJS, ESM, Typescript support
- DefinitelyTyped

#### Installation

```sh
$/ npm i x-env
```

#### Setup
To setup pre process script called before our application, we run an npm script.

NPM example :
```js
 //  Execution script at: ./xenvExample
 // ...package.json
  "scripts": {
    "example:env:dev": "rimraf ./.env && node -r dotenv/config ./xenvExample dotenv_config_path=./xenvExample/envs/dev.env",
    "example:env:prod": "rimraf ./.env && node -r dotenv/config ./xenvExample dotenv_config_path=./xenvExample/envs/prod.env",
  }

  //$ npm example:env:dev # generates new .env at project root
```
npm `example:env:dev` removes pre/existing ./.env, then executes `./xenvScript/index` following dev.env settings.



#### Support versions 

Versions: Typescript, ESM, CJS _(Commonjs)_

```js
// Typescript, use source
import {XEnv,readENV} from 'x-env/src';

// ESM
import {XEnv,readENV} from 'x-env';

// CJS
import {XEnv,readENV} from 'x-env/cjs';
const {XEnv,readENV} = require('x-env/cjs');

```


#### Example usage
Run initial script before application

- refer to **x-env/xenvExample/readme.md**

What happens here:

* Example Script showing how to setup your .env file for access in current environment setting
* Initially we have to setup pre process script before our application starts  
* Your current environment settings are parsed and transfered to root .env file


```js

// xenvExample/** script

const {XEnv,readENV} = require('x-env')
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

// Our class constructor
const xEnv = new XEnv(options,true)


/** 
* - Check if dev.env and prod.env exist in {envDir} 
* - Check consistency, each file should include same property names
* - Check to see if {name}.env for each available file has {ENVIRONMENT} set, and compares with process.env.ENVIRONMENT
* - Finally re-process process.env config base on {process.env.ENVIRONMENT} file selection
*/

// can optionally set environment type, otherwise detected based on package.json script setting
if(!xEnv.buildEnv(/** DEVELOPMENT */)) throw('environment build failed')
 

// read .env file in current/live environment  
console.log(readENV(options.baseRootEnv))
console.log('true === ',process.env.ENVIRONMENT === readENV(options.baseRootEnv).ENVIRONMENT)

``` 

#### Access to env
Once `x-env` script (xenvExample/** ) was executed before application, you gain access to `./env`
root variables using `process.env`, or `readENV(...)`.


#### ENVIRONMENTS
Typical environment structure.
Xenv requires minimum of ENVIRONMENT property to be set, all other variables must have *consistent* names


*dev.env*
```sh
# dev.env
# initial data
IP=::1
PORT=5000
ENVIRONMENT=DEVELOPMENT
# host api server url
HOST=http://localhost:${PORT}
```


*prod.env*
```sh
# prod.env
# initial data
IP=0.0.0.0
PORT=12345
ENVIRONMENT=PRODUCTION
# host api server url
HOST=http://${IP}:${PORT}
```


When current environment is in PRODUCTION *.env* root file would transpile to:
```sh
# .env
IP=0.0.0.0
PORT=12345
ENVIRONMENT=PRODUCTION
HOST=http://0.0.0.0:12345
```



&nbsp;



## Contact
Have questions, or would like to submit feedback [contact eaglex.net](https://eaglex.net/app/contact?product=x-env)



