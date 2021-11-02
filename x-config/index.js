/**
 * @param {string} path 
 * @returns {any} module.require output or undefined
 * @notes providing custom require resolves error messages from angular compilation, example: `index.d.ts is missing from the TypeScript compilation. Please make sure it is in your tsconfig via the 'files' `
 */
module.exports = function modRequire(path = './xenv.config.js') {

    const Mod = function () { }
    Mod.prototype = Object.create(module.constructor.prototype)
    Mod.prototype.constructor = module.constructor
    Mod.prototype.require = function (_path) {
        const self = this
        try {
            // @ts-ignore
            return self.constructor._load(_path, self)
        } catch (err) {

            if (err.code === 'MODULE_NOT_FOUND') {
                throw err.stack
            }
        }
    }

    /* istanbul ignore next */
    if (!(Mod.prototype instanceof module.constructor)) return undefined

    // @ts-ignore
    else return Mod.prototype.require(path)
}