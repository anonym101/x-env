"use strict";exports.__esModule=!0,exports.XEnv=void 0;var _fs=require("fs"),_path=require("path"),_dotenv=require("dotenv"),_utils=require("./utils");exports.readENV=_utils.readENV;var _dotenvExpand=_interopRequireDefault(require("dotenv-expand")),_umd=require("x-utils-es/umd");function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}function _defineProperties(target,props){for(var descriptor,i=0;i<props.length;i++)descriptor=props[i],descriptor.enumerable=descriptor.enumerable||!1,descriptor.configurable=!0,"value"in descriptor&&(descriptor.writable=!0),Object.defineProperty(target,descriptor.key,descriptor)}function _createClass(Constructor,protoProps,staticProps){return protoProps&&_defineProperties(Constructor.prototype,protoProps),staticProps&&_defineProperties(Constructor,staticProps),Constructor}var XEnv=function(){function XEnv(config,debug){if(void 0===debug&&(debug=!1),this.checkEnvPass=!1,this.debug=debug,(0,_umd.isFalsy)(config))throw"Config not provided";if(!config.envDir)throw"Must provide {envDir} full path";if(!config.baseRootEnv)throw"Must provide {baseRootEnv} full path";if(!config.envFileTypes.includes("dev.env")||!config.envFileTypes.includes("prod.env"))throw"Must at least include: dev.env and prod.env";this.config=config}var _proto=XEnv.prototype;return _proto.buildEnv=function buildEnv(envName){if(!this.checkEnvFileConsistency())return this.debug&&(0,_umd.onerror)("[XEnv]","Failed consistency check!"),!1;var envNameConfirmed=this.setNewEnvConfig(envName);return!!envNameConfirmed&&this.copyRenameToLocation(envNameConfirmed)},_proto.environments=function environments(selected){var _this=this;void 0===selected&&(selected=!1);var env=function env(envFileName){var filePath=(0,_path.join)(_this.config.envDir,"./"+envFileName),data=(0,_utils.readENV)(filePath,!1)||{};return(data=Object.assign(Object.assign({},data),{type:envFileName}),!selected)?data:data.ENVIRONMENT===process.env.ENVIRONMENT?data:void 0};return[this.envFile["test.env"]?env("test.env"):null,this.envFile["dev.env"]?env("dev.env"):null,this.envFile["prod.env"]?env("prod.env"):null].filter(function(v){return!!v})},_proto.setNewEnvConfig=function setNewEnvConfig(envName){var configSetFor,_this2=this;if(!this.checkEnvPass)return configSetFor="",void(this.debug&&(0,_umd.onerror)("[XEnv]","checkEnvPass===false, did you call method: checkEnvFileConsistency() ?"));if(!process.env.ENVIRONMENT)return void(this.debug&&(0,_umd.onerror)("[XEnv]","process.env.ENVIRONMENT is not set ?"));var ENVIRONMENT=process.env.ENVIRONMENT;return this.environments(!0).filter(function(env){return envName&&env?envName===env.ENVIRONMENT:!!env}).forEach(function(env){if(env&&!configSetFor){var fileData=env.ENVIRONMENT;if(fileData===ENVIRONMENT){var fileName="TEST"===env.ENVIRONMENT?"test.env":"DEVELOPMENT"===env.ENVIRONMENT?"dev.env":"PRODUCTION"===env.ENVIRONMENT?"prod.env":void 0;fileName&&((0,_dotenv.config)({path:(0,_path.join)(_this2.config.envDir,"./"+fileName)}),configSetFor=env.ENVIRONMENT)}}}),configSetFor},_proto.copyRenameToLocation=function copyRenameToLocation(envName){var sourcePath,destPath,baseRootEnv=-1===this.config.baseRootEnv.indexOf(".env")?(0,_path.join)(this.config.baseRootEnv,".env"):this.config.baseRootEnv;if(destPath=baseRootEnv,"TEST"===envName&&this.envFile["test.env"]&&(sourcePath=this.envFile["test.env"]),"DEVELOPMENT"===envName&&this.envFile["dev.env"]&&(sourcePath=this.envFile["dev.env"]),"PRODUCTION"===envName&&this.envFile["prod.env"]&&(sourcePath=this.envFile["prod.env"]),!sourcePath)throw this.debug&&(0,_umd.onerror)("[XEnv]","Wrong envName: "+envName),"Wrong envName:"+envName;try{(0,_fs.copyFileSync)(sourcePath,destPath);var selectedEnv=this.environments(!0)[0],data=(0,_dotenvExpand["default"])({parsed:selectedEnv});if(data.parsed){var envData=(0,_utils.makeEnvFormat)(data.parsed);envData&&(0,_fs.writeFileSync)(baseRootEnv,envData),"TEST"===envName&&(0,_umd.log)("TEST environment set"),"DEVELOPMENT"===envName&&(0,_umd.log)("DEVELOPMENT environment set"),"PRODUCTION"===envName&&(0,_umd.log)("PRODUCTION environment set")}else throw data.error;return!0}catch(err){(0,_umd.onerror)("[XEnv]",err.toString())}throw"File not found, or wrong envName: "+envName},_proto.checkEnvFileConsistency=function checkEnvFileConsistency(){try{var envList=this.environments();this.checkEnvPass=!1;var testFileKeys=this.envFile["test.env"]?Object.keys(envList.filter(function(n){return"test.env"===n.type})[0]||{}):[],devFileKeys=Object.keys(envList.filter(function(n){return"dev.env"===n.type})[0]||{}),prodFileKeys=Object.keys(envList.filter(function(n){return"prod.env"===n.type})[0]||{});if(!devFileKeys.length)return this.debug&&(0,_umd.onerror)("[XEnv]","dev.env not set or not provided"),!1;if(!prodFileKeys.length)return this.debug&&(0,_umd.onerror)("[XEnv]","prod.env not set or not provided"),!1;if(this.envFile["test.env"]&&!testFileKeys.length)return this.debug&&(0,_umd.onerror)("[XEnv]","test.env not set or not provided"),!1;var lenOk=devFileKeys.filter(function(x){return prodFileKeys.filter(function(y){return x===y}).length}).length===devFileKeys.length;this.envFile["test.env"]&&testFileKeys.length!==devFileKeys.length&&(this.debug&&(0,_umd.onerror)("[XEnv]","test.env is not consistent with the other .env files"),lenOk=!1);var mustHaveENVIRONMENT=1===devFileKeys.filter(function(v){return"ENVIRONMENT"===v}).length;return mustHaveENVIRONMENT?(lenOk&&(this.checkEnvPass=!0),lenOk):(this.debug&&(0,_umd.onerror)("[XEnv]","All .env files should include {ENVIRONMENT} property"),!1)}catch(err){(0,_umd.onerror)("[XEnv]",err.toString())}return!1},_createClass(XEnv,[{key:"envFile",get:function get(){var _ref,_ref2,_ref3;return Object.assign(Object.assign(Object.assign({},this.config.envFileTypes.includes("test.env")?(_ref={},_ref["test.env"]=(0,_path.join)(this.config.envDir,"./test.env"),_ref):{}),this.config.envFileTypes.includes("dev.env")?(_ref2={},_ref2["dev.env"]=(0,_path.join)(this.config.envDir,"./dev.env"),_ref2):{}),this.config.envFileTypes.includes("prod.env")?(_ref3={},_ref3["prod.env"]=(0,_path.join)(this.config.envDir,"./prod.env"),_ref3):{})}}]),XEnv}();exports.XEnv=XEnv;