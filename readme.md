## Simple .env manager
Manage your .env files by providing NODE_ENV=... environment name to cli script

1. Create `dev.env`, `prod.env`, `test.env` at ./root of your project, refer to `./ENVS` for examples 
2. Set ./xenv bin executable before script entry with your `NODE_ENV` environment name, *( unless your application already processes NODE_ENV using conventional names. )*
3. Example for setting the script:

```sh
 "scripts": {
    "start:dev": "node_modules/.bin/xenv NODE_ENV=DEVELOPMENT node example",
    "start:prod": "node_modules/.bin/xenv NODE_ENV=PRODUCTION node example",
    "start:test": "node_modules/.bin/xenv NODE_ENV=TEST node example",
  },
```

`NODE_ENV` conventional names:

- *DEVELOPMENT*: `DEV, dev, develop, DEVELOP, DEVELOPMENT, development`
- *PRODUCTION*: `PROD, prod, PRODUCTION, production`
- *TEST*: `TEST, test, TESTING, testing`


### Install
You can install `x-env` script as npm dependency like so:

```sh
/$ npm i https://github.com/anonym101/x-env.git
```


### Examples

1. **Example One**:

When using npm cli command following your script:
`  "start:dev": "node_modules/.bin/xenv NODE_ENV=DEVELOPMENT node example", `
 will parse all` dev.env` values to process.env[...], so you dont have to invoke {configParse} method again.
 You can use your custom method to extract desired values from `process.env`

```js

const exportEnvs = () => {
    const props = ['DEBUG', 'ENVIRONMENT', 'NODE_ENV']
    return Object.entries(process.env).reduce((n, [ k, val ]) => {
        if (props.filter(x => k === x).length) {
            n[k] = val
        }
        return n
    }, {}) // > {DEBUG,ENVIRONMENT,NODE_ENV}
}

```

2. **Example Two**:

Accessing `xenv` indirectly

```js
const {configParse} = require('x-env')
// based on cross-env NODE_ENV=...
// auto detect
console.log(configParse())


// Or each manually, overrides current process.env.NODE_ENV selection
const auto = false
console.log(configParse(auto,'./dev.env')) // parse dev.env values to process.env{...}
console.log(configParse(auto,'./prod.env')) // parse prod.env values to process.env{...}
console.log(configParse(auto,'./test.env')) // parse prod.test values to process.env{...}
```


### Config file
You can (optionally) add `xenv.config.js` to root of your application, where it will preflight/update your {name}.env settings.

- You must provide a callback method, and return the object. 

```js
// (file) xenv.config.js

module.exports = (ENVS)=>{

    if(ENVS.SSL==='1') ENVS.PORT=443

return ENVS; // must return single level object

}

```


### About cross-env
x-env script extends from cross-env module, for more details refer to: `https://github.com/kentcdodds/cross-env/tree/v7.0.3`



## Contact
Have questions, or would like to submit feedback [contact eaglex.net](https://eaglex.net/app/contact?product=x-env)
