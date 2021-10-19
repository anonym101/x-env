### Simple .env manager

1. Go to `./index.js`, copy method: `parsedEnvConfig(...)` and install dependencies. 
2. Create `dev.env`, `prod.env`, `test.env` at ./root of your project
3. Set cross-env script depending on your `NODE_ENV`

```sh
 "scripts": {
    "start:dev": "cross-env NODE_ENV=DEVELOPMENT node example",
    "start:prod": "cross-env NODE_ENV=PRODUCTION node example",
    "start:test": "cross-env NODE_ENV=TEST node example",
  },
```