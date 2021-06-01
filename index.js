function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { peerSocket } from "messaging";

var Settings = /*#__PURE__*/function () {
  function Settings(defaultSettings, filePath) {
    _classCallCheck(this, Settings);

    _defineProperty(this, "initial", {});

    _defineProperty(this, "state", {});

    _defineProperty(this, "filePath", 'settings.cbor');

    _defineProperty(this, "listener", null);

    _defineProperty(this, "propCallbacks", []);

    this.initial = defaultSettings;
    this.state = defaultSettings;
    this.filePath = filePath || this.filePath; // Pre-Existing Users

    if (existsSync(this.filePath)) {
      var stored = readFileSync(this.filePath, 'cbor');
      this.migrate(stored, this.initial);
    }

    this.save();
  }

  _createClass(Settings, [{
    key: "save",
    value: function save() {
      writeFileSync(this.filePath, this.state, 'cbor');
      return this;
    }
  }, {
    key: "update",
    value: function update(prop, value) {
      this.state[prop] = value;
      return this;
    } // Currently we are keeping existing settings and only support 1 depth
    // but we may want a means to purge unused settings

  }, {
    key: "migrate",
    value: function migrate(storedSettings, newSettings) {
      var migratedSettings = _extends({}, newSettings, storedSettings);

      this.state = migratedSettings;
    }
  }, {
    key: "reset",
    value: function reset() {
      this.state = this.initial;
      return this;
    }
  }, {
    key: "getProp",
    value: function getProp(prop) {
      return this.state[prop];
    }
  }, {
    key: "listen",
    value: function listen() {
      var _this = this;

      console.info('Fitbit-Settings: Listening for setting changes and update settings state and disk');
      this.listener = peerSocket.addEventListener('message', function (event) {
        // Assume all FS_SETTING prefix events are from this module
        // FS_SETTING_UPDATE:PROP_NAME
        if (event.data.prop && event.data.prop.indexOf('FS_SETTING_UPDATE:') !== -1) {
          var prop = event.data.prop.split(':')[1];
          var noChange = _this.getProp(prop) === event.data.value;
          if (noChange) return;

          _this.update(prop, event.data.value);

          if (_this.propCallbacks[prop]) {
            _this.propCallbacks[prop]();
          }

          _this.save();
        }
      });
      return this;
    }
  }, {
    key: "onPropChange",
    value: function onPropChange(prop, callback) {
      this.propCallbacks[prop] = callback;
      return this;
    }
  }]);

  return Settings;
}();

export { Settings as default };
;