import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ContentRegistry } from '../../scripts/engine/content/content-registry.js';
import { registerCoreContent } from '../../scripts/engine/content/core-content.js';
import { NpcEngine } from '../../scripts/engine/npc-engine.js';
import { NpcEditorSession } from '../../scripts/ui/npc-editor-session.js';
import { Pf2eDocumentAdapter } from '../../scripts/adapters/pf2e-document-adapter.js';

function session() {
  const registry = new ContentRegistry();
  registerCoreContent(registry);
  const engine = new NpcEngine({ registry });
  return new NpcEditorSession({ engine, adapter: new Pf2eDocumentAdapter(),
    initialRequest: { level: 10, seed: 'independent-locks', ancestry: 'core.human', classProfile: 'core.fighter', profession: 'core.guard' } });
}

test('actual numeric controls are present in the rendered template, with distinct +/- actions', () => {
  const template = fs.readFileSync(new URL('../../templates/npc-editor-core.hbs', import.meta.url), 'utf8');
  for (const [kind, key] of [['attribute', 'str'], ['defense', 'ac'], ['save', 'fortitude'], ['skill', '{{slug}}'], ['attack', '{{id}}']]) {
    assert.match(template, new RegExp(`data-stat-kind="${kind}" data-stat-key="${key.replaceAll('{','\\{').replaceAll('}','\\}')}"`));
  }
  const count = (template.match(/data-editor-action="adjustStat"/g) ?? []).length;
  assert.equal(count, 30, 'each of the 15 preview value targets has both controls');
  assert.equal((template.match(/data-stat-delta="-1"/g) ?? []).length, 15);
  assert.equal((template.match(/data-stat-delta="1"/g) ?? []).length, 15);
});

test('attribute lock does not freeze defense and vice versa, including manual +/- changes', async () => {
  const s = session();
  await s.generate();
  const first = s.getNpc();
  await s.adjustStat('attribute', 'str', 2);
  await s.adjustStat('defense', 'ac', 2);
  s.setSectionLocked('attributes', true, { render: false });
  assert.equal(s.isSectionLocked('defenses'), false);
  const after = await s.generate();
  assert.equal(after.statistics.attributes.str, first.statistics.attributes.str + 2);
  assert.equal(after.statistics.ac, first.statistics.ac, 'unlocked defense resets manual tweak');
  await s.adjustStat('defense', 'hp', 6);
  s.setSectionLocked('defenses', true, { render: false });
  s.setSectionLocked('attributes', false, { render: false });
  assert.equal(s.isSectionLocked('attributes'), false);
  assert.equal(s.isSectionLocked('defenses'), true);
  const third = await s.generate();
  assert.equal(third.statistics.hp, first.statistics.hp + 6);
  assert.equal(third.statistics.attributes.str, first.statistics.attributes.str);
  assert.equal(s.engine.validate(third).valid, true);
});

test('attack lock preserves edited strike and linked original weapon without locking all equipment', async () => {
  const s = session();
  const first = await s.generate();
  const atk = first.attacks[0];
  const originalWeapon = first.inventory.find(item => item.id === atk.sourceWeaponId);
  await s.adjustStat('attack', atk.id, 2);
  s.setSectionLocked('attacks', true, { render: false });
  assert.equal(s.isSectionLocked('inventory'), false);
  const second = await s.generate();
  assert.equal(second.attacks[0].modifier, atk.modifier + 2);
  assert.deepEqual(second.inventory.find(item => item.id === atk.sourceWeaponId), originalWeapon);
  assert.equal(s.engine.validate(second).valid, true);
  const materialized = new Pf2eDocumentAdapter().toActorSource(second);
  assert.ok(materialized.items.some(item => item.type === 'melee' && item.system.bonus.value === atk.modifier + 2));
  s.setSectionLocked('attacks', false, { render: false });
  assert.equal(s.isSectionLocked('inventory'), false);
});

test('equipment lock does not preserve a manually adjusted attack when regenerating', async () => {
  const s = session();
  const first = await s.generate();
  const attack = first.attacks[0];
  const weapon = first.inventory.find(item => item.id === attack.sourceWeaponId);
  await s.adjustStat('attack', attack.id, 3);
  s.setSectionLocked('inventory', true, { render: false });
  assert.equal(s.isSectionLocked('attacks'), false);
  const second = await s.generate();
  assert.equal(second.attacks[0].modifier, attack.modifier);
  assert.deepEqual(second.inventory.find(item => item.id === attack.sourceWeaponId), weapon);
  assert.equal(s.engine.validate(second).valid, true);
});
