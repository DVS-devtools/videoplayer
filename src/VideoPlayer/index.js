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
     * @param {String} idOrUrl fixed part of the id
     * @param {Number} affix incremental counter to append at the end of the id
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
     * Can be a DOM Node instance (ex: document.getElementById(id))
     * or a querySelector for a Node ID (ex: #id)
     * @param {String} playerInitOptions.provider The provider to use,
     * one of: 'dailymotion', 'vimeo', 'youtube', 'flowplayer' | 'iframe'
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
     * @param {String} playerId the Player Id
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
     *
     * Please remember to store the function inside a variable,
     * in order to call the off method to remove the listener on a precise event
     *
     * Supported events:
     * * **play**: fired when video starts playing
     * * **pause**: fired when video stops playing
     * * **end**: fired at the end of the playback
     * * **playbackProgress**: fired every N ms (depends ont he provider) while the video is playing
     * * **playbackProgress25**: fired when the video reach 25% of playback duration
     * * **playbackProgress50**: fired when the video reach 50% of playback duration
     * * **playbackProgress75**: fired when the video reach the 75% of playback duration
     * * **loadProgress**: fired while the video data are downloading
     * * **seek**: fired when the video seeks from the current time to another
     * * **setVolume**: fired when the video changes volume
     * * **buffering**: fired when the video starts buffering (an playback stops)
     * * **firstPlay**: fired when the video starts to play for the first time
     * (the stop() method reset the first play, the successive play() fires a firstPlay event )
     *
     * *The method supports also every Provider specific events (ex. VimeoProvider **bufferend**)*
     * @param {String} playerId the Player Id
     * @param {String} event the Event name (see supported events)
     * @param {Function} callback Function to call when the event is fired
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
     * @param {String} playerId the Player Id
     * @param {String} event the Event name
     * (see [addEventListener]{@link VideoPlayer#addEventListener} supported events)
     * @param {Function} callback Function registered
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
     * @param {String} playerId the Player Id
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
     * @param {String} playerId the Player Id
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
     * @param {String} playerId the Player Id
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
     * @param {String} playerId the Player Id
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
     * @param {String} playerId the Player Id
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
     * @param {String} playerId the Player Id
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
     * @param {String} playerId the Player Id
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
     * @param {String} playerId the Player Id
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
     * @param {String} playerId the Player Id
     * @param volume volume level to set, value between 0 and 1
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
     * @param {String} playerId the Player Id
     * @param {Number} seconds seconds to seek
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
     * @param {String} playerId the Player Id
     * @param {Number} seconds seconds to forward
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
     * @param {String} playerId the Player Id
     * @param {Number} seconds seconds to rewind
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

    /**
     * Directly download the video or returns the video Url
     * @param {String} playerId the Player Id
     * @return {Promise<void|string>}
     * @example
     * VideoPlayer.download('video_sdHg79_1').then((url)) => {
     *     // For providers that not download directly, url is the provider website url to the video
     * };
     */
    download(playerId) {
        return this.getPlayer(playerId).download();
    }
}

export default new VideoPlayer();
