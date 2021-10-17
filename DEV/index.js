'use strict';

/** 
 * ~/DEV
 * cli XEnv script for DEVELOPMENT environment 
 * Load env files by detecting XENV/ dir at root of project, if no XENV detected can also provide `xenv_config_dir` to to XENV location
*/

// TODO add debug so we can get printout

const { regExp_dir } = require('../cjs/data')
const { onerror,log} = require('x-utils-es/umd')
const { processArgs } = require('../cjs/utils')
const os = require('os')
const { XEnv, readENV, XCONFIG, XEnvExclusive } = require('../cjs')
const path = require('path')
const fs = require('fs')

const defaultEnvDirName = `XENV`;
const root = process.cwd()
// process any args provided
let XENV_DIR = projectRoot(processArgs(process.argv, regExp_dir).dir)
let _envDir

// NOTE Check if user supplied xenv_config_dir=, or check if {defaultEnvDirName} already exists in project root
if (XENV_DIR) {
  _envDir = path.join(root, XENV_DIR)

  //NOTE if dir exists but we provided a path use that instead
  try {

    fs.readdirSync(_envDir)
    // update to full path
    XENV_DIR = _envDir

  } catch (err) {
    XENV_DIR = undefined
  }
}
// otherwise check if dir exists instead when path to dir not provided
else {
  _envDir = path.join(root, `./${defaultEnvDirName}`)
  try {
    fs.readdirSync(_envDir)
    XENV_DIR = _envDir
  } catch (err) {
    XENV_DIR = undefined
    // doesn't exist
    onerror(`[XEnv]`, `No ${defaultEnvDirName} dir at root/ of your project`)
    return process.exit(0)
  }
}

function projectRoot(envPath = '') {
  return envPath[0] === '~' ? path.join(os.homedir(), envPath.slice(1)) : envPath
}

/** @type {XCONFIG} */
const options = {
  execType: 'CLI', // NOTE  << special setting for cli and using executeLoader option 
  envDir: XENV_DIR,// path.join(__dirname, './'),
  envFileTypes: ['dev.env', 'prod.env', 'test.env'],
}

/** @type {XEnvExclusive} */
const xEnv = new XEnv(options, true)

// -- set dev as current ENVIRONMENT
xEnv.executeLoader({ path: path.join(XENV_DIR, './dev.env') })


// check build is ok
if (!xEnv.buildEnv(/** DEV */)) throw ('environment build failed')



//------------------------------------------------------
// ------------------------- app script, etc...
// we are good to go

log(readENV(/*options.baseRootEnv*/))
log('true === ',
  (process.env.ENVIRONMENT === readENV().ENVIRONMENT) &&
  readENV().ENVIRONMENT === process.env.NODE_ENV)