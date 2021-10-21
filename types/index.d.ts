declare namespace xenv {

    export type ENVIRONMENT = 'TEST' | 'DEVELOPMENT' | 'PRODUCTION'
    export type ENV  = {[prop: string]: string}
    export type NAME_CONVENTIONS = {[name:string]:Array<string> }
    
    /**
        * Return parsed ENVIRONMENT {name.env} based on process.env.NODE_ENV
        * - NODE_ENV available values matching ENV_NAME_CONVENTIONS[]
        * @param {*} auto decide which file to load based on process.env.NODE_ENV
        * @param {*} pth Optionally provide relative path to your {name}.env 
        * 
    */
    export function config(auto?:boolean, pth?:string):ENV
}
export as namespace xenv
export {xenv} 


