import VideoPlayer from './index';
import Player from '../Player';

jest.mock('../Player');

beforeEach(() => {
    Player.mockClear();
    VideoPlayer.defaults.provider = 'test';
    VideoPlayer.clearAll();
});

describe('VideoPlayer.createPlayer', () => {
    it('should instantiate a new Player', () => {
        const opts = {
            domNode: '#el',
            videoId: 123,
        };
        VideoPlayer.createPlayer(opts);
        expect(Player).toHaveBeenCalledTimes(1);
    });

    it('should create a new Player with url param', () => {
        const opts = {
            domNode: '#el',
            url: 'https://example.com',
        };
        VideoPlayer.createPlayer(opts);
        expect(Player).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when videoId or url are not passed', () => {
        const opts = {
            domNode: '#el',
        };
        expect(() => VideoPlayer.createPlayer(opts)).toThrow();
    });

    it('should throw an error when a provider is not defined', () => {
        delete VideoPlayer.defaults.provider;
        const opts = {
            domNode: '#el',
            videoId: 123,
        };
        expect(() => VideoPlayer.createPlayer(opts)).toThrow();
    });

    it('should override default provider if a provider is passed', () => {
        const opts = {
            domNode: '#el',
            videoId: 123,
            provider: 'foo'
        };
        VideoPlayer.createPlayer(opts);
        expect(Player).toHaveBeenNthCalledWith(1, {domNode: '#el', videoId: 123, provider: 'foo'}, 'video_123_1');
    });

    it('should correctly generate an incrementing id for every player with same id/url', () => {
        const opts = {
            domNode: '#el',
            videoId: 123,
        };
        VideoPlayer.createPlayer(opts);
        VideoPlayer.createPlayer(opts);

        const id1 = Object.keys(VideoPlayer.playerInstances)[0];
        const id2 = Object.keys(VideoPlayer.playerInstances)[1];

        expect(id1).toBe(`${VideoPlayer.defaults.idPrefix}${opts.videoId}_1`);
        expect(id2).toBe(`${VideoPlayer.defaults.idPrefix}${opts.videoId}_2`);
    });

    it('should register events specified on events param', () => {
        const cb = () => {};
        const cb2 = () => {};
        const opts = {
            domNode: '#el',
            videoId: 123,
            events: {
                play: cb,
                pause: cb2,
            },
        };
        VideoPlayer.createPlayer(opts);
        expect(Player.prototype.on).toHaveBeenCalledWith('play', cb);
        expect(Player.prototype.on).toHaveBeenCalledWith('pause', cb2);
    });
});

describe('VideoPlayer.getPlayer', () => {
    let playerId;
    beforeEach(() => {
        VideoPlayer.createPlayer({domNode: '#el', videoId: 123});
        playerId = 'video_123_1';
    });

    it('should return the Player instance', () => {
        const player = VideoPlayer.getPlayer(playerId);
        expect(player).toBeInstanceOf(Player);
    });

    it('should throw an error when playerId is not found', () => {
        expect(() => VideoPlayer.getPlayer('notAPlayer')).toThrow();
    });

    it('should throw an error when playerId is not passed', () => {
        expect(() => VideoPlayer.getPlayer()).toThrow();
    });
});

describe('VideoPlayer.getPlayers | VideoPlayer.getPlayersAsArray', () => {
    let playerId1, playerId2;
    beforeEach(() => {
        VideoPlayer.createPlayer({domNode: '#el', videoId: 123});
        VideoPlayer.createPlayer({domNode: '#el', videoId: 124});
        playerId1 = 'video_123_1';
        playerId2 = 'video_124_1';
    });

    it('should return an object with all instantiated players keyed by their id', () => {
        const players = VideoPlayer.getPlayers();
        expect(Object.keys(players)).toEqual([playerId1, playerId2]);
        Object.values(players).forEach((player) => {
            expect(player).toBeInstanceOf(Player);
        });
    });

    it('should return an array of all instantiated players', () => {
        const players = VideoPlayer.getPlayersAsArray();
        players.forEach((player) => {
            expect(player).toBeInstanceOf(Player);
        })
    });
});

describe('VideoPlayer.addEventListener', () => {
    let playerId;
    let cb;
    beforeEach(() => {
        VideoPlayer.createPlayer({domNode: '#el', videoId: 123});
        playerId = 'video_123_1';
        cb = () => {};
    });

    it('should call Player.on when registering an event listener', () => {
        VideoPlayer.addEventListener(playerId, 'play', cb);
        expect(Player.prototype.on).toHaveBeenCalledWith('play', cb);
    });

    it('should throw an error when the passed playerId is not an instantiated player', () => {
        expect(() => VideoPlayer.addEventListener('notAPlayer', 'play', cb)).toThrow();
    });

    it('should throw an error when an invalid playerId is passed', () => {
        expect(() => VideoPlayer.addEventListener(undefined, 'play', cb)).toThrow();
    });
});

describe('VideoPlayer.removeEventListener', () => {
    let playerId;
    let cb;
    beforeEach(() => {
        VideoPlayer.createPlayer({domNode: '#el', videoId: 123});
        playerId = 'video_123_1';
        cb = () => {};
    });

    it('should call Player.off when removing an event listener', () => {
        VideoPlayer.removeEventListener(playerId, 'play', cb);
        expect(Player.prototype.off).toHaveBeenCalledWith('play', cb);
    });

    it('should throw an error when the passed playerId is not an instantiated player', () => {
        expect(() => VideoPlayer.removeEventListener('notAPlayer', 'play', cb)).toThrow();
    });

    it('should throw an error when an invalid playerId is passed', () => {
        expect(() => VideoPlayer.removeEventListener(undefined, 'play', cb)).toThrow();
    });
});

describe('VideoPlayer Apis', () => {
    let playerId;
    beforeEach(() => {
        VideoPlayer.createPlayer({domNode: '#el', videoId: 123});
        playerId = 'video_123_1';
    });

    it('should call Player.play on VideoPlayer.play', () => {
        VideoPlayer.play(playerId);
        expect(Player.prototype.play).toHaveBeenCalled();
    });

    it('should call Player.pause on VideoPlayer.pause', () => {
        VideoPlayer.pause(playerId);
        expect(Player.prototype.pause).toHaveBeenCalled();
    });

    it('should call Player.stop on VideoPlayer.stop', () => {
        VideoPlayer.stop(playerId);
        expect(Player.prototype.stop).toHaveBeenCalled();
    });

    it('should call Player.mute on VideoPlayer.mute', () => {
        VideoPlayer.mute(playerId);
        expect(Player.prototype.mute).toHaveBeenCalled();
    });

    it('should call Player.unmute on VideoPlayer.unmute', () => {
        VideoPlayer.unmute(playerId);
        expect(Player.prototype.unmute).toHaveBeenCalled();
    });

    it('should call Player.toggleMute on VideoPlayer.toggleMute', () => {
        VideoPlayer.toggleMute(playerId);
        expect(Player.prototype.toggleMute).toHaveBeenCalled();
    });

    it('should call Player.toggleFullscreen on VideoPlayer.toggleFullscreen', () => {
        VideoPlayer.toggleFullscreen(playerId);
        expect(Player.prototype.toggleFullscreen).toHaveBeenCalled();
    });

    it('should call Player.setVolume on VideoPlayer.setVolume', () => {
        VideoPlayer.setVolume(playerId, 20);
        expect(Player.prototype.setVolume).toHaveBeenCalledWith(20);
    });

    it('should call Player.seek on VideoPlayer.seek', () => {
        VideoPlayer.seek(playerId, 30);
        expect(Player.prototype.seek).toHaveBeenCalledWith(30);
    });

    it('should call Player.forward on VideoPlayer.forward', () => {
        VideoPlayer.defaults.forward = 10;
        VideoPlayer.forward(playerId);
        expect(Player.prototype.forward).toHaveBeenCalledWith(10);
    });

    it('should call Player.forward on VideoPlayer.forward with custom forward time', () => {
        VideoPlayer.forward(playerId, 30);
        expect(Player.prototype.forward).toHaveBeenCalledWith(30);
    });

    it('should call Player.rewind on VideoPlayer.rewind', () => {
        VideoPlayer.defaults.rewind = 10;
        VideoPlayer.rewind(playerId);
        expect(Player.prototype.rewind).toHaveBeenCalledWith(10);
    });

    it('should call Player.rewind on VideoPlayer.rewind with custom rewind time', () => {
        VideoPlayer.rewind(playerId, 30);
        expect(Player.prototype.rewind).toHaveBeenCalledWith(30);
    });
});
