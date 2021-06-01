import FsSettings from './source/companion';
import messaging from 'messaging';
import { settingsStorage } from 'settings';
import { peerSocket } from 'messaging';

const initialSettings = {
    background: '#fff',
    newProp: 'bar'
};

describe('fitbit-settings/companion', () => {
    afterEach(() => {
        peerSocket.registeredHandlers = [];
        peerSocket.addEventListener.mockClear();
        peerSocket.send.mockClear();
    });

    test('listen() syncs device with settings change events', () => {
        const companionSettings = new FsSettings(initialSettings);
        companionSettings.listen();

        // Emit event to match live storage events
        settingsStorage.emitMockEvent('change', {
            key: 'background',
            newValue: 'red'
        });

        expect(peerSocket.send).toHaveBeenCalledWith({ prop: 'FS_SETTINGS_UPDATE:background', value: 'red'});
    });

    test('listen() syncs device with any offline changes or mismatch states', () => {
        const companionSettings = new FsSettings(initialSettings);
        // Have to set the setting storage
        settingsStorage.setItem('background', '#fff');
        settingsStorage.setItem('newProp', 'bar');

        companionSettings.listen();

        const mockOldDeviceSettings = {
            background: 'red',
            newProp: 'yellow'
        };

        peerSocket.emitMockEvent('message', {
            key: 'FS_SETTINGS_SYNC:INIT',
            value: mockOldDeviceSettings
        });

        expect(peerSocket.send).toHaveBeenCalledWith({prop: 'FS_SETTINGS_UPDATE:background', value: '#fff'});
        expect(peerSocket.send).toHaveBeenCalledWith({prop: 'FS_SETTINGS_UPDATE:newProp', value: 'bar'});
    });

    // The device should send over the settings and return
    // the delta of differences over to app
    test('listen() syncs settings with the device', () => {
        settingsStorage.setItem = jest.fn();
        const initialSettings = {
            background: '#fff',
            newProp: 'bar'
        };
        const companionSettings = new FsSettings(initialSettings);
        companionSettings.listen();

        // Emit event to match live storage events
        messaging.peerSocket.emitMockEvent('message', ({
            prop: 'FS_SETTINGS_UPDATE:background',
            value: 'foo'
        }));
        expect(settingsStorage.setItem).toHaveBeenCalledWith('background', 'foo');

        messaging.peerSocket.emitMockEvent('message', ({
            prop: 'FS_SETTINGS_UPDATE:newProp',
            value: 'bar'
        }));
        expect(settingsStorage.setItem).toHaveBeenCalledWith('newProp', 'bar');

        expect(settingsStorage.setItem.mock.calls.length).toBe(2);
    });
});