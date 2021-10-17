import { IENV_NAME_CONVENTIONS } from '@interface'
export const default_xenv_dir_name = `XENV`;
export const regExp_path = /^xenv_(path)=(.+)$/
export const regExp_dir = /^xenv_(dir)=(.+)$/

/** detect dir|path|path */
export const regExp = /^xenv_(dir|path|debug)=(.+)$/

/**  Developers like to use their own NODE_ENV names, here is the list of most common */
export const ENV_NAME_CONVENTIONS: IENV_NAME_CONVENTIONS = {
    DEVELOPMENT: ['DEV', 'dev', 'develop', 'DEVELOP', 'DEVELOPMENT', 'development'],
    PRODUCTION: ['PROD', 'prod', 'PRODUCTION', 'production'],
    TEST: ['TEST', 'test', 'TESTING', 'testing'],
}
