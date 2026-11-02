# GoBeyondClouds network

Registry, machine layer and MCP server of the GoBeyondClouds venture network (GBC SRL, Brussels). Everything in this repository is already public on [gobeyondclouds.io](https://gobeyondclouds.io); the repo exists so agents and developers can read the sources, pin a version and open issues.

Generated 2026-11-02 from the hub build. Do not edit by hand: changes land through the hub repository and are exported by `scripts/export-public.mjs`.

## Endpoints

| Name | URL | Protocol | Auth | Rate limit | Status |
|---|---|---|---|---|---|
| registry | `https://gobeyondclouds.io/network.json` | rest GET | none | unlimited, cached 10 min | live |
| stats | `https://wbpslhusjnztofaefwkv.supabase.co/functions/v1/gbc-public/stats` | rest GET | none | 60/min | live |
| activity | `https://wbpslhusjnztofaefwkv.supabase.co/functions/v1/gbc-public/activity` | rest GET | none | 60/min | live |
| feed | `https://gobeyondclouds.io/feed.json` | jsonfeed GET | none | unlimited | live |
| hello | `https://wbpslhusjnztofaefwkv.supabase.co/functions/v1/gbc-public/hello` | rest POST | none | 3/min | live |
| waitlist | `https://wbpslhusjnztofaefwkv.supabase.co/functions/v1/gbc-public/waitlist` | rest POST | none | 3/min | live |
| mcp | `https://mcp.gobeyondclouds.io/mcp` | mcp (streamable-http) | none (api-key for solar_prefeasibility) | — | live |

- Site policy: https://gobeyondclouds.io/terms · Contact: hello@gobeyondclouds.io
- llms.txt: https://gobeyondclouds.io/llms.txt · Agent card: https://gobeyondclouds.io/.well-known/agent-card.json
- Training: allowed (content signal ai-train=yes on this zone; see robots.txt Content-Signal) · Attribution: cite the venture URL or gobeyondclouds.io

## MCP server

`https://mcp.gobeyondclouds.io/mcp` — Streamable HTTP, no authentication. Tools: `network_stats`, `list_ventures`, `skill_rank`, `solar_prefeasibility` (optional SolarAnalytics partner API key), `say_hello` (the only write: registers a visit). Source: [`mcp/mcp.js`](mcp/mcp.js) (Cloudflare Pages Function in front of the `gbc-public` edge function). Every number carries `refreshed_at` and a source URL.

Add it to Claude as a custom connector (authentication: none) or to any MCP client that supports Streamable HTTP.

## Ventures (14)

| Venture | Cluster | Status | URL |
|---|---|---|---|
| SolarAnalytics EU | energy-data | live | [solaranalytics.space](https://solaranalytics.space) |
| Work Futures Report | a2a | live | [workfutures.report](https://workfutures.report) |
| Space Solar News | space | live | [spacesolar.news](https://spacesolar.news) |
| A2A Economy (newsletter) | a2a | pilot | [gobeyondclouds.io/ventures/a2a-economy-news](https://gobeyondclouds.io/ventures/a2a-economy-news) |
| SkillAssay | a2a | live | [skillassay.com](https://skillassay.com) |
| Relay League | a2a | lab | [gobeyondclouds.io/ventures/relay-league](https://gobeyondclouds.io/ventures/relay-league) |
| Space Whizz | space | waitlist | [gobeyondclouds.io/ventures/space-whizz](https://gobeyondclouds.io/ventures/space-whizz) |
| Space economy intel | space | programme | [gobeyondclouds.io/space](https://gobeyondclouds.io/space) |
| Site energy forecasts (data capability) | energy-data | data-capability | [gobeyondclouds.io/ventures/sitecast](https://gobeyondclouds.io/ventures/sitecast) |
| CBAM Copilot | energy-data | waitlist | [gobeyondclouds.io/ventures/cbam](https://gobeyondclouds.io/ventures/cbam) |
| Art. 50 Kit | energy-data | waitlist | [gobeyondclouds.io/ventures/art50](https://gobeyondclouds.io/ventures/art50) |
| SubsidyRadar | energy-data | waitlist | [gobeyondclouds.io/ventures/subsidyradar](https://gobeyondclouds.io/ventures/subsidyradar) |
| SpaceTenders | space | waitlist | [gobeyondclouds.io/ventures/spacetenders](https://gobeyondclouds.io/ventures/spacetenders) |
| FlexIntel | energy-data | waitlist | [gobeyondclouds.io/ventures/flexintel](https://gobeyondclouds.io/ventures/flexintel) |

Full registry with buyer, pricing, agent access and siblings: [`ventures.json`](ventures.json) (same content as https://gobeyondclouds.io/network.json).

## Files

- `ventures.json` — the registry (single source of truth for the hub site, the MCP server and the sister sites)
- `scripts/gen-machine-layer.mjs` — generates llms.txt, llms-full.txt, network.json, robots.txt, sitemaps, `.well-known/{agent-card.json, agents.json, agents.txt}`, feed.xml/feed.json and OG images from the registry
- `mcp/mcp.js` — the MCP server
- `well-known/` — the current agents.json and agent-card.json as served
- `network-block/` — the shared "network" footer block for sister sites (HTML snippet, Python helper, Beehiiv footer, llms.txt sections)

## Licence

Code: MIT (see LICENSE). Registry data (`ventures.json`, `well-known/*`): CC BY 4.0 — cite the venture URL or gobeyondclouds.io.
