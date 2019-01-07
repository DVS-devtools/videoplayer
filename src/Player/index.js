
export default class Player {
    id = null;

    listeners = {};

    constructor(options, id) {
        this.id = id;
        console.log(options); // eslint-disable-line no-console
    }

    on(event, cb) {
        this.listeners[event] = this.listeners[event] || [];
        this.listeners[event].push(cb);
        return cb;
    }

    off(event, cb) {
        this.listeners[event] = this.listeners[event] || [];
        // TODO
    }
}