import {installUpgradeColors} from './r10-upgrade-colors.js';
import {installGlow} from './r10-equipment-glow.js';
import {installEquipmentBloom} from './r10-equipment-bloom.js';
// Stage 3 adapter. The accepted character geometry/animation module stays byte-identical.
// Both render instances consume the same appearance snapshot used by the inventory.
export function installEquipmentVisuals(bridge) {
  for (const actor of [bridge.world, bridge.preview]) {
    const materials = new Map();
    actor.sword.traverse(o => {
      if (!o.material) return;
      const clone = m => { if (!materials.has(m)) materials.set(m, m.clone()); return materials.get(m); };
      o.material = Array.isArray(o.material) ? o.material.map(clone) : clone(o.material);
    });
    const original = actor.setAppearance.bind(actor);
    actor.setAppearance = function (visual) {
      original(visual);
      this.sword.visible = visual.hasWeapon !== false;
      const tier = visual.weapon ?? 0;
      const palettes = [
        {gold:0x9eaaa9, edge:0xe1e6e3, red:0x344044, ruby:0x586b6c},
        {gold:0x9ac9dc, edge:0xe1faff, red:0x214d68, ruby:0x45b9e7},
        {gold:0xa794ce, edge:0xd8c4f0, red:0x432050, ruby:0xa754d8},
        {gold:0xd6a64e, edge:0xd7b779, red:0x670f19, ruby:0x930716}
      ];
      for (const [name, hex] of Object.entries(palettes[tier])) {
        const m = materials.get(this.materials[name]);
        if (m) m.color.setHex(hex);
      }
      const ruby = materials.get(this.materials.ruby);
      if (ruby) { ruby.emissive.setHex([0x000000,0x165b90,0x682795,0xe92e05][tier]); ruby.emissiveIntensity = tier ? .14 : 0; }
      this.root.userData.equipment = {...visual};
    };
    installGlow(actor);installUpgradeColors(actor);
  }
  installEquipmentBloom(bridge);
}
