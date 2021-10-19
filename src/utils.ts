import { ENV, ENVIRONMENT } from '@interface'
import { config as _dotEnvConfig } from 'dotenv'
import variableExpansion from 'dotenv-expand'

/**
 * Return parsed environment {name.env} based on process.env.NODE_ENV
 * @param {*} auto decide which file to load based on process.env.NODE_ENV
 * NODE_ENV available values: DEVELOPMENT, PRODUCTION, TEST
 */
export const parsedEnvConfig = (auto: boolean = true, pth?: string): ENV => {
    if (!auto && !pth) throw 'When auto not set must provide path'

    const NODE_ENV: ENVIRONMENT = process.env.NODE_ENV as any
    let envPath = pth
    if (auto) {
        if (!NODE_ENV) throw 'NODE_ENV NOT SET'
        if (NODE_ENV === 'DEVELOPMENT') envPath = `./dev.env`
        if (NODE_ENV === 'PRODUCTION') envPath = `./prod.env`
        if (NODE_ENV === 'TEST') envPath = `./test.env`
    }

    try {
        const parsed = _dotEnvConfig({ path: envPath })
        const d = variableExpansion(parsed)
        if (d.error) throw d.error
        else return d.parsed as any
    } catch (err: any) {
        console.log('[parsedEnvConfig]', err.toString())
    }
    return undefined as any
}
