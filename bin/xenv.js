#!/usr/bin/env node

(function (){
    const xEnvConfig = require('../index')
    const crossEnv = require('cross-env/src/')
    crossEnv(process.argv.slice(2))   
    xEnvConfig()
})()