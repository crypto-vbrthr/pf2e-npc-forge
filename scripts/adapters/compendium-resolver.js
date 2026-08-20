/**
 * Per-adapter PF2e compendium resolver.
 *
 * Crowd generation can resolve dozens of items from the same pack. Foundry's
 * getIndex call is comparatively expensive, so indexes and resolved documents
 * are cached for the lifetime of the adapter. Failed lookups are cached too,
 * preventing repeated work for missing slugs. Call clear() if compendium
 * contents are changed at runtime and must be re-read immediately.
 */
export class CompendiumResolver {
  constructor({ getPack = (packId) => globalThis.game?.packs?.get?.(packId) ?? null } = {}) {
    this.getPack = getPack;
    this.indexCache = new Map();
    this.documentCache = new Map();
    this.metrics = { indexLoads: 0, documentLoads: 0 };
  }

  clear() {
    this.indexCache.clear();
    this.documentCache.clear();
    this.metrics = { indexLoads: 0, documentLoads: 0 };
  }

  stats() {
    return {
      indexEntries: this.indexCache.size,
      documentEntries: this.documentCache.size,
      ...this.metrics
    };
  }

  async index(packId) {
    if (!packId) return [];
    if (!this.indexCache.has(packId)) {
      const pack = this.getPack(packId);
      if (!pack) return [];
      this.metrics.indexLoads += 1;
      const pending = Promise.resolve(pack.getIndex({ fields: ["system.slug", "type"] }))
        .then((index) => Array.from(index ?? []))
        .catch((error) => {
          this.indexCache.delete(packId);
          throw error;
        });
      this.indexCache.set(packId, pending);
    }
    return this.indexCache.get(packId);
  }

  async find(reference) {
    if (!reference?.packId || !reference?.slug) return null;
    const key = `${reference.packId}|${reference.itemType ?? "*"}|${reference.slug}`;
    if (!this.documentCache.has(key)) {
      const pending = (async () => {
        const pack = this.getPack(reference.packId);
        if (!pack) return null;
        const index = await this.index(reference.packId);
        const entry = index.find((candidate) => (!reference.itemType || candidate.type === reference.itemType) && candidate.system?.slug === reference.slug);
        if (!entry) return null;
        this.metrics.documentLoads += 1;
        return pack.getDocument(entry._id);
      })().catch((error) => {
        this.documentCache.delete(key);
        throw error;
      });
      this.documentCache.set(key, pending);
    }
    return this.documentCache.get(key);
  }

  async findCandidates(references = []) {
    for (const reference of references) {
      const document = await this.find(reference);
      if (document) return { document, reference };
    }
    return { document: null, reference: null };
  }
}
