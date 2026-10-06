# R10.5 combat review

This is an isolated local review build, copied from the accepted equipment/drop stage and the R10.4.2 glow tuning. It has not yet passed the parent's independent fourth-stage QA.

Run `node serve.cjs` in this directory and open http://127.0.0.1:8154. Save key: `mafa-r10-combat-stage4-task4-v1`. No deployment, push, account connection, or paid asset is required.

## Combat behavior

- Attacks finish turning toward the selected direction before windup advances. Movement remains locked during each attack; the pose returns through recovery before the next attack starts.
- The three basic combo strikes use different existing sword clips. A combat adapter retimes their windup, swing, and recovery. It aims the sword lower at short enemies without replacing the accepted rig or source animations.
- Melee contact is a swept segment from the actual posed sword. The short red/orange trail uses those same points, with a narrow white core. Each strike can damage a target only once. Contact tests use the target's body height and terrain elevation.
- Fire and crescent attacks release a traveling wave; thunder releases a moving blue projectile. Damage happens when the visible wave/projectile reaches a target. Whirl releases four separate waves, each with its own hit registry. Dragon damage is tied to its cast release frame and fixed marked center.
- Yellow damage numbers, the target hit state, and a 0.20-second local contact flash originate in one damage event. The sword trail fades in 0.13 seconds. The permanent weapon/shoulder/wing light is a separate equipment layer.
- Cooldown and mana checks occur before consuming resources. An active action rejects another skill; the attack button can continue the existing basic combo after recovery. Pausing freezes simulation and pose. Death clears the current action and pending player waves/projectiles.

## Preserved stages

The accepted character and dragon source files, base assets, boss warning/collision module, inventory rules and four equipment slots are retained. R10.4.1, R10.3 and R10.2 checkpoint files are untouched. R10.4.2 increases legendary +0 equipment emission and selective local bloom; +12 also adds moving sword streaks and larger animated flame details. No whole-scene exposure change is used.

## Validation and limits

See the accompanying QA evidence for actual simulation tests, continuous captures, source preservation hashes, and real desktop RAF measurements. Manual-clock footage preserves the game's simulation timing, but is not a realtime performance measurement. The separate runtime smoke test records actual desktop RAF behavior.

Physical iPhone, mobile Safari, touch interaction, and PWA/offline installation have not been verified. Port 8154 is a desktop review endpoint. The parent owns final independent QA and delivery. No previous failed Library ZIP/GIF batch upload was retried.
