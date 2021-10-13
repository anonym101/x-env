const XEnv = require('../libs/XEnv')
const fs = require('fs')
const path = require('path')

const baseRootEnv = path.join(__dirname,'./.env')
const envDir = path.join(__dirname,'./envs')
const envFileTypes = ['dev.env','prod.env']
const xEnv = new XEnv({baseRootEnv,envDir,envFileTypes},true)

if (!xEnv.checkEnvFileConsistency()) throw '{name}.env consistentancy is not valid'

 if(!xEnv.setEnvironment()){
     throw('environment not set')
 }
 
 console.log('all good')