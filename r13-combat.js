/* R13 combat model.
 * Verified historical Lineage M directions, NOT official numeric formulas:
 * - Lower AC makes physical attacks harder to land; AC never subtracts damage.
 * - STR supports melee attacks; DEX supports ranged attacks, AC and ER.
 * - MR mitigates magic separately. Flat damage reduction is a different stat.
 * Historical semantic sources:
 * https://rc-wstatic.plaync.co.kr/lineagem/guidebook/stats.html
 * https://rc-wstatic.plaync.co.kr/lineagem/guidebook/game_item_item_shield.html
 * https://rc-wstatic.plaync.co.kr/lineagem/guidebook/game_class_knight.html
 * Every coefficient, baseline, cap, rounding choice and minimum below is local
 * R13 game balance. No claim of current-server numeric parity is made.
 * This file has no DOM, side effects on actors, clocks, or random generator.
 */
(function (global) {
  'use strict';

  const rules = Object.freeze({
    scope: '本作自訂數值公式 / local R13 balance; historical semantics only',
    baseHitChance: 0.90,
    minimumHitChance: 0.05,
    maximumHitChance: 0.95,
    hitPointChance: 0.01,
    levelDifferenceChance: 0.006,
    acPointChance: 0.004,
    evasionPointChance: 0.01,
    baseAC: 10,
    baseSTR: 16,
    baseDEX: 12,
    baseINT: 10,
    baseWIS: 10,
    baseCON: 10,
    criticalMultiplier: 1.8,
    damageRollMinimum: 0.96,
    damageRollSpan: 0.08,
    minimumLandedDamage: 1,
    maximumDamage: 1000000000,
    magicResistanceScale: 100,
    baseMagicStatusChance: 0.5,
    magicStatusMRPointChance: 0.003
  });

  function record(value) {
    return value && typeof value === 'object' ? value : {};
  }
  function number(value, fallback = 0) {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  }
  function clamp(value, low, high) {
    return Math.max(low, Math.min(high, value));
  }
  function positive(value) {
    return clamp(number(value), 0, rules.maximumDamage);
  }
  function unitRoll(value) {
    // Missing rolls are a deterministic midpoint, never implicit randomness.
    return clamp(number(value, 0.5), 0, 1);
  }
  function level(actor) {
    return clamp(number(actor.level, 1), 1, 10000);
  }
  function kindOf(kind) {
    if (kind !== 'melee' && kind !== 'ranged') {
      throw new TypeError('Physical attack kind must be melee or ranged.');
    }
    return kind;
  }
  function above(value, baseline) {
    return Math.max(0, clamp(number(value, baseline), 0, 10000) - baseline);
  }

  /**
   * Positive attribute points above local baselines give these local bonuses.
   * STR: hit /3, damage /2, critical percentage points /6.
   * DEX: ranged hit /3, damage /2, critical percentage points /6,
   *      AC -floor(points/3), ER floor(points/2).
   * INT: spell power /2 and magic hit /3.
   * WIS: MR 2/point, max MP 3/point and MP regen /3.
   * CON: max HP 10/point and HP regen /3.
   * All divisions are floored. HP/MP and regen are returned separately; this
   * module never changes an actor's current health, mana, or recovery timers.
   */
  function attributeBonuses(stats) {
    stats = record(stats);
    const str = above(stats.str, rules.baseSTR);
    const dex = above(stats.dex, rules.baseDEX);
    const int = above(stats.int, rules.baseINT);
    const wis = above(stats.wis, rules.baseWIS);
    const con = above(stats.con, rules.baseCON);
    return {
      meleeHit: Math.floor(str / 3),
      meleeDamage: Math.floor(str / 2),
      meleeCrit: Math.floor(str / 6),
      rangedHit: Math.floor(dex / 3),
      rangedDamage: Math.floor(dex / 2),
      rangedCrit: Math.floor(dex / 6),
      ac: -Math.floor(dex / 3) || 0,
      er: Math.floor(dex / 2),
      spellPower: Math.floor(int / 2),
      magicHit: Math.floor(int / 3),
      mr: wis * 2,
      mp: wis * 3,
      mpRegen: Math.floor(wis / 3),
      hp: con * 10,
      hpRegen: Math.floor(con / 3)
    };
  }

  /**
   * hit = clamp(.90 + .01*(flat hit + attribute hit) + .006*level delta
   *             + .004*(total defender AC - 10) - .01*kind evasion, .05, .95).
   * Attacker hit is flat melee equipment/buff hit; rangedHit is the ranged
   * counterpart. Neither includes the derived STR/DEX hit.
   * Defender AC and ER are already totals including DEX, equipment and buffs.
   * meleeEvasion and rangedEvasion are extra percentage-point reductions;
   * ranged attacks also count er. A point of ER is one percentage point in
   * this local model, not a claim about the official ER conversion.
   * MR, DR, max HP and max MP have no effect on this function.
   */
  function physicalHitChance(attacker, defender, kind = 'melee') {
    attacker = record(attacker);
    defender = record(defender);
    kindOf(kind);
    const bonuses = attributeBonuses(attacker);
    const attributeHit = kind === 'ranged' ? bonuses.rangedHit : bonuses.meleeHit;
    const flatHit = kind === 'ranged' ? attacker.rangedHit : attacker.hit;
    const evasion = kind === 'ranged'
      ? positive(defender.rangedEvasion) + positive(defender.er)
      : positive(defender.meleeEvasion);
    const chance = rules.baseHitChance
      + rules.hitPointChance * (clamp(number(flatHit), -10000, 10000) + attributeHit)
      + rules.levelDifferenceChance * (level(attacker) - level(defender))
      + rules.acPointChance * (clamp(number(defender.ac, rules.baseAC), -10000, 10000) - rules.baseAC)
      - rules.evasionPointChance * evasion;
    return clamp(chance, rules.minimumHitChance, rules.maximumHitChance);
  }

  /** crit is equipment/buff percent; attribute crit is added exactly once. */
  function physicalCritChance(attacker, kind = 'melee') {
    attacker = record(attacker);
    kindOf(kind);
    const bonuses = attributeBonuses(attacker);
    const attributeCrit = kind === 'ranged' ? bonuses.rangedCrit : bonuses.meleeCrit;
    return clamp(number(attacker.crit) + attributeCrit, 0, 100) / 100;
  }

  function flatReduction(defender) {
    // Canonical long name takes precedence; aliases are not added twice.
    return positive(number(defender.damageReduction, number(defender.dr)));
  }
  function damageOptions(options) {
    options = record(options);
    return {
      multiplier: positive(number(options.multiplier, 1)),
      variance: rules.damageRollMinimum + rules.damageRollSpan * unitRoll(options.roll)
    };
  }
  function finalizeDamage(raw, reduction) {
    if (raw <= 0) return 0;
    return clamp(Math.round(raw - reduction), rules.minimumLandedDamage, rules.maximumDamage);
  }

  /**
   * A landed physical hit is round((attack + attribute damage + kind damage)
   *   * multiplier * (.96 + .08*roll) * (critical ? 1.8 : 1) - flat DR).
   * Positive attacks have a local floor of 1, with a numeric safety cap of 1e9.
   * Zero-power attacks stay zero. AC and MR do not reduce physical damage.
   * attack/atk are aliases. opts.kind defaults to melee; ranged uses DEX and
   * rangedDamage, never STR or meleeDamage. Critical must already be resolved
   * after a successful hit; this function does not perform a critical roll.
   */
  function physicalDamage(attacker, defender, options) {
    attacker = record(attacker);
    defender = record(defender);
    options = record(options);
    const kind = kindOf(options.kind || 'melee');
    const bonuses = attributeBonuses(attacker);
    const base = positive(number(attacker.attack, number(attacker.atk)));
    const extra = kind === 'ranged'
      ? bonuses.rangedDamage + number(attacker.rangedDamage)
      : bonuses.meleeDamage + number(attacker.meleeDamage);
    const opts = damageOptions(options);
    const critical = options.critical === true ? rules.criticalMultiplier : 1;
    const raw = Math.max(0, base + clamp(extra, -rules.maximumDamage, rules.maximumDamage))
      * opts.multiplier * opts.variance * critical;
    return finalizeDamage(raw, flatReduction(defender));
  }

  /**
   * raw is a spell's already-composed power, not a physical attack/AC result.
   * round(raw * multiplier * (.96+.08*roll) * 100/(100+max(MR,0))
   *       - magicReduction - damageReduction), local positive-hit floor 1.
   * Defender MR is already total, including WIS/equipment/buffs. Damage
   * reduction applies to both physical and magical damage in this local scope.
   */
  function magicDamage(raw, defender, options) {
    defender = record(defender);
    const opts = damageOptions(options);
    const mrMultiplier = rules.magicResistanceScale / (rules.magicResistanceScale + positive(defender.mr));
    const mitigated = positive(raw) * opts.multiplier * opts.variance * mrMultiplier;
    return finalizeDamage(mitigated, flatReduction(defender) + positive(defender.magicReduction));
  }

  /**
   * Only explicitly tagged MR-affected chance magic may use this helper.
   * Local chance = clamp(.50 + .01*(magicHit+INT magicHit) + .006*level delta
   *                      - .003*MR, .05, .95).
   * Do not call for Shock Stun, physical evasion, or all crowd-control spells.
   */
  function magicStatusChance(attacker, defender, options) {
    attacker = record(attacker);
    defender = record(defender);
    options = record(options);
    if (options.affectedByMR !== true) {
      throw new TypeError('Only a status explicitly marked affectedByMR may use magicStatusChance.');
    }
    const chance = rules.baseMagicStatusChance
      + rules.hitPointChance * (clamp(number(attacker.magicHit), -10000, 10000) + attributeBonuses(attacker).magicHit)
      + rules.levelDifferenceChance * (level(attacker) - level(defender))
      - rules.magicStatusMRPointChance * positive(defender.mr);
    return clamp(chance, rules.minimumHitChance, rules.maximumHitChance);
  }

  /**
   * One deterministic physical attack. Supply hitRoll, critRoll and damageRoll
   * in [0,1]; defaults are .5. Only rolls after a successful hit can produce a
   * critical. On a miss damage=0 and both proc eligibility flags are false.
   * Actor HP, leech healing, particles and element effects belong to the caller.
   */
  function evaluatePhysical(attacker, defender, options) {
    attacker = record(attacker);
    defender = record(defender);
    options = record(options);
    const kind = kindOf(options.kind || 'melee');
    const hitChance = physicalHitChance(attacker, defender, kind);
    if (unitRoll(options.hitRoll) >= hitChance) {
      return { hit: false, hitChance, critical: false, damage: 0, leechEligible: false, elementProcEligible: false };
    }
    const critical = unitRoll(options.critRoll) < physicalCritChance(attacker, kind);
    const damage = physicalDamage(attacker, defender, {
      kind,
      multiplier: options.multiplier,
      roll: options.damageRoll ?? options.roll,
      critical
    });
    return { hit: true, hitChance, critical, damage, leechEligible: damage > 0, elementProcEligible: damage > 0 };
  }

  global.R13Combat = Object.freeze({
    rules,
    attributeBonuses,
    physicalHitChance,
    physicalCritChance,
    physicalDamage,
    magicDamage,
    magicStatusChance,
    evaluatePhysical
  });
})(globalThis);
