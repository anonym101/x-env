### Simple .env manager

1. Go to `./index.js`, copy method: `parsedEnvConfig(...)` and install dependencies. 
2. Create `dev.env`, `prod.env`, `test.env` at ./root of your project, refer to `./ENVS` for examples 
3. Set cross-env script depending on your `NODE_ENV`

```sh
 "scripts": {
    "start:dev": "node_modules/.bin/xenv NODE_ENV=DEVELOPMENT node example",
    "start:prod": "node_modules/.bin/xenv NODE_ENV=PRODUCTION node example",
    "start:test": "node_modules/.bin/xenv NODE_ENV=TEST node example",
  },
```


### Example

Accessing `parsedEnvConfig()` method indirectly

```js
// based on cross-env NODE_ENV=...
// auto detect
console.log(parsedEnvConfig())


// each manually, ignores current process.env.NODE_ENV
const auto = false
console.log(parsedEnvConfig(auto,'./dev.env')) // parse dev.env values to process.env{...}
console.log(parsedEnvConfig(auto,'./prod.env')) // parse prod.env values to process.env{...}
console.log(parsedEnvConfig(auto,'./test.env')) // parse prod.test values to process.env{...}
```


### About cross-env
xenv script extends from cross-env module, for more details refer to: `https://github.com/kentcdodds/cross-env/tree/v7.0.3`
