import Settings from '/source';
import fs from 'fs';

jest.mock('fs');

const mockStoredSettings = {
    background: 'black',
    name: 'henry',
    border: 'red',
    deprecatedProp: 'foo'
};

const mockWrite = fs.writeFileSync.mockReturnValue(true);

describe('Fitbit Setting Module', () => {
    test('initialize properly', () => {
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockReturnValue(mockStoredSettings);

        const initialSettings = {
            background: '#fff',
            newProp: 'bar'
        };
        const settings = new Settings(initialSettings, 'file-path.cbor');

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
    
        const settings = new Settings({
            background: 'white'
        });
    
        settings.update('background', 'yellow');
        expect(settings.getProp('background')).toBe('yellow');
    });
    
    test('stored settings persist new initial settings in state', () => {
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockReturnValue(mockStoredSettings);

        const settings = new Settings({
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
        const settings = new Settings({
            test: 1
        });

        expect(settings.getProp('test')).toBe(1);
    });

    test('reset() clears internal state', () => {
        const settings = new Settings({
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

        const settings = new Settings({
            foo: 'bar'
        }, 'testpath.cbor');


        // Update
        settings.update('choo', 'choo');
        expect(mockWrite).toHaveBeenLastCalledWith('testpath.cbor', {
            foo: 'bar',
            choo: 'choo'
        }, 'cbor');
    });

    test('main methods should be chainable', () => {
        const settings = new Settings({ 'foo': 'bar' });
        settings.update('choo', 'choo').update('mary', 'lamb').save();
        expect(settings.getProp('mary', 'lamb'))
        expect(mockWrite).toHaveBeenLastCalledWith('settings.cbor', { 
            foo: 'bar',
            choo: 'choo',
            mary: 'lamb'
         }, 'cbor');
    });
});
