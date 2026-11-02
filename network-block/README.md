# Network block — the same footer block on every GBC site (concept §3.3)

Source of truth: `gobeyondclouds.io/network.json` (generated from `ventures.json` in the hub repo). Every file here reads or mirrors it.

| File | For | How to apply | Status 2026-11-02 |
|---|---|---|---|
| `snippet.html` | any static site (Space Whizz, Relay League pages, quizzes) | paste before `</body>`, set `data-current` to the venture slug | ready |
| `lovable-prompt-solaranalytics.md` | solaranalytics.space (Lovable) | paste the prompt into the Lovable project, publish | owner item (Lovable needs a human) |
| `beehiiv-footer.html` | workfutures.report, spacesolar.news (Beehiiv) | Beehiiv → Settings → Email → footer HTML | owner item (no Beehiiv API key yet) |
| `skillassay_network.py` | skillassay.com (FastAPI on Modal) | copy next to `fieldlab.py`, two lines in the app factory (see file header), release with `gbc/skillassay/lab/release/RELEASE_FIELDLAB.command` | prepared; release is a Mac double-click |
| `sister-llms-network-sections.md` | every sister `llms.txt` | append the `## Network` section | ready |

The hub itself renders the block from the registry (component `NetworkBlock` in `src/components/hub/index.tsx`).
