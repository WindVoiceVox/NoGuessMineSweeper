export interface RNG {
  nextFloat(): number;
  nextInt(max: number): number;
}

export class XorShift32 implements RNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  nextFloat(): number {
    return this.next() / 0x100000000;
  }

  nextInt(max: number): number {
    return Math.floor(this.nextFloat() * max);
  }

  private next(): number {
    let x = this.state;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.state = x >>> 0;
    return this.state;
  }
}

export function seedFromString(seed?: string): number {
  if (!seed) {
    return (Date.now() & 0xffffffff) >>> 0;
  }
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
