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

    /**
     * Creates an instance of Player.
     * @param {Object} options
     * @param {String} id
     * @memberof Player
     */
    constructor(options, id) {
        this.id = id;

        switch (options.provider) {
        case 'test':
            this.player = new TestProvider(options, id);
            break;
        default:
            this.player = null;
            throw new Error('Unsupported Provider');
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
        this.player.on(event, cb);
    }

    /**
     * Remove Listener to event
     *
     * @param {String} event
     * @param {Function} cb
     * @memberof Player
     */
    off(event, cb) {
        this.player.off(event, cb);
    }

    play() {
        this.player.play();
    }

    pause() {
        this.player.pause();
    }

    stop() {
        this.player.stop();
    }

    mute() {
        this.player.mute();
    }

    unmute() {
        this.player.unmute();
    }

    toggleMute() {
        this.player.toggleMute();
    }

    toggleFullScreen() {
        this.player.toggleFullScreen();
    }

    setVolume(volumeLevel) {
        this.player.setVolume(volumeLevel);
    }

    forward(seconds) {
        this.player.forward(seconds);
    }

    rewind(seconds) {
        this.player.rewind(seconds);
    }

    seek(seconds) {
        this.player.seek(seconds);
    }

    clear() {
        this.player.clear();
        this.player = null;
    }

    getListeners() {
        return this.player.getListeners();
    }
}