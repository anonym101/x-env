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


### Example

Accessing `xenv` indirectly

```js
const {config} = require('x-env')
// based on cross-env NODE_ENV=...
// auto detect
console.log(config())


// each manually, ignores current process.env.NODE_ENV
const auto = false
console.log(config(auto,'./dev.env')) // parse dev.env values to process.env{...}
console.log(config(auto,'./prod.env')) // parse prod.env values to process.env{...}
console.log(config(auto,'./test.env')) // parse prod.test values to process.env{...}
```


### About cross-env
x-env script extends from cross-env module, for more details refer to: `https://github.com/kentcdodds/cross-env/tree/v7.0.3`



## Contact
Have questions, or would like to submit feedback [contact eaglex.net](https://eaglex.net/app/contact?product=x-env)
