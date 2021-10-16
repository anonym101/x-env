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
}

/**
 * Project (.env) manager for `DEVELOPMENT`, `PRODUCTION` and  `TEST` environments, used to assign `.env` file values to your `process.env*/
export class XEnv {
    // checkEnvPass: boolean
    config: XCONFIG & { baseRootEnv?: string }
    debug: boolean
    constructor(config: XCONFIG & { baseRootEnv?: string }, debug?: boolean)
    /**
     * @param {*} envName Choose which environment to look out for, if not set will be selected based selected name.env setting
     */
    buildEnv<T extends boolean>(envName?: ENVIRONMENT): T
    // envFile: EnvFile
    // ENVIRONMENT: ENVIRONMENT
    // environments(selected?: boolean): XENV[]
    // setNewEnvConfig(envName?: ENVIRONMENT): ENVIRONMENT
    // copyRenameToLocation(envName: ENVIRONMENT): boolean
    // checkEnvFileConsistency(): boolean
    // loadConfigFile():void
}

/**
 * Read current .env file as an object, already parsed
 * @param {string} envRootFilePath provide full url to the current environment
 */
export function readENV<T extends ENV>(envRootFilePath?: string, debug?: boolean): T
