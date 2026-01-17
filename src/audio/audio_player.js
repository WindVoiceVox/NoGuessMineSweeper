export class PooledAudioPlayer {
  constructor(urls, poolSize = 4) {
    this.urls = urls;
    this.poolSize = poolSize;
    this.enabled = true;
    this.pools = {
      OPEN_1: [],
      OPEN_0: [],
      FLAG_ON: [],
      FLAG_OFF: [],
      BOOM: [],
      CLEAR: [],
      UI_CLICK: [],
    };
    this.nextIndex = {
      OPEN_1: 0,
      OPEN_0: 0,
      FLAG_ON: 0,
      FLAG_OFF: 0,
      BOOM: 0,
      CLEAR: 0,
      UI_CLICK: 0,
    };
  }

  async preload() {
    const promises = [];
    for (const key of Object.keys(this.pools)) {
      this.pools[key] = [];
      for (let i = 0; i < this.poolSize; i++) {
        const audio = new Audio(this.urls[key]);
        audio.preload = "auto";
        this.pools[key].push(audio);
        promises.push(
          new Promise((resolve) => {
            const done = () => resolve();
            audio.addEventListener("canplaythrough", done, { once: true });
            audio.addEventListener("error", done, { once: true });
          })
        );
      }
    }
    await Promise.all(promises);
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  play(ev) {
    if (!this.enabled) return;
    const pool = this.pools[ev];
    if (!pool || pool.length === 0) return;
    const idx = this.nextIndex[ev] % pool.length;
    this.nextIndex[ev] = (this.nextIndex[ev] + 1) % pool.length;
    const audio = pool[idx];
    try {
      audio.currentTime = 0;
      void audio.play();
    } catch {
      return;
    }
  }
}
