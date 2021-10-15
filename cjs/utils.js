"use strict";

exports.__esModule = true;
exports.readENV = exports.makeEnvFormat = void 0;

var _readEnvFile = require("read-env-file");

var readENV = function readENV(envRootFilePath, debug) {
  if (debug === void 0) {
    debug = false;
  }

  if (!envRootFilePath) {
    return undefined;
  }

  try {
    return _readEnvFile.readSingle.sync(envRootFilePath);
  } catch (err) {
    if (debug) console.error(err.toString());
  }

  return undefined;
};

exports.readENV = readENV;

var makeEnvFormat = function makeEnvFormat(parsed) {
  if (!parsed) return undefined;

  if (parsed) {
    var envData = Object.entries(parsed || {}).reduce(function (n, _ref) {
      var k = _ref[0],
          val = _ref[1];

      if (parsed[k] !== undefined) {
        n = n ? n + (k + "=" + val.toString() + "\n") : k + "=" + val.toString() + "\n";
      }

      return n;
    }, '');
    if (!envData) return undefined;else return envData;
  }
};

exports.makeEnvFormat = makeEnvFormat;