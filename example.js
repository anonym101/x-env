
// const {parsedEnvConfig} = require('.')
// // based on  cross-env NODE_ENV=...
// // auto detect
// console.log(parsedEnvConfig())

// each manually, ignores current process.env.NODE_ENV
// parsedEnvConfig(false,'./prod.env')
console.log(process.env.ENVIRONMENT)