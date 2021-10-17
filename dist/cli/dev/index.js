import { CLI_PRE_PROCESS, CLI_SCRIPT } from '../index';
export default (function () {
    const args = CLI_PRE_PROCESS();
    CLI_SCRIPT(args, 'DEV');
    return undefined;
})();
