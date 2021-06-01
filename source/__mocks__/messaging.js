const messaging = {};


messaging.peerSocket = {
    registeredHandlers: {},
    addEventListener: jest.fn((eventName, cb) => {
        const handlers = messaging.peerSocket.registeredHandlers[eventName] || [];
        handlers.push(cb);
        messaging.peerSocket.registeredHandlers[eventName] = handlers;
    }),
    emitMockEvent: (eventName, data) => {
        messaging.peerSocket.registeredHandlers[eventName].forEach((handler) => {
            handler({data});
        });
    },
    send: jest.fn(),
    readyState: 1,
    OPEN: 1
}

module.exports = messaging;