import { readFileSync, writeFileSync, existsSync } from 'fs';
import { peerSocket } from "messaging";
import { autoCast } from './utils';

export default class Settings {
    initial = {};
    state = {};
    filePath = ''
    syncWithCompanion = false;
    propCallbacks = [];

    constructor(defaultSettings, { filePath = 'settings.cbor', syncWithCompanion = 'false', callListenersOnInit = 'false' } = {}) {
        this.initial = defaultSettings;
        this.state = defaultSettings;
        this.filePath = filePath;
        this.syncWithCompanion = syncWithCompanion;
        this.callListenersOnInit = callListenersOnInit;

        // Pre-Existing Users
        if (existsSync(this.filePath)) {
            const stored = readFileSync(this.filePath, 'cbor');
            this.migrate(stored, this.initial);
        }
    
        this.save();
    }

    save() {
        writeFileSync(this.filePath, this.state, 'cbor');
        return this;
    }

    update(prop, value) {
        if (!this.state[prop]) {
            console.warn(`fitbit-settings/app: Prop, ${prop}, not passed in default settings, this may result in stray props saved`);
        }
        if (this.state[prop] === value) return;

        this.state[prop] = value;

        if (this.syncWithCompanion === true) {
            if (peerSocket.readyState !== peerSocket.OPEN) 
                return console.warn('fitbit-settings/app: Connection with companion has been not established yet, updating props too soon.');
            this.sendMessage(prop, value);
        }

        return this;
    }

    // Currently we are keeping existing settings and only support 1 depth
    // but we may want a means to purge unused settings
    migrate(storedSettings, newSettings) {
        const migratedSettings = Object.assign({}, newSettings, storedSettings);
        this.state = migratedSettings;
    }

    reset() {
        this.state = this.initial;
        return this;
    }

    getProp(prop) {
        return this.state[prop];
    }

    listen() {
        peerSocket.addEventListener('message', event => {
            // Assume all FS_SETTING prefix events are from this module
            // FS_SETTINGS_UPDATE:PROP_NAME
            if (event.data.prop && event.data.prop.indexOf('FS_SETTINGS_UPDATE:') !== -1) {
                const prop = event.data.prop.split(':')[1];
                const value = autoCast(event.data.value);
                const noChange = this.getProp(prop) === value;
                if (noChange) return;
        
                this.update(prop, value);

                if (this.propCallbacks[prop]) {
                    this.propCallbacks[prop]({
                        data: {
                            prop: prop,
                            value
                        }
                    });
                }

                this.save();
            }
        });
    
        peerSocket.addEventListener('open', () => {
            peerSocket.send({
                key: 'FS_SETTINGS_SYNC:INIT',
                value: this.state
            });

            console.info('fitbit-settings/app: Connection with companion has been established, syncing companion with app state changes.');
        });

        // Use this option if you want to call all of your listeners
        // when fitbit-settings loads initially
        if (this.callListenersOnInit) {
            console.info('fitbit-settings/app: Calling listeners on initial activation.');
            Object.keys(this.propCallbacks).map(prop => {
                const value = this.getProp(prop);
                this.propCallbacks[prop]({
                    data: {
                        prop, value
                    }
                });
            });
        }

        return this;
    }

    onPropChange(prop, callback) {
        this.propCallbacks[prop] = callback;
        return this;
    }

    sendMessage(prop, value) {
        return peerSocket.send({
            prop: 'FS_SETTINGS_UPDATE:' + prop,
            value
        });
    }
};
