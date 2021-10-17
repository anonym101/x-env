export const regExp_path = /^xenv_config_(path)=(.+)$/;
export const regExp_dir = /^xenv_config_(dir)=(.+)$/;
export const ENV_NAME_CONVENTIONS = {
    'DEVELOPMENT': ['DEV', 'dev', 'develop', 'DEVELOP', 'DEVELOPMENT', 'development'],
    'PRODUCTION': ['PROD', 'prod', 'PRODUCTION', 'production'],
    'TEST': ['TEST', 'test', 'TESTING', 'testing']
};
