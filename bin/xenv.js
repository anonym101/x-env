#!/usr/bin/env node

(function (){
    const xEnvConfig = require('../xenv')
    const crossEnv = require('../xenv/cross-env-alt')
    crossEnv(process.argv.slice(2),()=>{
        try{
            xEnvConfig()
        }catch(err){
            console.error('[error]',err.toString())
        }
    })   
   
})()
