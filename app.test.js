import FsSettings from './src/app';
import fs from 'fs';
import messaging from 'messaging';

jest.mock('fs');

const mockStoredSettings = {
    background: 'black',
    name: 'henry',
    border: 'red',
    deprecatedProp: 'foo'
};

const mockWrite = fs.writeFileSync.mockReturnValue(true);

describe('fitbit-settings/app', () => {
    afterEach(() => {
        messaging.peerSocket.registeredHandlers = [];
        messaging.peerSocket.addEventListener.mockClear();
        fs.readFileSync.mockClear();
    })

    test('initialize properly', () => {
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockReturnValue(mockStoredSettings);

        const initialSettings = {
            background: '#fff',
            newProp: 'bar'
        };
        const settings = new FsSettings(initialSettings, { filePath: 'file-path.cbor'});

        // Save to Disk Properly
        expect(mockWrite.mock.calls[0][0]).toBe('file-path.cbor');
        expect(mockWrite.mock.calls[0][1].name).toBe('henry'); // Check for Migration
        expect(mockWrite.mock.calls[0][2]).toBe('cbor');

        // Store initial settings
        expect(settings.initial).toBe(initialSettings)

        // Values Correct
        expect(settings.getProp('newProp')).toBe('bar'); // Newly Added
        expect(settings.getProp('name')).toBe('henry'); // Stored
        expect(settings.getProp('deprecatedProp')).toBe('foo'); // Old Still Exists
    });

    test('update() reflects internal setting state', () => {
        fs.existsSync.mockReturnValue(false);
    
        const settings = new FsSettings({
            background: 'white'
        });
    
        settings.update('background', 'yellow');
        expect(settings.getProp('background')).toBe('yellow');
    });
    
    test('stored settings persist new initial settings in state', () => {
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockReturnValue(mockStoredSettings);

        const settings = new FsSettings({
            background: 'black',
            name: 'joe',
            newProp: 'bar'
        });

        expect(settings.getProp('name')).toBe('henry');
        expect(settings.getProp('border')).toBe('red');
        expect(settings.getProp('background')).toBe('black');
        expect(settings.getProp('deprecatedProp')).toBe('foo'); 
    });

        
    test('return value with getProp()', () => {
        const settings = new FsSettings({
            test: 1
        });

        expect(settings.getProp('test')).toBe(1);
    });

    test('reset() clears internal state', () => {
        const settings = new FsSettings({
            prop1: 1,
            prop2: 2,
        });

        // Update
        settings.update('prop1', 2);
        settings.update('prop2', 3);
        expect(settings.getProp('prop1', 2));
        expect(settings.getProp('prop1', 3));

        // Return to normal
        settings.reset();
        expect(settings.getProp('prop1')).toBe(1);
        expect(settings.getProp('prop2')).toBe(2);
    });

    test('save() stores state to disk', () => {
        fs.existsSync.mockReturnValue(false);

        const settings = new FsSettings({
            foo: 'bar',
            choo: 'he'
        }, {
            filePath: 'testpath.cbor'
        });

        // Update
        settings.update('choo', 'choo');
        expect(mockWrite).toHaveBeenLastCalledWith('testpath.cbor', {
            foo: 'bar',
            choo: 'choo'
        }, 'cbor');
    });

    test('main methods are chainable', () => {
        const settings = new FsSettings({ 
            foo: 'bar',
            choo: 'bar2',
            mary: 'little'
        });
        settings.update('choo', 'choo').update('mary', 'lamb').save();
        expect(settings.getProp('mary', 'lamb'))
        expect(mockWrite).toHaveBeenLastCalledWith('settings.cbor', { 
            foo: 'bar',
            choo: 'choo',
            mary: 'lamb'
         }, 'cbor');
    });

    test('listen() provides the companion with its current state', () => {
        const settings = new FsSettings({ 'foo': 'bar' }, { syncWithCompanion: true });
        settings.listen();

        messaging.peerSocket.emitMockEvent('open', {});
        expect(messaging.peerSocket.send).toHaveBeenCalledWith({
            key: 'FS_SETTINGS_SYNC:INIT',
            value: {
                foo: 'bar'
            }
        });
    });

    test('listen() register message event handler', () => {
        const settings = new FsSettings({ 'foo': 'bar' });
        
        settings.listen();
        expect(messaging.peerSocket.addEventListener.mock.calls[0][0]).toBe('message');

        // Trigger resolve
        messaging.peerSocket.emitMockEvent('open');
    });

    test('listen() updates state on relevant events on new props and saves to disk', () => {
        const settings = new FsSettings({ 'foo': 'bar' });
        settings.listen();

        messaging.peerSocket.emitMockEvent('message', {
            prop: 'FS_SETTINGS_UPDATE:foo',
            value: 'foo-bar!'
        });

        expect(settings.getProp('foo')).toBe('foo-bar!');
        expect(mockWrite).toHaveBeenLastCalledWith('settings.cbor', {'foo': 'foo-bar!'}, 'cbor');

        messaging.peerSocket.emitMockEvent('message', {
            prop: 'irrelevant',
            value: 'noise'
        });
        expect(settings.getProp('irrelevant')).toBeUndefined;
    });

    test('onPropChange() registers callbacks and are triggered', () => {
        const settings = new FsSettings({ foo: 'bar', color: 'white' });
        const callbackSpy = jest.fn();
        const callbackSpy2 = jest.fn();

        settings
            .onPropChange('foo', callbackSpy)
            .onPropChange('color', callbackSpy2);

        settings.listen();

        messaging.peerSocket.emitMockEvent('message', {
            prop: 'FS_SETTINGS_UPDATE:foo',
            value: 'test123!'
        });

        messaging.peerSocket.emitMockEvent('message', {
            prop: 'FS_SETTINGS_UPDATE:color',
            value: 'yaaay!'
        });
    });

    test('updateSettingStorage() should send message to the companion', () => {
        const settings = new FsSettings({
            foo: 'value'
        }, {
            syncWithCompanion: true
        });

        settings
            .update('foo', 'companion-sync-test');

        expect(messaging.peerSocket.send).toHaveBeenLastCalledWith({prop: 'FS_SETTINGS_UPDATE:foo', value: 'companion-sync-test'});
    });
});