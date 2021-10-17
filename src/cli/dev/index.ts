/**
 * /$  node -r /DEV XENV_DIR=/path/to/dir 
 * 
 * RUN XENV SCRIPT IN DEVELOPMENT ENFIRONMENT */

import { CLI_PRE_PROCESS, CLI_SCRIPT } from '../index'
export default (function (): void {
    const args = CLI_PRE_PROCESS()
    CLI_SCRIPT(args, 'DEV')
    return undefined
})()
