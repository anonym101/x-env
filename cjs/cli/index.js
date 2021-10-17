"use strict";exports.__esModule=!0,exports.CLI_SCRIPT=exports.CLI_PRE_PROCESS=void 0;var _data=require("../data"),_umd=require("x-utils-es/umd"),_utils=require("../utils"),_XEnv=require("../XEnv"),_path=require("path"),_fs=require("fs"),CLI_PRE_PROCESS=function CLI_PRE_PROCESS(){var CLI={DEBUG:!1,XENV_DIR:"",_XENV_DIR:""},root=process.cwd(),argv=(0,_utils.processArgs)(process.argv,_data.regExp);if(CLI.DEBUG=function parseJson(debug){try{return JSON.parse(debug||"")||!1}catch(err){}return!1}(argv.debug),CLI.XENV_DIR=(0,_utils.projectRoot)(argv.dir),CLI.XENV_DIR){CLI._XENV_DIR=(0,_path.join)(root,CLI.XENV_DIR);try{(0,_fs.readdirSync)(CLI._XENV_DIR),CLI.XENV_DIR=CLI._XENV_DIR}catch(err){CLI.XENV_DIR=""}}else{CLI._XENV_DIR=(0,_path.join)(root,"./"+_data.default_xenv_dir_name);try{(0,_fs.readdirSync)(CLI._XENV_DIR),CLI.XENV_DIR=CLI._XENV_DIR}catch(err){CLI.XENV_DIR="",(0,_umd.onerror)("[XEnv]","No "+_data.default_xenv_dir_name+" dir at root/ of your project"),process.exit(0)}}return CLI};exports.CLI_PRE_PROCESS=CLI_PRE_PROCESS;var CLI_SCRIPT=function CLI_SCRIPT(ARGS,execForEnvironment){var options={execType:"CLI",envDir:ARGS.XENV_DIR,envFileTypes:["dev.env","prod.env","test.env"]},xEnv=new _XEnv.XEnv(options,!0);if("DEV"===execForEnvironment&&xEnv.executeLoader({path:(0,_path.join)(ARGS.XENV_DIR,"./dev.env")}),"PROD"===execForEnvironment&&xEnv.executeLoader({path:(0,_path.join)(ARGS.XENV_DIR,"./prod.env")}),"TEST"===execForEnvironment&&xEnv.executeLoader({path:(0,_path.join)(ARGS.XENV_DIR,"./test.env")}),!xEnv.buildEnv())throw"environment build failed";ARGS.DEBUG&&((0,_umd.log)((0,_XEnv.readENV)()),(0,_umd.log)("true === ",process.env.ENVIRONMENT===(0,_XEnv.readENV)().ENVIRONMENT&&(0,_XEnv.readENV)().ENVIRONMENT===process.env.NODE_ENV))};exports.CLI_SCRIPT=CLI_SCRIPT;