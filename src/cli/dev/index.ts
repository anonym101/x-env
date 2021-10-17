/**
 * /$  node -r /DEV xenv_dir=/path/to/dir xenv_debug=1
 * 
 * RUN XENV SCRIPT IN DEVELOPMENT ENVIRONMENT */

import { CLI_PRE_PROCESS, CLI_SCRIPT } from '../index'
export default (function (): void {
    const args = CLI_PRE_PROCESS()
    CLI_SCRIPT(args, 'DEV')
    return undefined
})()
