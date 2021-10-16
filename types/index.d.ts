// TypeScript Version: 3.0
/// <reference types="node" />

/** Proposed environment name settings */
export type ENVIRONMENT = 'TEST' | 'DEVELOPMENT' | 'PRODUCTION'


export interface IENV_NAME_CONVENTIONS {
    DEVELOPMENT: Array<string>
    PRODUCTION: Array<string>
    TEST: Array<string>
}

/** Each xx.env file can contain any of these props */
export interface ENV {
    [prop: string]: number | string | boolean | null | undefined
    ENVIRONMENT: string
}

export interface XENV_CLI_ARGS {
    [prop: string]: string | any;
    path?:string
}


/** XEnv class internal type */
export interface XENV {
    ENVIRONMENT: ENVIRONMENT
    IP?: string
    PORT?: string | number
    HOST?: string
    /** To recognize to file name assignment, which env we are using, not carried to over */
    type?: EnvFileType
}

/** Valid env file naming conventions */
export type EnvFileType = 'test.env' | 'dev.env' | 'prod.env'

export interface EnvFile {
    'test.env'?: string
    'dev.env'?: string
    'prod.env'?: string
}

export type ExecType = 
                    'ROBUST'  // executing script with options, and using {dotenv_config_path} in node cli command
                    | 'CLI' // executing DEV/PROD/TEST from dir without {dotenv_config_path} cli command
                    |'DEFAULT'; // to decide

export interface XCONFIG {
    /** Full path location of .env file to which current environment is copied to, usually at base of your application: ./.env
     * @optional When not supplied will try to find root .env file for you
     */
    baseRootEnv?: string

    /** Dir location of files
     * @required
     */
    envDir: string

    /** Environment types we will be dealing with on the project, current support for: test.env, dev.env, prod.env
     * @required
     */
    envFileTypes: EnvFileType[]
    /** Available execution types: ROBUST,CLI,DEFAULT */
    execType?: ExecType
}

/**
 * Project (.env) manager for `DEVELOPMENT`, `PRODUCTION` and  `TEST` environments, used to assign `.env` file values to your `process.env*/
export class XEnv {

    config: XCONFIG & { baseRootEnv?: string }
    debug: boolean
    constructor(config: XCONFIG & { baseRootEnv?: string }, debug?: boolean)
    /**
     * @param {*} envName Choose which environment to look out for, if not set will be selected based selected name.env setting
     */
    buildEnv(envName?: ENVIRONMENT): boolean
 
}

/** Unhidden available methods, visible to cjs and esm module*/
export class XEnvExclusive {
    execProps: XENV_CLI_ARGS
    config: XCONFIG & { baseRootEnv: string }
    _defaultExecType: ExecType
    checkEnvPass: boolean
    debug: boolean
    constructor(config: XCONFIG & { baseRootEnv?: string }, debug?: boolean)
    /**
     * @param {*} envName Choose which environment to look out for, if not set will be selected based selected name.env setting
     */
    buildEnv(envName?: ENVIRONMENT): boolean
    executeLoader(cli_args:XENV_CLI_ARGS):void
    envFile: EnvFile
    ENVIRONMENT: ENVIRONMENT
    environments(selected?: boolean):  XENV[]
    setNewEnvConfig(envName?: ENVIRONMENT): ENVIRONMENT
    copyRenameToLocation(envName: ENVIRONMENT): boolean
    checkEnvFileConsistency(): boolean
    loadConfigFile(execType?: ExecType):void
   
}



/**
 * Read current .env file as an object, already parsed
 * @param {string} envRootFilePath provide full url to the current environment
 */
export function readENV<T extends ENV>(envRootFilePath?: string, debug?: boolean): T
