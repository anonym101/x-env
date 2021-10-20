#!/usr/bin/env node

(function (){
    const xEnvConfig = require('./xenv')
    const crossEnv = require('cross-env/src/')
    crossEnv(process.argv.slice(2))   
    xEnvConfig()
})()

console.log(process.env.NODE_ENV)