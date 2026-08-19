function hashSeed(seed) {
  let h = 2166136261 >>> 0;
  const text = String(seed ?? "npc-forge");
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export class SeededRandom {
  constructor(seed = `${Date.now()}-${Math.random()}`) {
    this.seed = String(seed);
    this.state = hashSeed(this.seed) || 0x9e3779b9;
  }

  next() {
    let x = this.state >>> 0;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.state = x >>> 0;
    return (this.state >>> 0) / 4294967296;
  }

  int(min, max) {
    const lo = Math.ceil(Math.min(min, max));
    const hi = Math.floor(Math.max(min, max));
    return lo + Math.floor(this.next() * (hi - lo + 1));
  }

  chance(probability) {
    return this.next() < Math.max(0, Math.min(1, Number(probability) || 0));
  }

  pick(values = []) {
    if (!Array.isArray(values) || values.length === 0) return null;
    return values[this.int(0, values.length - 1)];
  }
}
