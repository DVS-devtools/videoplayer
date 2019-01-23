import Player from '../Player';
import { ValidateArg, ValidateObj, ValidateOptionalArg } from '../Validation';

/**
 * @namespace VideoPlayer
 */
class VideoPlayer {
    defaults = {
        idPrefix: 'video_',
        provider: null,
        forward: 15,
        rewind: 15,
    };

    /**
     * @ignore
     * @type {Object.<string, Player>}
     */
    playerInstances = {};

    /**
     * @ignore
     * generate an unique id
     * @param idOrUrl
     * @param affix
     * @return {string}
     */
    generateId(idOrUrl, affix = 1) {
        const { idPrefix } = this.defaults;
        const id = `${idPrefix}${idOrUrl}_${affix}`;
        if (Object.keys(this.playerInstances).includes(id)) {
            return this.generateId(idOrUrl, affix + 1);
        }
        return id;
    }

    /**
     * Create a new {@link Player} instance
     * @param {Object} playerInitOptions configuration options (provider, videoId, url, domNode...)
     * @param {String|Node} playerInitOptions.domNode DOM element identifier,
     * where to mount the player.
     *
     * Can be a DOM Node instance (ex: document.getElementById(id)),
     * a string representing the Node ID (ex: id) or a querySelector for a Node ID (ex: #id)
     * @param {String} playerInitOptions.provider The provider to use,
     * one of: 'dailymotion', 'vimeo', 'youtube', 'flowplayer'
     * @param {String} [playerInitOptions.videoId] ID of the video,
     * passed to the provider to find the video
     * @param {String} [playerInitOptions.url] url of the video resource, passed to the provider
     * @param {Object<any>}[playerInitOptions.providerOptions] provider init options,
     * see each provider doc to know what can be passed here:
     * * **Vimeo**: https://github.com/vimeo/player.js#embed-options
     * * **Dailymotion**: https://developer.dailymotion.com/player#player-parameters
     * * **Youtube**: https://developers.google.com/youtube/player_parameters?playerVersion=HTML5#Parameters
     * * **Flowplayer**: https://flowplayer.com/help/developers/flowplayer-7/setup#player-options
     * @example
     * const player = VideoPlayer.createPlayer({
     *     domNode: '#el',
     *     provider: 'vimeo',
     *     videoId: 'sdHg79'
     * });
     * @return {Player}
     */
    @ValidateObj({ domNode: 'string|object', videoId: 'string|number' }, 0, { videoId: 'url' })
    createPlayer(playerInitOptions) {
        // Get the requested provider
        const provider = playerInitOptions.provider || this.defaults.provider;
        if (!provider) {
            throw new Error('cannot create player: provider or VideoPlayer.default.provider is required!');
        }
        // Filter the given options, remove "events", they are registered after
        const playerOptions = Object.assign({}, Object.keys(playerInitOptions).filter(k => k !== 'events').reduce((o, k) => {
            o[k] = playerInitOptions[k];
            return o;
        }, {}), { provider });
        // Generate the unique id of the Player
        const id = this.generateId(playerInitOptions.videoId || playerInitOptions.url);
        // Create the Player
        const player = new Player(playerOptions, id);
        // Save the created Player by its id
        this.playerInstances[id] = player;
        // Register all passed events
        if (playerInitOptions.events && Object.keys(playerInitOptions.events).length) {
            Object.keys(playerInitOptions.events).forEach((eventName) => {
                this.addEventListener(id, eventName, playerInitOptions.events[eventName]);
            });
        }
        return player;
    }

    /**
     * Get a previously created Player instance from its id
     * @param playerId
     * @return {Player}
     * @example
     * const player = VideoPlayer.getPlayer('video_sdHg79_1');
     */
    @ValidateArg('string')
    getPlayer(playerId) {
        if (!Object.keys(this.playerInstances).includes(playerId)) {
            throw new Error(`Player with id ${playerId} not found`);
        }
        return this.playerInstances[playerId];
    }

    /**
     * Get all created Player instances keyed by their id
     * @example
     * VideoPlayer.getPlayers()
     * // {
     * //   video_sdHg79_1: Player
     * // }
     *
     * @return {Object.<string, Player>}
     */
    getPlayers() {
        return this.playerInstances;
    }

    /**
     * Get an array of all created Player
     * @example
     * VideoPlayer.getPlayersAsArray()
     * // [Player]
     * @return {Player[]}
     */
    getPlayersAsArray() {
        return Object.values(this.playerInstances);
    }

    /**
     * Add an event listener callback called when the specified event is fired
     * @param {String} playerId
     * @param {String} event
     * @param {Function} callback
     * @return {Promise<void>}
     * @example
     * const callback = (evt) => {
     *     // Do stuff..
     * }
     * VideoPlayer.addEventListener('video_sdHg79_1', 'play', callback);
     */
    @ValidateArg('string', 1)
    @ValidateArg('function', 2)
    addEventListener(playerId, event, callback) {
        return this.getPlayer(playerId).on(event, callback);
    }

    /**
     * Remove a previously registered callback to an event
     * @param {String} playerId
     * @param {String} event
     * @param {Function} callback
     * @return {Promise<void>}
     * @example
     * VideoPlayer.removeEventListener('video_sdHg79_1', 'play', callback);
     */
    @ValidateArg('string', 1)
    @ValidateArg('function', 2)
    removeEventListener(playerId, event, callback) {
        return this.getPlayer(playerId).off(event, callback);
    }

    /**
     * Destroys a Player instance
     * @param playerId
     * @return {Promise<void>}
     * @example
     * VideoPlayer.clear('video_sdHg79_1').then(() => {
     *     // Player is cleared
     * })
     */
    clear(playerId) {
        const player = this.getPlayer(playerId);
        delete this.playerInstances[playerId];
        return player.clear();
    }

    /**
     * Destroys all Player instances
     * @return {Promise<void>}
     * @example
     * VideoPlayer.clearAll().then(() => {
     *     // All players are cleared
     * })
     */
    clearAll() {
        const clearPromises = Object.keys(this.playerInstances)
            .map(playerId => this.clear(playerId));
        return Promise.all(clearPromises).then(() => {
            this.playerInstances = {};
        });
    }

    /**
     * Send [play]{@link Player#play} command to the Player
     * @param playerId
     * @return {Promise<void>}
     * @example
     * VideoPlayer.play('video_sdHg79_1').then(() => {
     *     // Player is played
     * })
     */
    play(playerId) {
        return this.getPlayer(playerId).play();
    }

    /**
     * Send [pause]{@link Player#pause} command to the Player
     * @param playerId
     * @return {Promise<void>}
     * @example
     * VideoPlayer.pause('video_sdHg79_1').then(() => {
     *     // Player is paused
     * })
     */
    pause(playerId) {
        return this.getPlayer(playerId).pause();
    }

    /**
     * Send [stop]{@link Player#stop} command to the Player
     * @param playerId
     * @return {Promise<void>}
     * @example
     * VideoPlayer.stop('video_sdHg79_1').then(() => {
     *     // Player is stopped
     * })
     */
    stop(playerId) {
        return this.getPlayer(playerId).stop();
    }

    /**
     * Send [mute]{@link Player#mute} command to the Player
     * @param playerId
     * @return {Promise<void>}
     * @example
     * VideoPlayer.mute('video_sdHg79_1').then(() => {
     *     // Player is muted
     * })
     */
    mute(playerId) {
        return this.getPlayer(playerId).mute();
    }

    /**
     * Send [unmute]{@link Player#unmute} command to the Player
     * @param playerId
     * @return {Promise<void>}
     * @example
     * VideoPlayer.unmute('video_sdHg79_1').then(() => {
     *     // Player is unmuted
     * })
     */
    unmute(playerId) {
        return this.getPlayer(playerId).unmute();
    }

    /**
     * Send [toggleMute]{@link Player#toggleMute} command to the Player
     * @param playerId
     * @return {Promise<void>}
     * @example
     * VideoPlayer.toggleMute('video_sdHg79_1').then(() => {
     *     // Mute is toggled
     * })
     */
    toggleMute(playerId) {
        return this.getPlayer(playerId).toggleMute();
    }

    /**
     * Send [toggleFullScreen]{@link Player#toggleFullScreen} command to the Player
     * @param playerId
     * @return {Promise<void>}
     * @example
     * VideoPlayer.toggleFullScreen('video_sdHg79_1').then(() => {
     *     // Full screen is toggled
     * })
     */
    toggleFullScreen(playerId) {
        return this.getPlayer(playerId).toggleFullScreen();
    }

    /**
     * Send [setVolume]{@link Player#setVolume} command to the Player
     * @param playerId
     * @param volume
     * @return {Promise<void>}
     * @example
     * VideoPlayer.setVolume('video_sdHg79_1', 0.5).then(() => {
     *     // Volume is set
     * })
     */
    @ValidateArg('number', 1)
    setVolume(playerId, volume) {
        return this.getPlayer(playerId).setVolume(volume);
    }

    /**
     * Send [seek]{@link Player#seek} command to the Player
     * @param playerId
     * @param seconds
     * @return {Promise<void>}
     * @example
     * VideoPlayer.seek('video_sdHg79_1', 42).then(() => {
     *     // Player is seeked
     * })
     */
    @ValidateArg('number', 1)
    seek(playerId, seconds) {
        return this.getPlayer(playerId).seek(seconds);
    }

    /**
     * Send [forward]{@link Player#forward} command to the Player
     * @param playerId
     * @param seconds
     * @return {Promise<void>}
     * @example
     * VideoPlayer.forward('video_sdHg79_1', 10).then(() => {
     *     // Player is forwarded
     * })
     */
    @ValidateOptionalArg('number', 1)
    forward(playerId, seconds) {
        return this.getPlayer(playerId).forward(seconds || this.defaults.forward);
    }

    /**
     * Send [rewind]{@link Player#rewind} command to the Player
     * @param playerId
     * @param seconds
     * @return {Promise<void>}
     * @example
     * VideoPlayer.rewind('video_sdHg79_1', 10).then(() => {
     *     // Player is rewinded
     * })
     */
    @ValidateOptionalArg('number', 1)
    rewind(playerId, seconds) {
        return this.getPlayer(playerId).rewind(seconds || this.defaults.rewind);
    }
}

export default new VideoPlayer();
