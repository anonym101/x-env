/**
 * @description Project environment manager for DEVELOPMENT, PRODUCTION, TEST, used to assign .env values to your `process.env
 * @namespace XEnv
 * @module x-env-es
 * @license MIT
 * {@link https://eaglex.net Eaglex}
 * @author Developed by Anon
 * @version ^1.1.x
 */

 import { copyFileSync, writeFileSync } from 'fs'
 import { join } from 'path'
 
 import { readENV, makeEnvFormat, matchEnv, _xEnvConfig, executeTypeOptions, dotEnvConfig, envFilePropConsistency } from '../utils'
 import variableExpansion from 'dotenv-expand'
 import { EnvFileType, ENVIRONMENT, ExecType, XCONFIG, XENV, XEnvExclusive, XENV_CLI_ARGS } from '@interface'
 import { onerror, isFalsy, log, includes } from 'x-utils-es/umd'
import { XEnvBase } from './base'
 
 class XEnv extends XEnvBase implements XEnvExclusive {

     constructor(config: XCONFIG, debug: boolean) {
         super(config,debug)

         //NOTE  ROBUST is our alpha/fallback user did not set ROBUST, no external call required
         if (this.config.execType === 'ROBUST') {
             this.executeLoader(_xEnvConfig(process.argv))
         }
 
         // load and assign initial process values first
         this.loadConfigFile(this.config.execType)
         if (!this.validateEnvName()) {
             onerror('[XEnv]',`process.env.ENVIRONMENT is not set in your {name}.env file, or part of valid name conventions`)
             process.exit(0)  
         }

         //NOTE and now process.env.ENVIRONMENT should be available
     }
 
     /**
      * Update execProps
      * This method is user independent, based on environment and execType and must be executed before loadConfigFile() runs in order to update execProps
      *
      * @param {*} cli_args Must run with _xEnvConfig() to parse args
      */
     public executeLoader(cli_args: XENV_CLI_ARGS): void {
         if (this.execProps) return
         if (isFalsy(cli_args)) {
             onerror('[XEnv]','cli args are not set')
             process.exit(0)        
         }
         else this.execProps = cli_args
     }
 
     /**
      * @param {*} envName Choose which environment to look out for, if not set will be selected based selected name.env setting
      */
     public buildEnv(envName?: ENVIRONMENT): boolean {
         if (!this.checkEnvFileConsistency()) {
             if (this.debug) onerror('[XEnv]', 'Failed consistency check!')
             return false
         }
         const envNameConfirmed = this.setNewEnvConfig(envName as any)
         if (envNameConfirmed) {
             return this.makeENVFile(envNameConfirmed)
         } else {
             if (this.debug) onerror('[XEnv]', 'Environment name not set')
             return false
         }
     }
    
     /**
      * grab cli process.args
      * loads initial environment so we can compare with process.env.ENVIRONMENT
      */
     loadConfigFile(execType?: ExecType): void {
         // execProps are loaded by execLoader() method
         const execProps = this.execProps as XENV_CLI_ARGS & { path: string }
         const execOptions = this.execProps ? executeTypeOptions(execType) : []
 
         const forSwitch = (type: ExecType): boolean => {
             let execSet = false
             switch (type) {
                 case 'CLI': {
                     if (!dotEnvConfig(execProps.path, this.debug)) {
                         execSet = false
                         if (this.debug) onerror('[XEnv]', `no path set for exec type CLI`)
                     } else execSet = true
 
                     break
                 }
                 case 'ROBUST': {
                     if (!dotEnvConfig(execProps.path, this.debug)) {
                         execSet = false
                         if (this.debug) onerror('[XEnv]', `no path set for exec type ROBUST`)
                     } else execSet = true
                     break
                 }
                 default:
                     onerror('[XEnv]', `No execute type matched: ${type}`)
             }
 
             return execSet
         }
 
         let settings_loaded = false
         for (let inx = 0; inx < execOptions.length; inx++) {
             if (forSwitch(execOptions[inx])) {
                 settings_loaded = true
                 break
             }
         }
 
         if (!settings_loaded) {
            onerror('[XEnv]', `No Setting loaded to exec type`)
             process.exit(0)

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
                 if (matchEnv(data.ENVIRONMENT) === this.ENVIRONMENT) return data
                 else return undefined
             } else return data
         }
 
         return [this.envFile['test.env'] ? env('test.env') : null, this.envFile['dev.env'] ? env('dev.env') : null, this.envFile['prod.env'] ? env('prod.env') : null].filter(
             (v) => !!v
         ) as XENV[]
     }
 
     /**
      * Set dotenv config based on .env.ENVIRONMENT settings in package.json for your desired environment to perform our new .env builds
      * @param {*} envName Build choice name, does not reflect name per your .env file
      */
     setNewEnvConfig(envName?: ENVIRONMENT): ENVIRONMENT {
         /**
          * - Check if dev.env and prod.env exist in {envDir}
          * - Check consistency, each file should include same property names
          * - Check to see if {name}.env for each available file has {ENVIRONMENT} set, and compares with (process.env.ENVIRONMENT || process.env.NODE_ENV)
          * - Finally re-process process.env config base on {.env.ENVIRONMENT} file selection
          */
 
         envName = matchEnv(envName as any)
 
         let configSetFor: any
         if (!this.checkEnvPass) {
             configSetFor = ''
             if (this.debug) onerror('[XEnv]', 'checkEnvPass===false, did you call method: checkEnvFileConsistency() ?')
             return undefined as any
         }
 
         if (!this.ENVIRONMENT) {
             if (this.debug) onerror('[XEnv]', 'ENVIRONMENT is not set ?')
             return undefined as any
         }
 
         // base on selected environment perform dotenv.config() update
         this.environments(true)
 
             .filter((env) => (envName && env ? envName === env.ENVIRONMENT : !!env))
             .forEach((env) => {
                 if (!env) return
                 if (configSetFor) return
 
                 const mEnv = matchEnv(env.ENVIRONMENT)
 
                 if (mEnv === this.ENVIRONMENT) {
                     const fileName =
                         // @ts-ignore
                         mEnv === 'TEST' ? 'test.env' : mEnv === 'DEVELOPMENT' ? 'dev.env' : mEnv === 'PRODUCTION' ? 'prod.env' : undefined
                     if (fileName) {
                         // run dotenv config
                         dotEnvConfig(join(this.config.envDir, `./${fileName}`), this.debug)
 
                         // NOTE
                         // Update NODE_ENV common variable,
                         // we can use either: process.env.ENVIRONMENT or process.env.NODE_ENV
                         process.env.NODE_ENV = env.ENVIRONMENT
                         // -- end
 
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
     makeENVFile(envName: ENVIRONMENT): boolean {
         let sourcePath, destPath
         // check if user provided path only to the root dir or included .env in the path
         const baseRootEnv = this.config.baseRootEnv.indexOf('.env') === -1 ? join(this.config.baseRootEnv, '.env') : this.config.baseRootEnv
 
         const rootEnvFilePath = baseRootEnv
         destPath = rootEnvFilePath
         envName = matchEnv(envName)
 
         if (envName === 'TEST' && this.envFile['test.env']) sourcePath = this.envFile['test.env']
         if (envName === 'DEVELOPMENT' && this.envFile['dev.env']) sourcePath = this.envFile['dev.env']
         if (envName === 'PRODUCTION' && this.envFile['prod.env']) sourcePath = this.envFile['prod.env']
 
         if (!sourcePath) {
             onerror('[XEnv]', `Wrong envName: ${envName}`)
             process.exit(0)
         }
 
         try {
             // copy new file at root
             copyFileSync(sourcePath, destPath)
 
             const selectedEnv = this.environments(true)[0]
             let prependMsg: string = selectedEnv.type ? 'from file: ' + selectedEnv.type : ''
 
             // not needed cleanup
             delete selectedEnv.type
             // NOTE it is not desired to add {NODE_ENV} to your .env file
             delete (selectedEnv as any).NODE_ENV
             // --------
 
             // once copied, we parse the file data
             const data = variableExpansion({ parsed: selectedEnv as any })
             if (data.parsed) {
                 // convert parsed data back to .env format
                 const envData = makeEnvFormat(data.parsed, prependMsg)
                 if (envData) writeFileSync(baseRootEnv, envData, { encoding: 'utf8' })
                 if (this.debug) log('[XEnv]', `{${envName}} environment set`)
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
             this.checkEnvPass = false
             const envList = this.environments()
 
 
             // must have {ENVIRONMENT} VARIABLE and {type}
             const validFileConditions = envList.filter(n=>{
                 let types:EnvFileType[] = ['dev.env','prod.env','test.env'] 
                 return n.ENVIRONMENT && includes(n.type,types)
             })
             const mustHaveEnvironment = validFileConditions.length ? validFileConditions.length=== 3 && this.config.envFileTypes.includes('test.env'): validFileConditions.length===2
 
             if(!mustHaveEnvironment){
                 if (this.debug) onerror('[XEnv]', 'one of your {name}.env files is missing or {ENVIRONMENT} prop is not set')
                 return false
             }
             
             if(!envFilePropConsistency(envList)){
                 if (this.debug) onerror('[XEnv]', 'File props consistency invalid')
                 return false
             }
 
 
             if(!this.envFile['test.env'] && this.config.envFileTypes.includes('test.env') ){
                 if (this.debug) onerror('[XEnv]', 'test.env file missing, but set as an option')
                 return false
             }
 
               // NOTE  if ok we are safe to call methods: set_xEnvConfig() > makeENVFile()
             this.checkEnvPass = true
 
             return true
         } catch (err: any) {
             onerror('[XEnv]', err.toString())
         }
         return false
     }
 }
 
 export { XEnv }
 export { readENV,_xEnvConfig }
 