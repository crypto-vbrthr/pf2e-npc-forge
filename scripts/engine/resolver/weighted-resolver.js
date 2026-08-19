export class WeightedResolver {
  constructor(random) {
    this.random = random;
  }

  resolve(candidates = [], { weight = (candidate) => candidate?.weight ?? 1, predicate = () => true } = {}) {
    const eligible = candidates
      .filter(predicate)
      .map((candidate) => ({ candidate, weight: Math.max(0, Number(weight(candidate)) || 0) }))
      .filter((entry) => entry.weight > 0);

    if (eligible.length === 0) return null;
    const total = eligible.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = this.random.next() * total;
    for (const entry of eligible) {
      roll -= entry.weight;
      if (roll < 0) return entry.candidate;
    }
    return eligible.at(-1).candidate;
  }
}
