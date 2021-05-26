import { readFileSync, writeFileSync, existsSync } from 'fs';

export default class {
    initial = {};
    state = {};
    filePath = 'settings.cbor';

    constructor(defaultSettings, filePath) {
        this.initial = defaultSettings;
        this.state = defaultSettings;
        this.filePath = filePath || this.filePath;

        // Pre-Existing Users
        if (existsSync(this.filePath)) {
            console.log('exist')
            const stored = readFileSync(this.filePath, 'cbor');
            this.migrate(stored, this.initial);
        }
    
        this.save();
    }

    save = () => {
        writeFileSync(this.filePath, this.state, 'cbor');
        return this;
    }

    update = (prop, value) => {
        this.state[prop] = value;
        return this;
    }

    // Currently we are keeping existing settings and only support 1 depth
    // but we may want a means to purge unused settings
    migrate = (storedSettings, newSettings) => {
        const migratedSettings = Object.assign({}, newSettings, storedSettings);
        this.state = migratedSettings;
    }

    reset = () => {
        this.state = this.initial;
        return this;
    }

    getProp = (prop) => this.state[prop];
};