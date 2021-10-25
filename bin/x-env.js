#!/usr/bin/env node

(function () {
    const { combinedENVS } = require('../xenv/utils')
    const crossEnv = require('../xenv/cross-env-alt')
    crossEnv(process.argv.slice(2), undefined, combinedENVS())
})()
