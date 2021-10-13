/** 
 * @description XEnv class, based on package.json env:dev, env:prod, these scripts are initialized 
 * */

/**
 * Default ENV settings, maybe differnt in your application
 * @typedef {{IP:string,PORT:string,ENVIRONMENT:'DEVELOPMENT'|'PRODUCTION',HOST:string}} ENV
 * @typedef {'TEST'|'DEVELOPMENT'|'PRODUCTION'} ENVIRONMENT
 * @typedef {'test.env'|'dev.env'|'prod.env'} EnvFileType
 * @typedef {{'test.env'?:string,'dev.env'?:string,'prod.env'?:string}} EnvFile
 */

const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const { log, isFalsy, onerror } = require('x-utils-es/esm')
const variableExpansion = require('dotenv-expand')

class XEnv {
    checkEnvPass = false

    /** @type {{envDir:string,envFileTypes:Array<EnvFileType>, baseRootEnv:string}} */
    config

    /**
     * Build env file based on package.json configuration
     * @param {Object} config Your config file goes here
     * @param {string} config.envDir Dir location of files
     * @param {Array<EnvFileType>} config.envFileTypes Environment types we will be dealing with on the project, current support for: test.env, dev.env, prod.env  
     * @param {string} config.baseRootEnv Full path location of .env file to which current environment is copied to, usualy at base of your application: ./.env
     * @param {boolean} debug Display usefull messages, errors always show 
     */
    constructor(config, debug = false) {
        this.debug = debug
        if (isFalsy(config)) throw 'Config not provided'
        if (!config.envDir) throw 'Must provide {envDir} full path'
        if (!config.baseRootEnv) throw 'Must provide {baseRootEnv} full path'

        if (!config.envFileTypes.includes('dev.env') || !config.envFileTypes.includes('prod.env')) throw 'Must at least include: dev.env and prod.env'

        this.config = config;
    }

    /**
     * @param {ENVIRONMENT?} envName Choose which environment to look out for, if not set will be selected based on package.json setting
     * @returns {boolean}
     */
    setEnvironment(envName = undefined) {
        if (envName) {
            if (this.setNewEnvConfig(envName)) {
                return this.copyRenameToLocation(envName)
            }
        }
        else {
            let pass = false
            // run one iteration based on package.json settings
            this.environments.forEach(envNm => {
                if (this.setNewEnvConfig(envNm)) {
                    pass = this.copyRenameToLocation(envNm)
                }
            })
            return pass
        }
    }


    /** 
     * Access env file, full path
     * @type {EnvFile}
     */
    get envFile() {
        return {
            ...(this.config.envFileTypes.includes('test.env') ? { ['test.env']: path.join(this.config.envDir, `./test.env`) } : {}),
            ...(this.config.envFileTypes.includes('dev.env') ? { ['dev.env']: path.join(this.config.envDir, `./dev.env`) } : {}),
            ...(this.config.envFileTypes.includes('prod.env') ? { ['prod.env']: path.join(this.config.envDir, `./prod.env`) } : {}),
        }
    }

    /**
     * Read available file by env name
     * @param {ENVIRONMENT} envName Read choice name, does not reflect name  per your .env file
     * @returns {ENV} Your env config may vary in settings but {ENVIRONMENT} should always be set
     */
    readEnvFile(envName, noDebug = false) {
        let name = ''
        if (envName === 'TEST' && this.envFile['test.env']) name = 'test.env'
        if (envName === 'DEVELOPMENT' && this.envFile['dev.env']) name = 'dev.env'
        if (envName === 'PRODUCTION' && this.envFile['prod.env']) name = 'prod.env'
        let file = path.join(this.config.envDir, `./${name}`)

      
        if(!name)  return undefined
        try {
           
            let data = dotenv.parse(fs.readFileSync(file))

             // @ts-ignore
            return data
        } catch (err) {
            if (this.debug && noDebug) onerror('[XEnv]',` file not found for: ${envName}`,err.toString())
        }
        return undefined
    }

    /**
     * Available environments based on our {config} setting
     * @type {ENVIRONMENT[]} */
    get environments() {
        // @ts-ignore
        return [this.envFile['test.env'] ? 'TEST' : null, this.envFile['dev.env'] ? 'DEVELOPMENT' : null, this.envFile['prod.env'] ? 'PRODUCTION' : null].filter(v => !!v)
    }


    /**
     * Set dotenv config based on process.env.ENVIRONMENT settings in package.json for your desired environment to perform our new .env builds
     * - package.json ENVIRONMENT variable should reflect your xx.env variable
     * @param {ENVIRONMENT} envName Build choice name, does not reflect name per your .env file
     * @returns {boolean}
     */
    setNewEnvConfig(envName) {

        /**
         * 1. First check if checkEnvFileConsistency was ren and passed
         * 2. Check process.env.ENVIRONMENT is already set by initial script setting in package.json
         * 3. Check to see if {name}.env for each available file has {ENVIRONMENT} set, and compares with process.env.ENVIRONMENT
         * 4. Finally reset global config {process.env.ENVIRONMENT} base on file selection 
         */

        let configSet = false

        if (!this.checkEnvPass) {
            configSet = false
            if (this.debug) onerror('[XEnv]', 'checkEnvPass===false, did you call method: checkEnvFileConsistency() ?')
            return false
        }

        if (!process.env.ENVIRONMENT) {
            if (this.debug) onerror('[XEnv]', 'process.env.ENVIRONMENT is not set ?')
            return false
        }

        // base on selected environment perform  dotenv.config() update
        this.environments.filter(v => v === envName).forEach(envNm => {
            if ((this.readEnvFile(envNm,true) || {}).ENVIRONMENT === process.env.ENVIRONMENT) {
                const fileName = envName === 'TEST' ? 'test.env' : envName === 'DEVELOPMENT' ? 'dev.env' : envName === 'PRODUCTION' ? 'prod.env' : undefined
                if (fileName) {
                    dotenv.config({ path: path.join(__dirname, './test.env') })
                    configSet = true
                }
            }
        })

        return configSet
    }

    /**
     * Renew current environment file every time we start this script
     * - Copy desired environment to baseRootEnv, and rename it as our master environment file for: ./.env
     * - dev.env, rod.env, or test.env should be available in current dir as per {envFileTypes} specified
     * - Should call after checkEnvFileConsistency() method pass
     * @param {ENVIRONMENT} envName
     * @returns {boolean}
     */
    copyRenameToLocation(envName) {
        let sourcePath, destPath
        // check if user provided path only to the root dir or included .env in the path
        const baseRootEnv = this.config.baseRootEnv.indexOf('.env')===-1 ?  path.join(this.config.baseRootEnv, '.env'):this.config.baseRootEnv

        const rootEnvFilePath = baseRootEnv
        destPath = rootEnvFilePath
        if (envName === 'TEST' && this.envFile['test.env']) sourcePath = this.envFile['test.env']
        if (envName === 'DEVELOPMENT' && this.envFile['dev.env']) sourcePath = this.envFile['dev.env']
        if (envName === 'PRODUCTION' && this.envFile['prod.env']) sourcePath = this.envFile['prod.env']

        if (!sourcePath) {
            if (this.debug) onerror('[XEnv]', `wrong envName: ${envName}`)
            throw `Wrong envName:${envName}`
        }

        // File destination will be created or overwritten by default.
        try {
            fs.copyFileSync(sourcePath, destPath)
            if (envName === 'TEST') log('TEST environment set')
            if (envName === 'DEVELOPMENT') log('DEVELOPMENT environment set')
            if (envName === 'PRODUCTION') log('PRODUCTION environment set')
            return true
        } catch (err) {
            onerror('[XEnv]', err.toString())

        }

        throw `File not found or wrong envName: ${envName}`
    }

    /**
     * Check consistency of test.env, dev.env, and prod.env files
     * - Each xxx.env should have included all property names
     * - Each xxx.env file has min requirement to include {ENVIRONMENT} property
     * @returns {boolean}
     */
    checkEnvFileConsistency() {
        try {
            this.checkEnvPass = false
            let testFileKeys = this.envFile['test.env'] ? Object.keys(this.readEnvFile('TEST') || {}) :[]
            let devFileKeys = Object.keys(this.readEnvFile('DEVELOPMENT') || {})
            let prodFileKeys = Object.keys(this.readEnvFile('PRODUCTION') || {})

            if (!devFileKeys.length) {
                if (this.debug) onerror('[XEnv]', 'dev.env not set or not provided')
                return false
            }
            
            if (!prodFileKeys.length) {
                if (this.debug) onerror('[XEnv]', 'prod.env not set or not provided')
                return false
            }

            if (this.envFile['test.env'] && !testFileKeys.length) {
                if (this.debug) onerror('[XEnv]', 'test.env not set or not provided')
                return false
            }
    

            let lenOk = devFileKeys.filter((x) => prodFileKeys.filter((y) => x === y).length).length === devFileKeys.length

            if (this.envFile['test.env']) {
                if (testFileKeys.length !== devFileKeys.length) {
                    if (this.debug) onerror('[XEnv]', 'test.env is not consistant with the other .env files')
                    lenOk = false
                }
            }
            const mustHaveENVIRONMENT = devFileKeys.filter(v => v === 'ENVIRONMENT').length === 1
            if (!mustHaveENVIRONMENT) {
                if (this.debug) onerror('[XEnv]', 'All .env files should include {ENVIRONMENT} property')
                return false
            }

            // NOTE  if ok we are safe to call methods: setXEnvConfig() > copyRenameToLocation() 
            if (lenOk) this.checkEnvPass = true;

            return lenOk
        } catch (err) {
            onerror('[XEnv]', err.toString())
        }
        return false
    }
}

module.exports = XEnv

// const XEnv = new XEnv()
// if (!XEnv.checkEnvFileConsistency()) throw '{name}.env consistentancy is not valid'

// // NOTE load dev.env
// if (process.env.ENVIRONMENT === 'DEVELOPMENT') {
//     dotenv.config({ path: path.join(__dirname, './dev.env') })
//     XEnv.copyRenameToLocation('DEVELOPMENT')
// }
// // NOTE load prod.env
// if (process.env.ENVIRONMENT === 'PRODUCTION') {
//     dotenv.config({ path: path.join(__dirname, './prod.env') })
//     XEnv.copyRenameToLocation('PRODUCTION')
// }

// // print results to cli
// const myEnv = dotenv.config()
// const env = variableExpansion(myEnv)
// console.log(env.error || env.parsed)
