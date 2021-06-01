const settings = {};

const settingsStorage = {
    registeredHandlers: [],
    storage: {},
    addEventListener: jest.fn((eventName, cb) => {
        const handlers = settingsStorage.registeredHandlers[eventName] || [];
        handlers.push(cb);
        settingsStorage.registeredHandlers[eventName] = handlers;
    }),
    emitMockEvent: (eventName, data) => {
        settingsStorage.registeredHandlers[eventName].forEach((handler) => {
            // Setting Storage doesn't nest data in data prop
            handler(data);
        });
    },
    setItem: (propName, value) => settingsStorage.storage[propName] = value,
    getItem: (propName) => settingsStorage.storage[propName]
};

module.exports = {
    settingsStorage
};