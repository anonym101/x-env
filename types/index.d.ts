declare namespace xenv {

    export type ENVIRONMENT = 'TEST' | 'DEVELOPMENT' | 'PRODUCTION'
    export type ENV  = {[prop: string]: string}
    export type NAME_CONVENTIONS = {[name:string]:Array<string> }
    export type _configParse = function(auto?:boolean, pth?:string,loadConfigFile?:boolean):ENV
    /**
        * Return parsed ENVIRONMENT {name.env} based on process.env.NODE_ENV
        * - NODE_ENV available values matching ENV_NAME_CONVENTIONS[]
        * @param {*} auto Decide which file to load based on process.env.NODE_ENV
        * @param {*} pth Optionally provide relative path to your {name}.env 
        * @param {boolean} loadConfigFile to load xenv.config.js file from application root if available
        * 
    */
    export function configParse(auto?:boolean, pth?:string,loadConfigFile?:boolean):ENV
}
export as namespace xenv
export {xenv} 


