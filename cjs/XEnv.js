"use strict";

exports.__esModule = true;
exports.XEnv = void 0;

var _fs = require("fs");

var _path = require("path");

var _dotenv = require("dotenv");

var _utils = require("./utils");

exports.readENV = _utils.readENV;

var _dotenvExpand = _interopRequireDefault(require("dotenv-expand"));

var _umd = require("x-utils-es/umd");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var XEnv = function () {
  function XEnv(config, debug) {
    if (debug === void 0) {
      debug = false;
    }

    this.checkEnvPass = false;
    this.debug = debug;
    if ((0, _umd.isFalsy)(config)) throw 'Config not provided';
    if (!config.envDir) throw 'Must provide {envDir} full path';
    if (!config.baseRootEnv) throw 'Must provide {baseRootEnv} full path';
    if (!config.envFileTypes.includes('dev.env') || !config.envFileTypes.includes('prod.env')) throw 'Must at least include: dev.env and prod.env';
    this.config = config;
  }

  var _proto = XEnv.prototype;

  _proto.buildEnv = function buildEnv(envName) {
    if (!this.checkEnvFileConsistency()) {
      if (this.debug) (0, _umd.onerror)('[XEnv]', 'Failed consistency check!');
      return false;
    }

    var envNameConfirmed = this.setNewEnvConfig(envName);
    if (envNameConfirmed) return this.copyRenameToLocation(envNameConfirmed);else return false;
  };

  _proto.environments = function environments(selected) {
    var _this = this;

    if (selected === void 0) {
      selected = false;
    }

    var env = function env(envFileName) {
      var filePath = (0, _path.join)(_this.config.envDir, "./" + envFileName);
      var data = (0, _utils.readENV)(filePath, false) || {};
      data = Object.assign(Object.assign({}, data), {
        type: envFileName
      });

      if (selected) {
        if (data.ENVIRONMENT === process.env.ENVIRONMENT) return data;
      } else return data;
    };

    return [this.envFile['test.env'] ? env('test.env') : null, this.envFile['dev.env'] ? env('dev.env') : null, this.envFile['prod.env'] ? env('prod.env') : null].filter(function (v) {
      return !!v;
    });
  };

  _proto.setNewEnvConfig = function setNewEnvConfig(envName) {
    var _this2 = this;

    var configSetFor;

    if (!this.checkEnvPass) {
      configSetFor = '';
      if (this.debug) (0, _umd.onerror)('[XEnv]', 'checkEnvPass===false, did you call method: checkEnvFileConsistency() ?');
      return undefined;
    }

    if (!process.env.ENVIRONMENT) {
      if (this.debug) (0, _umd.onerror)('[XEnv]', 'process.env.ENVIRONMENT is not set ?');
      return undefined;
    }

    var ENVIRONMENT = process.env.ENVIRONMENT;
    this.environments(true).filter(function (env) {
      return envName && env ? envName === env.ENVIRONMENT : !!env;
    }).forEach(function (env) {
      if (!env) return;
      if (configSetFor) return;
      var fileData = env.ENVIRONMENT;

      if (fileData === ENVIRONMENT) {
        var fileName = env.ENVIRONMENT === 'TEST' ? 'test.env' : env.ENVIRONMENT === 'DEVELOPMENT' ? 'dev.env' : env.ENVIRONMENT === 'PRODUCTION' ? 'prod.env' : undefined;

        if (fileName) {
          (0, _dotenv.config)({
            path: (0, _path.join)(_this2.config.envDir, "./" + fileName)
          });
          configSetFor = env.ENVIRONMENT;
        }
      }
    });
    return configSetFor;
  };

  _proto.copyRenameToLocation = function copyRenameToLocation(envName) {
    var sourcePath, destPath;
    var baseRootEnv = this.config.baseRootEnv.indexOf('.env') === -1 ? (0, _path.join)(this.config.baseRootEnv, '.env') : this.config.baseRootEnv;
    var rootEnvFilePath = baseRootEnv;
    destPath = rootEnvFilePath;
    if (envName === 'TEST' && this.envFile['test.env']) sourcePath = this.envFile['test.env'];
    if (envName === 'DEVELOPMENT' && this.envFile['dev.env']) sourcePath = this.envFile['dev.env'];
    if (envName === 'PRODUCTION' && this.envFile['prod.env']) sourcePath = this.envFile['prod.env'];

    if (!sourcePath) {
      if (this.debug) (0, _umd.onerror)('[XEnv]', "Wrong envName: " + envName);
      throw "Wrong envName:" + envName;
    }

    try {
      (0, _fs.copyFileSync)(sourcePath, destPath);
      var data = (0, _dotenvExpand.default)({
        parsed: (0, _dotenv.parse)((0, _fs.readFileSync)(baseRootEnv))
      });

      if (data.parsed) {
        var envData = (0, _utils.makeEnvFormat)(data.parsed);
        if (envData) (0, _fs.writeFileSync)(baseRootEnv, envData);
        if (envName === 'TEST') (0, _umd.log)('TEST environment set');
        if (envName === 'DEVELOPMENT') (0, _umd.log)('DEVELOPMENT environment set');
        if (envName === 'PRODUCTION') (0, _umd.log)('PRODUCTION environment set');
      } else {
        throw data.error;
      }

      return true;
    } catch (err) {
      (0, _umd.onerror)('[XEnv]', err.toString());
    }

    throw "File not found, or wrong envName: " + envName;
  };

  _proto.checkEnvFileConsistency = function checkEnvFileConsistency() {
    try {
      var envList = this.environments();
      this.checkEnvPass = false;
      var testFileKeys = this.envFile['test.env'] ? Object.keys(envList.filter(function (n) {
        return n.type === 'test.env';
      })[0] || {}) : [];
      var devFileKeys = Object.keys(envList.filter(function (n) {
        return n.type === 'dev.env';
      })[0] || {});
      var prodFileKeys = Object.keys(envList.filter(function (n) {
        return n.type === 'prod.env';
      })[0] || {});

      if (!devFileKeys.length) {
        if (this.debug) (0, _umd.onerror)('[XEnv]', 'dev.env not set or not provided');
        return false;
      }

      if (!prodFileKeys.length) {
        if (this.debug) (0, _umd.onerror)('[XEnv]', 'prod.env not set or not provided');
        return false;
      }

      if (this.envFile['test.env'] && !testFileKeys.length) {
        if (this.debug) (0, _umd.onerror)('[XEnv]', 'test.env not set or not provided');
        return false;
      }

      var lenOk = devFileKeys.filter(function (x) {
        return prodFileKeys.filter(function (y) {
          return x === y;
        }).length;
      }).length === devFileKeys.length;

      if (this.envFile['test.env']) {
        if (testFileKeys.length !== devFileKeys.length) {
          if (this.debug) (0, _umd.onerror)('[XEnv]', 'test.env is not consistent with the other .env files');
          lenOk = false;
        }
      }

      var mustHaveENVIRONMENT = devFileKeys.filter(function (v) {
        return v === 'ENVIRONMENT';
      }).length === 1;

      if (!mustHaveENVIRONMENT) {
        if (this.debug) (0, _umd.onerror)('[XEnv]', 'All .env files should include {ENVIRONMENT} property');
        return false;
      }

      if (lenOk) this.checkEnvPass = true;
      return lenOk;
    } catch (err) {
      (0, _umd.onerror)('[XEnv]', err.toString());
    }

    return false;
  };

  _createClass(XEnv, [{
    key: "envFile",
    get: function get() {
      var _ref, _ref2, _ref3;

      return Object.assign(Object.assign(Object.assign({}, this.config.envFileTypes.includes('test.env') ? (_ref = {}, _ref['test.env'] = (0, _path.join)(this.config.envDir, "./test.env"), _ref) : {}), this.config.envFileTypes.includes('dev.env') ? (_ref2 = {}, _ref2['dev.env'] = (0, _path.join)(this.config.envDir, "./dev.env"), _ref2) : {}), this.config.envFileTypes.includes('prod.env') ? (_ref3 = {}, _ref3['prod.env'] = (0, _path.join)(this.config.envDir, "./prod.env"), _ref3) : {});
    }
  }]);

  return XEnv;
}();

exports.XEnv = XEnv;