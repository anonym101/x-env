#!/usr/bin/env node

(function (){
    const {config} = require('../xenv')
    const crossEnv = require('../xenv/cross-env-alt')
    crossEnv(process.argv.slice(2),()=>{
        try{
            config()
        }catch(err){
            console.error('[error]',err.toString())
        }
    })   
   
})()
