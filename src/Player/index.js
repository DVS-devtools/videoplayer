import TestProvider from '../Provider/testProvider';

/**
 * Player instance
 *
 * @export
 * @class Player
 */
export default class Player {
    id = null;

    player = null;

    listeners = {};

    /**
     * Creates an instance of Player.
     * @param {Object} options
     * @param {String} id
     * @memberof Player
     */
    constructor(options, id) {
        this.id = id;
        console.log(options); // eslint-disable-line no-console

        switch (options.provider) {
        case 'test':
            this.player = new TestProvider(options, id);
            break;
        default:
            console.log('No default provider, please specify a provider');
            this.player = null;
        }
    }

    /**
     * Add listener to event
     *
     * @param {String} event
     * @param {Function} cb
     * @returns
     * @memberof Player
     */
    on(event, cb) {
        this.listeners[event] = this.listeners[event] || [];
        this.listeners[event].push(cb);
        return cb;
    }

    /**
     * Remove Listener to event
     *
     * @param {String} event
     * @param {Function} cb
     * @memberof Player
     */
    off(event, cb) {
        this.listeners[event] = this.listeners[event] || [];
        // TODO
    }

    play() {
        this.player.play();
    }

    pause() {
        this.player.pause();
    }
}