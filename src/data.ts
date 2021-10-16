import { IENV_NAME_CONVENTIONS } from "@interface";


/**  Developers like to use their own NODE_ENV names, here is the list of most common */
export const ENV_NAME_CONVENTIONS:IENV_NAME_CONVENTIONS={
    'DEVELOPMENT':['DEV','dev','develop','DEVELOP','DEVELOPMENT','development'],
    'PRODUCTION':['PROD','prod','PRODUCTION','production'],
    'TEST':['TEST','test','TESTING','testing']
}
