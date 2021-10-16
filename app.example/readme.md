### xenv example script

1. Example Script showing how to setup your .env file for access in current environment setting.
2. Initially we have to setup pre process script before our application starts:  
3. Application code should run within the same script process, so you have to execute it before the app, just like in `app.example/index`

```js 
   // ...package.json
  "scripts": {
    "app:dev": "rimraf ./.env && node ./app.example xenv_config_path=./app.example/XENV/dev.env",
    "app:prod": "rimraf ./.env && node ./app.example xenv_config_path=./app.example/XENV/prod.env",
    "app:test": "rimraf ./.env && node ./app.example xenv_config_path=./app.example/XENV/test.env",
  }
```

3. Your current environment settings are parsed and transfered to root ./.env file.