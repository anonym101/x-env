/**
 * /$  node -r /TEST xenv_dir=/path/to/dir xenv_debug=1
 * 
 * RUN XENV SCRIPT IN PRODUCTION ENVIRONMENT */

import { CLI_PRE_PROCESS, CLI_SCRIPT } from '../index'
export default (function (): void {
    const args = CLI_PRE_PROCESS()
    CLI_SCRIPT(args, 'TEST')
    return undefined
})()
