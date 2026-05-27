import type { ThemeId } from "./types";

/** 場面ごとの効果音の種類。 */
export type SfxName =
  | "tap"
  | "dice"
  | "move"
  | "forward"
  | "back"
  | "skip"
  | "extra"
  | "swap"
  | "warp"
  | "wish"
  | "diary"
  | "goal"
  | "fanfare";

type Wave = OscillatorType;

interface ToneStep {
  freq: number;
  /** 開始オフセット（秒） */
  at: number;
  /** 長さ（秒） */
  dur: number;
  /** 音量（0-1） */
  gain?: number;
  wave?: Wave;
}

const STORAGE_KEY = "sugoroku-muted";

/**
 * Web Audio だけで BGM と効果音を合成するサウンドエンジン。
 * 音声ファイル不要でオフラインでも鳴る。場面ごとに音色が変わる。
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private bgmTimer: ReturnType<typeof setInterval> | null = null;
  private bgmTheme: ThemeId | null = null;
  private muted = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.muted = window.localStorage.getItem(STORAGE_KEY) === "1";
    }
  }

  /** 初回のユーザー操作時に呼ぶ（自動再生ポリシー対策）。 */
  resume() {
    const ctx = this.ensureCtx();
    if (ctx && ctx.state === "suspended") void ctx.resume();
  }

  isMuted() {
    return this.muted;
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, this.muted ? "1" : "0");
    }
    if (this.master) {
      this.master.gain.value = this.muted ? 0 : 1;
    }
    return this.muted;
  }

  private ensureCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 1;
      this.master.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  private playTone(step: ToneStep, startTime: number, dest: GainNode) {
    const ctx = this.ctx;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = step.wave ?? "triangle";
    osc.frequency.value = step.freq;
    const t0 = startTime + step.at;
    const peak = step.gain ?? 0.3;
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + step.dur);
    osc.connect(env);
    env.connect(dest);
    osc.start(t0);
    osc.stop(t0 + step.dur + 0.02);
  }

  private playSequence(steps: ToneStep[]) {
    const ctx = this.ensureCtx();
    if (!ctx || !this.master || this.muted) return;
    if (ctx.state === "suspended") void ctx.resume();
    const now = ctx.currentTime;
    for (const s of steps) this.playTone(s, now, this.master);
  }

  /** 効果音を鳴らす。場面ごとに音色・音程が異なる。 */
  sfx(name: SfxName) {
    this.playSequence(SFX[name]());
  }

  /** テーマごとに異なる雰囲気のBGMをループ再生する。 */
  startBgm(theme: ThemeId) {
    const ctx = this.ensureCtx();
    if (!ctx || !this.master) return;
    if (this.bgmTheme === theme && this.bgmTimer) return;
    this.stopBgm();
    this.bgmTheme = theme;

    if (!this.bgmGain) {
      this.bgmGain = ctx.createGain();
      this.bgmGain.gain.value = 0.12;
      this.bgmGain.connect(this.master);
    }

    const song = BGM[theme];
    let beat = 0;
    const tick = () => {
      if (!this.ctx || !this.bgmGain || this.muted) return;
      const note = song.notes[beat % song.notes.length];
      if (note > 0) {
        const now = this.ctx.currentTime;
        this.playTone(
          { freq: note, at: 0, dur: song.beat * 0.9, gain: 0.18, wave: song.wave },
          now,
          this.bgmGain,
        );
        // やわらかい和音（5度上）
        this.playTone(
          { freq: note * 1.5, at: 0, dur: song.beat * 0.7, gain: 0.06, wave: "sine" },
          now,
          this.bgmGain,
        );
      }
      beat++;
    };
    tick();
    this.bgmTimer = setInterval(tick, song.beat * 1000);
  }

  stopBgm() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.bgmTheme = null;
  }
}

// --- 効果音の定義（場面ごとに音色を変える） ---
const SFX: Record<SfxName, () => ToneStep[]> = {
  tap: () => [{ freq: 660, at: 0, dur: 0.08, gain: 0.2, wave: "square" }],
  dice: () => [
    { freq: 300, at: 0, dur: 0.05, gain: 0.18, wave: "square" },
    { freq: 420, at: 0.06, dur: 0.05, gain: 0.16, wave: "square" },
    { freq: 360, at: 0.12, dur: 0.05, gain: 0.16, wave: "square" },
    { freq: 500, at: 0.18, dur: 0.06, gain: 0.18, wave: "square" },
  ],
  move: () => [
    { freq: 520, at: 0, dur: 0.07, gain: 0.16, wave: "triangle" },
    { freq: 680, at: 0.08, dur: 0.08, gain: 0.16, wave: "triangle" },
  ],
  // すすむ：明るい上昇アルペジオ
  forward: () => [
    { freq: 523, at: 0, dur: 0.1, gain: 0.22 },
    { freq: 659, at: 0.1, dur: 0.1, gain: 0.22 },
    { freq: 784, at: 0.2, dur: 0.16, gain: 0.24 },
  ],
  // もどる：下降してしょんぼり
  back: () => [
    { freq: 440, at: 0, dur: 0.12, gain: 0.22, wave: "sawtooth" },
    { freq: 330, at: 0.12, dur: 0.18, gain: 0.22, wave: "sawtooth" },
  ],
  // おやすみ：ねむそうな音
  skip: () => [
    { freq: 392, at: 0, dur: 0.18, gain: 0.2, wave: "sine" },
    { freq: 294, at: 0.18, dur: 0.28, gain: 0.2, wave: "sine" },
  ],
  // もう1回：キラッとした上昇
  extra: () => [
    { freq: 659, at: 0, dur: 0.08, gain: 0.22 },
    { freq: 880, at: 0.08, dur: 0.08, gain: 0.22 },
    { freq: 1175, at: 0.16, dur: 0.14, gain: 0.24 },
  ],
  // こうかん：ふたつの音が入れ替わる
  swap: () => [
    { freq: 523, at: 0, dur: 0.1, gain: 0.2, wave: "triangle" },
    { freq: 784, at: 0.1, dur: 0.1, gain: 0.2, wave: "triangle" },
    { freq: 523, at: 0.2, dur: 0.12, gain: 0.2, wave: "triangle" },
  ],
  // ワープ：ピューンと急降下→急上昇
  warp: () => [
    { freq: 880, at: 0, dur: 0.1, gain: 0.22, wave: "sawtooth" },
    { freq: 220, at: 0.1, dur: 0.12, gain: 0.22, wave: "sawtooth" },
    { freq: 660, at: 0.22, dur: 0.12, gain: 0.2, wave: "sawtooth" },
  ],
  // おねがい：やさしいベル
  wish: () => [
    { freq: 784, at: 0, dur: 0.14, gain: 0.2, wave: "sine" },
    { freq: 1047, at: 0.12, dur: 0.2, gain: 0.2, wave: "sine" },
  ],
  // 日記マス：ぽわんとした音
  diary: () => [
    { freq: 587, at: 0, dur: 0.1, gain: 0.18, wave: "sine" },
    { freq: 698, at: 0.1, dur: 0.14, gain: 0.18, wave: "sine" },
  ],
  // ゴール直前のジングル
  goal: () => [
    { freq: 784, at: 0, dur: 0.1, gain: 0.24 },
    { freq: 988, at: 0.1, dur: 0.1, gain: 0.24 },
    { freq: 1319, at: 0.2, dur: 0.22, gain: 0.26 },
  ],
  // ゴール時の大ファンファーレ
  fanfare: () => [
    { freq: 523, at: 0, dur: 0.14, gain: 0.26 },
    { freq: 659, at: 0.14, dur: 0.14, gain: 0.26 },
    { freq: 784, at: 0.28, dur: 0.14, gain: 0.26 },
    { freq: 1047, at: 0.42, dur: 0.3, gain: 0.3 },
    { freq: 784, at: 0.42, dur: 0.3, gain: 0.12, wave: "sine" },
    { freq: 1319, at: 0.74, dur: 0.36, gain: 0.28 },
  ],
};

// --- テーマごとのBGM（音階・テンポ・音色で雰囲気を変える） ---
interface BgmDef {
  notes: number[];
  beat: number;
  wave: Wave;
}

const BGM: Record<ThemeId, BgmDef> = {
  // もり：のんびり明るいペンタトニック
  forest: { notes: [523, 587, 659, 784, 659, 587, 523, 0], beat: 0.42, wave: "triangle" },
  // うちゅう：浮遊感のある音
  space: { notes: [440, 0, 587, 0, 698, 0, 523, 0], beat: 0.5, wave: "sine" },
  // うみ：ゆったりした波のような音
  ocean: { notes: [392, 494, 587, 494, 440, 587, 494, 0], beat: 0.46, wave: "sine" },
  // おうち：あたたかいワルツ風
  home: { notes: [523, 659, 784, 659, 587, 698, 0, 0], beat: 0.4, wave: "triangle" },
  // ヒーロー：元気な行進曲風
  hero: { notes: [523, 523, 784, 784, 659, 587, 523, 0], beat: 0.34, wave: "square" },
  // ゆめ：きらきらした夢の音
  dream: { notes: [659, 784, 880, 1047, 880, 784, 659, 0], beat: 0.38, wave: "triangle" },
};

export const sound = new SoundEngine();
