/**
 * @description Project environment manager for DEVELOPMENT, PRODUCTION, TEST, used to assign .env values to your `process.env
 * @namespace XEnv
 * @module x-env
 * @license MIT
 * {@link https://eaglex.net Eaglex}
 *
 * @author Developed by Anon
 * @version ^1.x.x
 */

import { copyFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'
import { readENV, makeEnvFormat } from './utils'
import variableExpansion from 'dotenv-expand'
import { EnvFile, EnvFileType, ENVIRONMENT, XCONFIG, XENV } from '@interface'
import { onerror, isFalsy, log } from 'x-utils-es/umd'

class XEnv {
    checkEnvPass = false
    config: XCONFIG
    debug: boolean

    /**
     * Build env file based on package.json configuration
     * @param {boolean} debug Display useful messages, errors always show
     */
    constructor(config: XCONFIG, debug = false) {
        this.debug = debug
        if (isFalsy(config)) throw new Error('Config not provided')
        if (!config.envDir) throw new Error('Must provide {envDir} full path')
        if (!config.baseRootEnv) throw new Error('Must provide {baseRootEnv} full path')

        if (!config.envFileTypes.includes('dev.env') || !config.envFileTypes.includes('prod.env')) throw new Error('Must at least include: dev.env and prod.env')
        this.config = config
    }

    /**
     * @param {*} envName Choose which environment to look out for, if not set will be selected based selected name.env setting
     */
    buildEnv(envName: ENVIRONMENT): boolean {
        if (!this.checkEnvFileConsistency()) {
            if (this.debug) onerror('[XEnv]', 'Failed consistency check!')
            return false
        }

        const envNameConfirmed = this.setNewEnvConfig(envName)
        if (envNameConfirmed) return this.copyRenameToLocation(envNameConfirmed)
        else return false
    }

    /**
     * Access env file, full path
     */
    get envFile(): EnvFile {
        return {
            ...(this.config.envFileTypes.includes('test.env') ? { ['test.env']: join(this.config.envDir, `./test.env`) } : {}),
            ...(this.config.envFileTypes.includes('dev.env') ? { ['dev.env']: join(this.config.envDir, `./dev.env`) } : {}),
            ...(this.config.envFileTypes.includes('prod.env') ? { ['prod.env']: join(this.config.envDir, `./prod.env`) } : {}),
        }
    }

    /**
     * Available environments based on our {config} setting
     * @param {*} selected only list selected environment when true
     **/
    environments(selected: boolean = false): XENV[] {
        const env = (envFileName: EnvFileType) => {
            const filePath = join(this.config.envDir, `./${envFileName}`)

            let data: XENV = readENV(filePath, false) || ({} as any)
            data = {
                ...data,
                type: envFileName,
            }

            if (selected) {
                if (data.ENVIRONMENT === process.env.ENVIRONMENT) return data
            } else return data
        }

        // @ts-ignore
        return [this.envFile['test.env'] ? env('test.env') : null, this.envFile['dev.env'] ? env('dev.env') : null, this.envFile['prod.env'] ? env('prod.env') : null].filter(
            (v) => !!v
        )
    }

    /**
     * Set dotenv config based on .env.ENVIRONMENT settings in package.json for your desired environment to perform our new .env builds
     * @param {*} envName Build choice name, does not reflect name per your .env file
     */
    setNewEnvConfig(envName: ENVIRONMENT): ENVIRONMENT {
        /**
         * - Check if dev.env and prod.env exist in {envDir}
         * - Check consistency, each file should include same property names
         * - Check to see if {name}.env for each available file has {ENVIRONMENT} set, and compares with process.env.ENVIRONMENT
         * - Finally re-process process.env config base on {.env.ENVIRONMENT} file selection
         */

        let configSetFor: any
        if (!this.checkEnvPass) {
            configSetFor = ''
            if (this.debug) onerror('[XEnv]', 'checkEnvPass===false, did you call method: checkEnvFileConsistency() ?')
            return undefined as any
        }

        if (!process.env.ENVIRONMENT) {
            if (this.debug) onerror('[XEnv]', 'process.env.ENVIRONMENT is not set ?')
            return undefined as any
        }

        // base on selected environment perform dotenv.config() update
         // @ts-ignore
        const ENVIRONMENT = process.env.ENVIRONMENT
        this.environments(true)
            .filter((env) => (envName && env ? envName === env.ENVIRONMENT : !!env))
            .forEach((env) => {
                if (!env) return
                if (configSetFor) return

                const fileData = env.ENVIRONMENT
                if (fileData === ENVIRONMENT) {

                    const fileName =
                       // @ts-ignore
                        env.ENVIRONMENT === 'TEST' ? 'test.env' : env.ENVIRONMENT === 'DEVELOPMENT' ? 'dev.env' : env.ENVIRONMENT === 'PRODUCTION' ? 'prod.env' : undefined
                    if (fileName) {
                        // run dotenv config
                        config({ path: join(this.config.envDir, `./${fileName}`) })
                        configSetFor = env.ENVIRONMENT
                    }
                }
            })

        return configSetFor
    }

    /**
     * Renew current environment file every time we start this script
     * - Copy desired environment to baseRootEnv, and rename it as our master environment file for: ./.env
     * - dev.env, rod.env, or test.env should be available in current dir as per {envFileTypes} specified
     * - Should call after checkEnvFileConsistency() method pass
     */
    copyRenameToLocation(envName: ENVIRONMENT): boolean {
        let sourcePath, destPath
        // check if user provided path only to the root dir or included .env in the path
        const baseRootEnv = this.config.baseRootEnv.indexOf('.env') === -1 ? join(this.config.baseRootEnv, '.env') : this.config.baseRootEnv

        const rootEnvFilePath = baseRootEnv
        destPath = rootEnvFilePath
        if (envName === 'TEST' && this.envFile['test.env']) sourcePath = this.envFile['test.env']
        if (envName === 'DEVELOPMENT' && this.envFile['dev.env']) sourcePath = this.envFile['dev.env']
        if (envName === 'PRODUCTION' && this.envFile['prod.env']) sourcePath = this.envFile['prod.env']

        if (!sourcePath) {
            if (this.debug) onerror('[XEnv]', `Wrong envName: ${envName}`)
            throw new Error(`Wrong envName:${envName}`)
        }

        try {
            // copy new file at root
            copyFileSync(sourcePath, destPath)

            //
            const selectedEnv = this.environments(true)[0]
            delete selectedEnv.type

            // once copied, we parse the file data
            const data = variableExpansion({ parsed: selectedEnv as any })
            if (data.parsed) {
                // convert parsed data back to .env format
                const envData = makeEnvFormat(data.parsed)
                if (envData) writeFileSync(baseRootEnv, envData)

                if (envName === 'TEST') log('{TEST} environment set')
                if (envName === 'DEVELOPMENT') log('{DEVELOPMENT} environment set')
                if (envName === 'PRODUCTION') log('{PRODUCTION} environment set')
            } else {
                throw data.error
            }
            return true
        } catch (err: any) {
            onerror('[XEnv]', err.toString())
        }
        throw new Error(`File not found, or wrong envName: ${envName}`)
    }

    /**
     * Check consistency of test.env, dev.env, and prod.env files
     * - Each xxx.env should have included all property names
     * - Each xxx.env file has min requirement to include {ENVIRONMENT} property
     */
    checkEnvFileConsistency(): boolean {
        try {
            const envList = this.environments()
            this.checkEnvPass = false
            const testFileKeys = this.envFile['test.env'] ? Object.keys(envList.filter((n) => n.type === 'test.env')[0] || {}) : []
            const devFileKeys = Object.keys(envList.filter((n) => n.type === 'dev.env')[0] || {})
            const prodFileKeys = Object.keys(envList.filter((n) => n.type === 'prod.env')[0] || {})

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
                    if (this.debug) onerror('[XEnv]', 'test.env is not consistent with the other .env files')
                    lenOk = false
                }
            }
            const mustHaveENVIRONMENT = devFileKeys.filter((v) => v === 'ENVIRONMENT').length === 1
            if (!mustHaveENVIRONMENT) {
                if (this.debug) onerror('[XEnv]', 'All .env files should include {ENVIRONMENT} property')
                return false
            }

            // NOTE  if ok we are safe to call methods: setXEnvConfig() > copyRenameToLocation()
            if (lenOk) this.checkEnvPass = true

            return lenOk
        } catch (err: any) {
            onerror('[XEnv]', err.toString())
        }
        return false
    }
}

export { XEnv }
export { readENV }
