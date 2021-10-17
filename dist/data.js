export const default_xenv_dir_name = `XENV`;
export const regExp_path = /^xenv_(path)=(.+)$/;
export const regExp_dir = /^xenv_(dir)=(.+)$/;
export const regExp = /^xenv_(dir|path|debug)=(.+)$/;
export const ENV_NAME_CONVENTIONS = {
    DEVELOPMENT: ['DEV', 'dev', 'develop', 'DEVELOP', 'DEVELOPMENT', 'development'],
    PRODUCTION: ['PROD', 'prod', 'PRODUCTION', 'production'],
    TEST: ['TEST', 'test', 'TESTING', 'testing'],
};
