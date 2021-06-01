function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { peerSocket } from 'messaging';
import { settingsStorage } from 'settings';

var CompanionSettings = /*#__PURE__*/function () {
  function CompanionSettings(defaultSettings) {
    _classCallCheck(this, CompanionSettings);

    _defineProperty(this, "initial", {});

    _defineProperty(this, "state", {});

    _defineProperty(this, "propNames", []);

    _defineProperty(this, "sync", true);

    this.initial = defaultSettings;
    this.propNames = Object.keys(defaultSettings);
  }

  _createClass(CompanionSettings, [{
    key: "listen",
    value: function listen() {
      this.syncDeviceWithSettings();
      this.syncSettingsWithDevice();
    }
  }, {
    key: "sendMessage",
    value: function sendMessage(prop, newValue) {
      if (peerSocket.readyState !== peerSocket.OPEN) {
        return console.debug('fitbit-settings/companion: peerSocket not ready, could not send message');
      }

      return peerSocket.send({
        prop: 'FS_SETTINGS_UPDATE:' + prop,
        value: newValue
      });
    }
  }, {
    key: "syncDeviceWithSettings",
    value: function syncDeviceWithSettings() {
      var _this = this;

      // Listen for the app to notify the companion on settings to update
      // only differences with the storage
      peerSocket.addEventListener('message', function (event) {
        if (event.data.key && event.data.key.indexOf('FS_SETTINGS_SYNC:') !== -1) {
          var appSettings = event.data.value;
          var settingProps = Object.keys(appSettings);
          settingProps.forEach(function (prop) {
            var settingStorageValue = settingsStorage.getItem(prop);
            if (!settingStorageValue) return;
            var appSettingValue = appSettings[prop];

            if (settingStorageValue !== appSettingValue) {
              _this.sendMessage(prop, settingStorageValue);
            }
          });
        }
      }); // On live storage changes, notify the app of changes

      settingsStorage.addEventListener('change', function (event) {
        if (_this.propNames.indexOf(event.key) !== -1) {
          _this.sendMessage(event.key, event.newValue);
        }
      });
    }
  }, {
    key: "syncSettingsWithDevice",
    value: function syncSettingsWithDevice() {
      // Used for mainly when the device app can be used to update
      // settings
      peerSocket.addEventListener('message', function (event) {
        if (event.data.prop && event.data.prop.indexOf('FS_SETTINGS_UPDATE:') !== -1) {
          var prop = event.data.prop.split(':')[1];
          settingsStorage.setItem(prop, event.data.value);
        }
      });
    }
  }]);

  return CompanionSettings;
}();

export { CompanionSettings as default };
;