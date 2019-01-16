import TestProvider from '../Provider/testProvider';
import VimeoProvider from '../Provider/Vimeo';

/**
 * This class will provide you a player instance. An instance is indipendent
 * by all the other player instances, this does it mean that you can manage more
 * players inside a single page, all managed indipendently.
 * How to manage the instances is your own choice .
 * You can use your own players manager, creating your interface and manage it in
 * the way you want, or you can use the VideoPlayer interface,
 * that provides you a faster and easier way to manage more players in a single page. Please
 * remember that if you are using the VideoPlayer class you need to interact directly with that.
 *
 * You can read the full VideoPlayer documentation here: LINK_TO_VIDEOPLAYER_CLASS
 *
 * @export
 * @class Player
 */
export default class Player {
    id = null;

    player = null;

    /**
     * Creates an instance of Player.
     * @param {Object} options configuration options ( provider, videoId, url, domNode... )
     * @param {String} id Id of the player to associate inside the dom
     * @memberof Player
     */
    constructor(options, id) {
        this.id = id;

        switch (options.provider) {
        case 'test':
            this.player = new TestProvider(options, id);
            break;
        case 'vimeo':
            this.player = new VimeoProvider(options, id);
            break;
        default:
            this.player = null;
            throw new Error('Unsupported Provider');
        }
    }

    /**
     * Add listener to event.
     * Note that a same event can manage more listeners.
     *
     * Here is the list of the accepted listeners:
     * - play;
     * - pause;
     * - stop;
     * - mute;
     * - unmute;
     * - enterFullScreen;
     * - exitFullScreen;
     * - setVolume;
     * - forward;
     * - rewind;
     * - seek;
     * - destroy;
     *
     * Please remember to store the function inside a variable, in order to call the off method
     * to remove the listener on a precise event
     *
     * @param {String} event name of the event (see list of compatible listeners)
     * @param {Function} cb method to call when the event is fired
     * @returns
     * @memberof Player
     */
    on(event, cb) {
        this.player.on(event, cb);
    }

    /**
     * Remove Listener to event (you can have a look at the "on" method to see a full list of
     * the compatible listeners);
     *
     * @param {String} event name of the event (see list of compatible listeners)
     * @param {Function} cb method to remove
     * @memberof Player
     */
    off(event, cb) {
        this.player.off(event, cb);
    }

    /**
     * Play a video.
     *
     * @memberof Player
     */
    play() {
        this.player.play();
    }

    /**
     * Pause a video.
     *
     * @memberof Player
     */
    pause() {
        this.player.pause();
    }

    /**
     * Stop the player (restarting from 0s).
     *
     * @memberof Player
     */
    stop() {
        this.player.stop();
    }

    /**
     * Set the attribute muted to true.
     *
     * @memberof Player
     */
    mute() {
        this.player.mute();
    }

    /**
     * Set the attribute muted to false
     *
     * @memberof Player
     */
    unmute() {
        this.player.unmute();
    }

    /**
     * Switch between muted and unmuted
     *
     * @memberof Player
     */
    toggleMute() {
        this.player.toggleMute();
    }

    /**
     * Enter/exit in fullscreen mode
     *
     * @memberof Player
     */
    toggleFullScreen() {
        this.player.toggleFullScreen();
    }

    /**
     * Set the volume level to the given value.
     *
     * @param {Number} volumeLevel Value between 0 and 1, all other value are not accepted.
     * @memberof Player
     */
    setVolume(volumeLevel) {
        this.player.setVolume(volumeLevel);
    }

    /**
     * Go ahead in the video by the specified value (in seconds)
     *
     * @param {Number} seconds
     * @memberof Player
     */
    forward(seconds) {
        this.player.forward(seconds);
    }

    /**
     * Go back in the video by the specified value (in seconds)
     *
     * @param {Number} seconds
     * @memberof Player
     */
    rewind(seconds) {
        this.player.rewind(seconds);
    }

    /**
     * Set the current time of the video at the specified value (in seconds)
     *
     * @param {*} seconds
     * @memberof Player
     */
    seek(seconds) {
        this.player.seek(seconds);
    }

    /**
     * Destroy the Player (it will remove the active instance of the palyer and the
     *  iframe by the DOM).
     *
     * @memberof Player
     */
    clear() {
        this.player.clear();
        this.player = null;
    }

    /**
     * Get the list of all the active listeners on the player, with the
     *  added function
     *
     * @returns
     * @memberof Player
     */
    getListeners() {
        return this.player.getListeners();
    }
}
