### xenv example script

1. Example Script showing how to setup your .env file for access in current environment setting.
2. Initially we have to setup pre process script before our application starts:  

```js 
   // ...package.json
  "scripts": {
    "example:env:dev": "rimraf ./.env && node -r dotenv/config ./xenvExample dotenv_config_path=./xenvExample/envs/dev.env",
    "example:env:prod": "rimraf ./.env && node -r dotenv/config ./xenvExample dotenv_config_path=./xenvExample/envs/prod.env"
  }
```

3. Your current environment settings are parsed and transfered to root ./.env file.