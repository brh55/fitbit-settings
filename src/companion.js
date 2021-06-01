import { peerSocket } from 'messaging';
import { settingsStorage } from 'settings';

export default class CompanionSettings {
    initial = {};
    state = {};
    propNames = [];
    sync = true;

    constructor(defaultSettings) { 
        this.initial = defaultSettings;
        this.propNames = Object.keys(defaultSettings);
    }

    listen() {
        this.syncDeviceWithSettings();
        this.syncSettingsWithDevice();
    }

    sendMessage(prop, newValue) {
        if (peerSocket.readyState !== peerSocket.OPEN) {
            return console.debug('fitbit-settings/companion: peerSocket not ready, could not send message');
        }

        return peerSocket.send({
            prop: 'FS_SETTINGS_UPDATE:' + prop,
            value: newValue
        });
    }

    syncDeviceWithSettings() {
        // Listen for the app to notify the companion on settings to update
        // only differences with the storage
        peerSocket.addEventListener('message', event => {
            if (event.data.key &&
                event.data.key.indexOf('FS_SETTINGS_SYNC:') !== -1) {
                const appSettings = event.data.value;
                const settingProps = Object.keys(appSettings);

                settingProps.forEach(prop => {
                    const settingStorageValue = settingsStorage.getItem(prop);
                    if (!settingStorageValue) return;
        
                    const appSettingValue = appSettings[prop];

                    if (settingStorageValue !== appSettingValue) {
                        this.sendMessage(prop, settingStorageValue)                    }
                });
            }
        });

        // On live storage changes, notify the app of changes
        settingsStorage.addEventListener('change', event => {
            if (this.propNames.indexOf(event.key) !== -1) {
                this.sendMessage(event.key, event.newValue);
            }
        });
    }

    syncSettingsWithDevice() {
        // Used for mainly when the device app can be used to update
        // settings
        peerSocket.addEventListener('message', event => {
            if (event.data.prop &&
                event.data.prop.indexOf('FS_SETTINGS_UPDATE:') !== -1
                ) {
                    const prop = event.data.prop.split(':')[1];
                    settingsStorage.setItem(prop, event.data.value);
            }
        });
    }
};
