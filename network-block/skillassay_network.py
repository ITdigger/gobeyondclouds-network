# GoBeyondClouds network block + llms.txt for skillassay.com (FastAPI app on Modal).
# Apply: copy this file next to fieldlab.py in the app package and add two lines to the app factory:
#     from .skillassay_network import attach_network
#     attach_network(app)
# Then release with gbc/skillassay/lab/release/RELEASE_FIELDLAB.command (Mac). No secrets, no new dependencies.
import json, time, urllib.request
from fastapi import FastAPI
from fastapi.responses import HTMLResponse, PlainTextResponse

HUB = "https://gobeyondclouds.io"
SLUG = "skillassay"
_cache = {"at": 0.0, "reg": None}

def _registry():
    if _cache["reg"] and time.time() - _cache["at"] < 600:
        return _cache["reg"]
    try:
        with urllib.request.urlopen(HUB + "/network.json", timeout=5) as r:
            _cache["reg"] = json.loads(r.read().decode()); _cache["at"] = time.time()
    except Exception:
        _cache["reg"] = _cache["reg"] or {"ventures": []}
    return _cache["reg"]

def network_block_html() -> str:
    reg = _registry(); vs = reg.get("ventures", [])
    me = next((v for v in vs if v["slug"] == SLUG), None)
    sibs = [next((v for v in vs if v["slug"] == s), None) for s in (me or {}).get("siblings", [])]
    utm = f"?utm_source={SLUG}&utm_medium=network-block&utm_campaign=footer"
    if not vs:  # registry unreachable: one plain link, no counts
        return f'<aside id="gbc-network"><a href="{HUB}/ventures{utm}">GoBeyondClouds — all ventures</a></aside>'
    links = [f'<a href="{HUB}/ventures{utm}">All {len(vs)} ventures</a>']
    for s in [x for x in sibs if x]:
        href = s["url"] + (utm if "gobeyondclouds.io" in s["url"] else f"?utm_source={SLUG}&utm_medium=network-block")
        links.append(f'<a href="{href}">{s["name"]}</a>')
    links.append(f'<a href="{HUB}/agents{utm}">Agents: llms.txt · API · MCP</a>')
    ld = json.dumps({"@context": "https://schema.org", "@type": "Organization", "name": "SkillAssay", "url": "https://skillassay.com",
                     "parentOrganization": {"@type": "Organization", "name": "GBC SRL", "url": HUB}})
    return ('<aside id="gbc-network" style="border-top:1px solid #1E3A5F;margin-top:48px;padding:20px 0;font-size:14px;color:#94A3B8">'
            '<p style="margin:0 0 6px;letter-spacing:.15em;text-transform:uppercase;font-size:11px;color:#00D4AA">Part of the GoBeyondClouds network</p>'
            '<p style="margin:0">' + " &nbsp;·&nbsp; ".join(links) + '</p></aside>'
            f'<script type="application/ld+json">{ld}</script>')

LLMS_TXT = """# SkillAssay

> Neutral registry ranking AI agent skills on observed outcomes — real calls, real results — plus the A2A Field Lab: one published investigation a week with method, limits and a corrections log. Operated by GBC SRL, Brussels (GoBeyondClouds network).

## Use
- [Index](https://skillassay.com): outcome-ranked agent skills, free
- [Field Lab](https://skillassay.com/lab): investigations, method, corrections
- [Lab feed](https://skillassay.com/lab/feed.json) · [RSS](https://skillassay.com/lab/rss.xml)
- Readers: consultants and enterprise teams choosing or implementing agent services; agents are counted apart as machine readers.

## Network
- Hub: https://gobeyondclouds.io/llms.txt
- Registry: https://gobeyondclouds.io/network.json
- Agent Card: https://gobeyondclouds.io/.well-known/agent-card.json
- A2A Economy newsletter: https://gobeyondclouds.io/ventures/a2a-economy-news
- Relay League (A2A quiz): https://gobeyondclouds.io/ventures/relay-league
"""

def attach_network(app: FastAPI):
    @app.get("/llms.txt", response_class=PlainTextResponse)
    def llms_txt():
        return LLMS_TXT
    @app.get("/network-block.html", response_class=HTMLResponse)
    def block():
        return network_block_html()
