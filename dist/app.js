function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { peerSocket } from "messaging";

var Settings = /*#__PURE__*/function () {
  function Settings(defaultSettings) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$filePath = _ref.filePath,
        filePath = _ref$filePath === void 0 ? 'settings.cbor' : _ref$filePath,
        _ref$syncWithCompanio = _ref.syncWithCompanion,
        syncWithCompanion = _ref$syncWithCompanio === void 0 ? 'false' : _ref$syncWithCompanio;

    _classCallCheck(this, Settings);

    _defineProperty(this, "initial", {});

    _defineProperty(this, "state", {});

    _defineProperty(this, "filePath", '');

    _defineProperty(this, "syncWithCompanion", false);

    _defineProperty(this, "propCallbacks", []);

    this.initial = defaultSettings;
    this.state = defaultSettings;
    this.filePath = filePath;
    this.syncWithCompanion = syncWithCompanion; // Pre-Existing Users

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
      if (!this.state[prop]) {
        console.warn("fitbit-settings/app: Prop, ".concat(prop, ", not passed in default settings, this may result in stray props saved"));
      }

      if (this.state[props] === value) return;
      this.state[prop] = value;

      if (this.syncWithCompanion) {
        this.sendMessage(prop, value);
      }

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

      peerSocket.addEventListener('message', function (event) {
        // Assume all FS_SETTING prefix events are from this module
        // FS_SETTINGS_UPDATE:PROP_NAME
        if (event.data.prop && event.data.prop.indexOf('FS_SETTINGS_UPDATE:') !== -1) {
          var prop = event.data.prop.split(':')[1];
          var noChange = _this.getProp(prop) === event.data.value;
          if (noChange) return;

          _this.update(prop, event.data.value);

          if (_this.propCallbacks[prop]) {
            _this.propCallbacks[prop]({
              data: {
                prop: prop,
                value: event.data.value
              }
            });
          }

          _this.save();
        }
      }); // Notify companion of settings stored
      // only get what we need

      if (this.syncWithCompanion) {
        peerSocket.addEventListener('open', function () {
          peerSocket.send({
            key: 'FS_SETTINGS_SYNC:INIT',
            value: _this.state
          });
        });
      }

      return this;
    }
  }, {
    key: "onPropChange",
    value: function onPropChange(prop, callback) {
      this.propCallbacks[prop] = callback;
      return this;
    }
  }, {
    key: "sendMessage",
    value: function sendMessage(prop, value) {
      return peerSocket.send({
        prop: 'FS_SETTINGS_UPDATE:' + prop,
        value: value
      });
    }
  }]);

  return Settings;
}();

export { Settings as default };
;