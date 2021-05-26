function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { readFileSync, writeFileSync, existsSync } from 'fs';

var Settings = function Settings(defaultSettings, filePath) {
  var _this = this;

  _classCallCheck(this, Settings);

  _defineProperty(this, "initial", {});

  _defineProperty(this, "state", {});

  _defineProperty(this, "filePath", 'settings.cbor');

  _defineProperty(this, "save", function () {
    writeFileSync(_this.filePath, _this.state, 'cbor');
    return _this;
  });

  _defineProperty(this, "update", function (prop, value) {
    _this.state[prop] = value;
    return _this;
  });

  _defineProperty(this, "migrate", function (storedSettings, newSettings) {
    var migratedSettings = Object.assign({}, newSettings, storedSettings);
    _this.state = migratedSettings;
  });

  _defineProperty(this, "reset", function () {
    _this.state = _this.initial;
    return _this;
  });

  _defineProperty(this, "getProp", function (prop) {
    return _this.state[prop];
  });

  this.initial = defaultSettings;
  this.state = defaultSettings;
  this.filePath = filePath || this.filePath; // Pre-Existing Users

  if (existsSync(this.filePath)) {
    var stored = readFileSync(this.filePath, 'cbor');
    this.migrate(stored, this.initial);
  }

  this.save();
};

export { Settings as default };
;