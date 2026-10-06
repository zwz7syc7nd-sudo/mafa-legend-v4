# R10.8 — no-element rollback baseline

Build: `R10.8-full-review`. Run `node serve.cjs` in this game folder and open `http://127.0.0.1:8164/`. Use HTTP, not `file://`. All game models, textures and the Three.js runtime are included; there is no runtime CDN or paid service. An existing Node installation is required for this launcher.

This snapshot includes the accepted character, black/red rigged dragon, four-slot equipment/drop/save flow, natural combat implementation, and the R10.8 curved enhancement light form whose visual direction was independently approved. The approved render modules are byte-identical to the R10.8 study. Weapon and armor enhancement remain independent; +1 adds blue, +2 retains blue and adds green. Elements are absent from this rollback snapshot.

Producer regression results:

- Character/equipment: 52 checks, including 192 pose samples across idle/walk/attack/hurt and eight directions; accepted bone components differ by zero. All 0–12 cumulative ranks, world/preview, rarity independence, bounded geometry, numeric data preservation, death and unequip clearing pass.
- Combat: 28 action/timing cases at 30/60 Hz; 27 event/FX assertions; 40 target-species/direction/rate cases with 120 combo contacts; 300 blade-projection samples, maximum error 0.000073 pixels.
- Boss: 20 geometry cases, 16 timing cases, 24 in/out/behind integration cases at 30/60 Hz. Warning and damage still share geometry/time.
- Equipment/drop/save: 26 recorded workflow assertions, 18 layout/visual checks, ten edge cases, nine additional actual-UI weapon/armor +1/+2 and drop/reload/re-equip assertions. Seven synthetic legacy save sentinels in an isolated browser origin remain intact. Actual user browser stores were not opened.
- Light integration: eight checks including paused flow, depth-tagged light forms and clickable drops. Actual UI unequip clears world and armory. Eighteen additional warning/active/active-plus-label screenshots cover breath, charge and slam at 844×390 and 667×375.
- Evidence includes 48 eight-direction walk/attack/hurt screenshots; four actual-game animated WebP clips (201 source frames total), raw frames, traces, current character photo and 0/1/2/12 comparison. Producer personally inspected the direction sheets, all eighteen Boss overlap images, character photo/comparison, and selected battle impact sequences. The contact sheets and remaining raw frames are available for independent review.

One desktop Chrome/Intel ANGLE run per mode at 844×390, boss plus three mobs, with 1.8 s warmup and 8 s measurement: +0 34.82 FPS (p95 33.9 ms, maximum 215.8 ms, two intervals over 100 ms); full +12 35.77 FPS (p95 33.5 ms, maximum 66.4 ms, none over 100 ms); low +12 36.20 FPS (p95 33.5 ms, maximum 66.6 ms). These are variable short desktop measurements, not proof that enhancement improves performance, a steady 60 FPS guarantee, or phone benchmarks.

Limits: physical iPhone, Safari, touch, PWA/offline installation and long-session thermal/battery behavior have not been tested. The retained legacy offline installer is outside this QA scope; use the local HTTP launcher for this candidate. The lighting is depth-tested curved ribbon geometry with procedural opacity and selective bloom, not volumetric ray marching. Some label boxes obscure the character when drops cluster; warning boundaries and label text remain readable in sampled overlap views. Tiny game pixels do not establish detailed facial readability.

See `R10_ASSETS_AND_LICENSES.md`, `ASSET_NOTES.txt`, and `vendor/three/LICENSE` for provenance. Existing asset rights are preserved. R10.8 light geometry/shaders are authored locally; no new downloaded or paid asset was used. No deployment, push, system installation or Library write was performed for this baseline.

Full local QA, scripts and source-frame evidence remain in the sibling `release-r10.8/qa` and `release-r10.8/tools`. This is the rollback baseline before the separately authorized minimal random weapon-element extension.
