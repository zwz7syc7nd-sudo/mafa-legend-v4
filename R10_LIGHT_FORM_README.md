# R10.7 local light-form revision

Run `node serve.cjs`, then open http://127.0.0.1:8160 in a separate browser profile. This build uses `mafa-r10-light-form-task4-v1`; previous saves and accepted checkpoints are preserved.

`r10-upgrade-colors.js` replaces enhancement wire outlines with local flowing, softly edged flame surfaces, small radiance sources and a fixed starlet pool. Weapon and armor enhancement remain independent. +1 adds blue; +2 retains it and adds green. +0 base appearance remains unchanged. For enhanced equipment only, old gold emission is reduced to make the new color readable.

The character skeleton, accepted armor geometry, boss and combat rules are unchanged. Effects are attached to existing equipment/bones and selected animated cape vertices. This is a crossed-surface flame and selective bloom approximation, not a volumetric renderer.

This revision awaits independent parent visual QA. Numeric/functional tests alone do not establish visual acceptance. See the separate QA evidence ZIP for native screenshots, motion frames, videos, test results and preservation hashes. No elemental damage implementation or physical iPhone/Safari/PWA validation is included.
