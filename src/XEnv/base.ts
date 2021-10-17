import { matchEnv, pathToBaseRootEnv } from './../utils'
import { EnvFile, ENVIRONMENT, ExecType, XCONFIG, XENV_CLI_ARGS } from '@interface'
import { includes, isFalsy, onerror } from 'x-utils-es/umd'
import { join } from 'path'

export abstract class XEnvBase {
    /** optional prop, values assigned depending on  {ExecType}*/
    execProps: XENV_CLI_ARGS = undefined as any
    checkEnvPass = false
    config: XCONFIG & { baseRootEnv: string }
    debug: boolean
    _defaultExecType: ExecType = 'ROBUST'
    /**
     * Build env file based on package.json, and process.argv configurations
     * @param {boolean} debug Display useful messages, errors always show
     */
    constructor(config: XCONFIG, debug: boolean = false) {
        this.debug = debug

        if (isFalsy(config)) {
            onerror('[XEnv]', 'Config not provided')
            process.exit(0)
        }
        
        if (!config.envDir) {
            onerror('[XEnv]', 'Must provide valid {envDir} path')
            process.exit(0)
        }

        if (!config.baseRootEnv) config.baseRootEnv = pathToBaseRootEnv()

        if (!config.envFileTypes.includes('dev.env') || !config.envFileTypes.includes('prod.env')) {
            onerror('[XEnv]', 'Must at least include: dev.env and prod.env')
            process.exit(0)
        }

        this.config = config as any
        if (!this.config.execType) this.config.execType = this._defaultExecType

        // Check execType is of valid name
        const types = ['CLI', 'ROBUST', 'DEFAULT'] as ExecType[]
        if (!includes(this.config.execType, types)) {
            onerror('[XEnv]', `Invalid execType: ${this.config.execType}`)
            process.exit(0)
        }
    }

    /**
     *Check for either process.env.ENVIRONMENT or process.env.NODE_ENV
     *
     */
    get ENVIRONMENT(): ENVIRONMENT {
        return matchEnv((process.env.ENVIRONMENT || process.env.NODE_ENV) as string) as ENVIRONMENT
    }
    /**
     * Access env file, full path
     */
    get envFile(): EnvFile {
        return {
            ...(this.config.envFileTypes.includes('test.env') ? { ['test.env']: join(this.config.envDir, `./test.env`) } : {}),
            ...(this.config.envFileTypes.includes('dev.env') ? { ['dev.env']: join(this.config.envDir, `./dev.env`) } : {}),
            ...(this.config.envFileTypes.includes('prod.env') ? { ['prod.env']: join(this.config.envDir, `./prod.env`) } : {}),
        }
    }

    /** Check if provided {ENVIRONMENT} name matches our available standards, as per {ENV_NAME_CONVENTIONS} */
    validateEnvName(): boolean {
        if (!this.ENVIRONMENT) {
            // if(this.debug) onerror('[XEnv]','process.env.ENVIRONMENT not set in your {name}.env, or part of valid name conventions')
            return false
        } else return true
    }
}
