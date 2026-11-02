# Lovable prompt — SolarAnalytics EU (solaranalytics.space): add the GoBeyondClouds network block

Paste into the Lovable project of solaranalytics.space (GBC account). One change, no design rework.

```
Add a shared "network block" component and show it directly above the site footer on every page.

Component NetworkBlock:
- On mount, fetch https://gobeyondclouds.io/network.json (JSON). Find the entry with slug "solaranalytics" in ventures[]; its "siblings" array holds two slugs. Resolve each sibling to its entry (name, url).
- Render, dark background matching the footer, small text:
  Overline (uppercase, letter-spaced, accent colour): "Part of the GoBeyondClouds network"
  One line of links: "All <ventures.length> ventures" → https://gobeyondclouds.io/ventures?utm_source=solaranalytics&utm_medium=network-block&utm_campaign=footer ·
  <sibling 1 name> → sibling url + "?utm_source=solaranalytics&utm_medium=network-block" · <sibling 2 name> (same) ·
  "Agents: llms.txt · API · MCP" → https://gobeyondclouds.io/agents?utm_source=solaranalytics&utm_medium=network-block&utm_campaign=footer
- If the fetch fails, render only "GoBeyondClouds — all ventures" linking to https://gobeyondclouds.io/ventures.
- Add JSON-LD to the document head: {"@context":"https://schema.org","@type":"Organization","name":"SolarAnalytics EU","url":"https://solaranalytics.space","parentOrganization":{"@type":"Organization","name":"GBC SRL","url":"https://gobeyondclouds.io"}}
- No cookies, no analytics, no external scripts.
Also: in public/llms.txt append the section

## Network
- Hub: https://gobeyondclouds.io/llms.txt
- Registry: https://gobeyondclouds.io/network.json
- Space Solar News: https://spacesolar.news/llms.txt
- Site energy forecasts (data capability): https://gobeyondclouds.io/ventures/sitecast

and remove the EnergyOps line (decision C-b, 2026-11-02).
```
