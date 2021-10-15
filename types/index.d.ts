


/** Each xx.env file can contain any of these props */
export interface ENV {
    [prop: string]: number | string | boolean | null | undefined;
    ENVIRONMENT: string;
}

export interface XENV {
    IP: string;
    PORT: string | number;
    ENVIRONMENT: 'DEVELOPMENT' | 'PRODUCTION';
    HOST: string;
    /** To recognise to file name assignment, which env we are using, not carried to over */
    type?: EnvFileType;
}

/** Valid env file naming conventions */
export type EnvFileType = 'test.env' | 'dev.env' | 'prod.env'


export interface EnvFile {
    'test.env'?: string;
    'dev.env'?: string;
    'prod.env'?: string;
}

export interface XCONFIG {

    /** Dir location of files */
    envDir: string;

    /** Environment types we will be dealing with on the project, current support for: test.env, dev.env, prod.env  */
    envFileTypes: EnvFileType[];

    /** Full path location of .env file to which current environment is copied to, usually at base of your application: ./.env */
    baseRootEnv: string
}

/** Proposed environment name settings */
export type ENVIRONMENT = 'TEST' | 'DEVELOPMENT' | 'PRODUCTION'


/** 
* Project (.env) manager for `DEVELOPMENT`, `PRODUCTION` and  `TEST` environments, used to assign `.env` file values to your `process.env*/
export class XEnv {
    checkEnvPass: boolean
    config: XCONFIG
    debug: boolean
    run(config: XCONFIG, debug: boolean): void;
      /**
     * @param {*} envName Choose which environment to look out for, if not set will be selected based selected name.env setting
     */
    buildEnv(envName: ENVIRONMENT): boolean;
    envFile: EnvFile;
    environments(selected: boolean): XENV[];
    setNewEnvConfig(envName: ENVIRONMENT): ENVIRONMENT;
    copyRenameToLocation(envName: ENVIRONMENT): boolean;
    checkEnvFileConsistency(): boolean
}

/**
* Read current .env file as an object, already parsed
* @param {string} envRootFilePath provide full url to the current environment
*/
export function readENV(envRootFilePath: string, debug:boolean):ENV 
