import { readFileSync, writeFileSync, existsSync } from 'fs';
import { peerSocket } from "messaging";

export default class Settings {
    initial = {};
    state = {};
    filePath = 'settings.cbor';
    listener = null;
    propCallbacks = [];

    constructor(defaultSettings, filePath) {
        this.initial = defaultSettings;
        this.state = defaultSettings;
        this.filePath = filePath || this.filePath;

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
        this.state[prop] = value;
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
        console.log('listening for setting changes')
        this.listener = peerSocket.addEventListener('message', event => {
            // Assume all FS_SETTING prefix events are from this module
            // FS_SETTING_UPDATE:PROP_NAME
            if (event.data.prop && event.data.prop.indexOf('FS_SETTING_UPDATE:') !== -1) {
                const prop = event.data.prop.split(':')[1];

                const noChange = this.getProp(prop) === event.data.value;
                if (noChange) return;
        
                this.update(prop, event.data.value);

                if (this.propCallbacks[prop]) {
                    this.propCallbacks[prop]();
                }

                this.save();
            }
        });

        return this;
    }

    onPropChange(prop, callback) {
        this.propCallbacks[prop] = callback;
        return this;
    }
};
