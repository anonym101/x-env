'use strict';

/** 
 * ~/DEV
 * cli XEnv script for DEVELOPMENT environment 
 * Load env files by detecting XENV/ dir at root of project, if no XENV detected can also provide `xenv_config_dir` to to XENV location
*/

const { regExp_path, regExp_dir } = require('../cjs/data')
const { onerror, log } = require('x-utils-es/umd')
const { processArgs } = require('../cjs/utils')
const os = require('os')
const { XEnv, _xEnvConfig, readENV, XCONFIG, XENV_CLI_ARGS, XEnvExclusive } = require('../cjs')
const path = require('path')
const fs = require('fs')
const defaultEnvDirName = `XENV`;
const root = process.cwd()

// process any args provided
let XENV_DIR = projectRoot(processArgs(process.argv, regExp_dir).dir)

// NOTE Check if user supplied xenv_config_dir=, or check if {defaultEnvDirName} already exists in project root
if (XENV_DIR) {

  let _envDir = path.join(root, envDir)

  //NOTE if dir exists but we provided a path use that instead
  try {

    fs.readdirSync(_envDir)
    // update to full path
    XENV_DIR = _envDir

  } catch (err) {
    XENV_DIR = undefined
  }

  // otherwise check if dir exists instead when path to dir not provided
  if (!XENV_DIR) {
    try {
      _envDir = path.join(root, `./${defaultEnvDirName}`)
      fs.readdirSync(_envDir)
      XENV_DIR = _envDir
    } catch (err) {
      XENV_DIR = undefined
      // doesn't exist
      onerror(`[XEnv]`, `No /${root}/${defaultEnvDirName} dir at root of your project`)
      return process.exit(0)
    }
  }
}

function projectRoot(envPath = '') {
  return envPath[0] === '~' ? path.join(os.homedir(), envPath.slice(1)) : envPath
}

/** @type {XCONFIG} */
const options = {
  execType:'CLI', // NOTE  << special setting for cli and using executeLoader option 
  envDir: XENV_DIR,// path.join(__dirname, './'),
  envFileTypes: ['dev.env', 'prod.env', 'test.env'],
  //baseRootEnv: path.join(__dirname,'../../.env')
}

/** @type {XEnvExclusive} */
const xEnv = new XEnv(options, true) 

// -- set DEVELOPMENT as current ENVIRONMENT
xEnv.executeLoader({path:path.join(XENV_DIR,'./dev.env')})

/** 
* - Check if dev.env and prod.env exist in {envDir} 
* - Check consistency, each file should include same property names
* - Check to see if {name}.env for each available file has {ENVIRONMENT} set, and compares with process.env.ENVIRONMENT
* - Finally re-process process.env config base on {process.env.ENVIRONMENT} file selection
*/

// can optionally set environment type, otherwise detected based on package.json script setting
if (!xEnv.buildEnv(/** DEVELOPMENT */)) throw ('environment build failed')

console.log(readENV(/*options.baseRootEnv*/))
console.log('true === ',
  (process.env.ENVIRONMENT === readENV().ENVIRONMENT) &&
  readENV().ENVIRONMENT === process.env.NODE_ENV)