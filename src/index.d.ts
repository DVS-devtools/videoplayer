
declare type Callback = (...args: any) => void;

declare interface Listeners {
  [key: string]: Callback[];
}

export declare class Player {
  id: any;
  player: any;
  on(event: string, callback: Callback): Promise<void>;
  off(event: string, callback: Callback): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  stop(): Promise<void>;
  mute(): Promise<void>;
  unmute(): Promise<void>;
  toggleMute(): Promise<void>;
  toggleFullScreen(): Promise<void>;
  togglePlay(): Promise<void>;
  setVolume(volume: number): Promise<void>;
  forward(seconds: number): Promise<void>;
  rewind(seconds: number): Promise<void>;
  seek(seconds: number): Promise<void>;
  clear(): Promise<void>;
  download(): Promise<any>;
  getListeners(): Listeners;
}

export interface PlayerOptions {
  provider: 'youtube' | 'vimeo' | 'dailymotion' | 'flowplayer' | 'iframe';
  videoID?: string | number;
  url?: string;
  providerOptions: any;
}

export namespace VideoPlayer {
  export const defaults: any;

  export const playerIntsances: {[key: string]: Player};

  export function createPlayer(playerOptions: PlayerOptions): Player;

  export function getPlayer(playerId: string): Player;

  export function getPlayers(): {[key: string]: Player};

  export function getPlayersAsArray(): Player[];

  export function addEventListener(playerId: string, event: string, callback: Callback): Promise<void>;

  export function removeEventListener(playerId: string, event: string, callback: Callback): Promise<void>;

  export function clear(playerId: string): Promise<void>;

  export function clearAll(): Promise<void>;

  export function play(playerId: string): Promise<void>;

  export function pause(playerId: string): Promise<void>;

  export function stop(playerId: string): Promise<void>;

  export function mute(playerId: string): Promise<void>;

  export function unmute(playerId: string): Promise<void>;

  export function toggleMute(playerId: string): Promise<void>;

  export function toggleFullScreen(playerId: string): Promise<void>;

  export function setVolume(playerId: string, volume: number): Promise<void>;

  export function seek(playerId: string, seconds: number): Promise<void>;

  export function forward(playerId: string, seconds: number): Promise<void>;

  export function rewind(playerId: string, seconds: number): Promise<void>;

  export function download(playerId: string): Promise<any>;
}

export default VideoPlayer;
