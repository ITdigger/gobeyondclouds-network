// Generates the whole machine layer from ventures.json — never hand-written twice.
// Output (public/): llms.txt, llms-full.txt, network.json, robots.txt, sitemap.xml, sitemap-network.xml,
//   .well-known/agent-card.json, .well-known/agents.json, .well-known/agents.txt, feed.xml, feed.json,
//   <indexnow-key>.txt, og/<page>.png
// Run: node scripts/gen-machine-layer.mjs   (also part of `npm run build`)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(root, "public");
const reg = JSON.parse(fs.readFileSync(path.join(root, "ventures.json"), "utf8"));
const n = reg.network, SITE = n.url, API = n.api;
const ORDER = ["live", "pilot", "lab", "programme", "data-capability", "waitlist"];
const ventures = [...reg.ventures].sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status) || a.name.localeCompare(b.name));
const today = new Date().toISOString().slice(0, 10);
const w = (rel, body) => { const p = path.join(pub, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, body); console.log("wrote", rel, `${body.length} B`); };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const vpath = (v) => `/ventures/${v.slug}`;
const by = (c) => ventures.filter((v) => v.cluster === c);
const INDEXNOW_KEY = "a7c1e4f0b9d24f8e8c3b6a5d2e1f0c9b";   // public by design (IndexNow verifies the file at /<key>.txt)

/* ---------- network.json ---------- */
w("network.json", JSON.stringify({ generated_at: new Date().toISOString(), version: reg.version, network: n, status_legend: reg.status_legend, ventures, credentials: reg.credentials, feeds: reg.feeds }, null, 2) + "\n");

/* ---------- llms.txt ---------- */
const vline = (v) => `- [${v.name}](${v.url}): ${v.one_liner} Status: ${v.status}. Buyer: ${v.buyer}.${v.pricing ? " Pricing: " + v.pricing + "." : ""} Agent access: ${v.agent_access.type} (${v.agent_access.status}).${v.llms_txt ? ` llms.txt: ${v.llms_txt}` : ""}`;
const llms = [
  "# GoBeyondClouds (GBC)", "",
  `> Brussels venture network (GBC SRL) building AI micro-services where space data, AI agents and the energy transition meet. ${ventures.length} ventures in three clusters; every venture runs independently; GoBeyondClouds is the network behind them. Registry version ${reg.version}.`, "",
  `Contact: ${n.email} · Legal: ${n.legal}, ${n.vat}, ${n.address} · Founder: ${n.founder}`, "",
  `## A2A cluster — ${n.clusters.a2a.title} (${SITE}/a2a)`, ...by("a2a").map(vline), "",
  `## Space cluster — ${n.clusters.space.title} (${SITE}/space)`, ...by("space").map(vline), "",
  `## Energy data cluster — ${n.clusters["energy-data"].title} (${SITE}/energy-data)`, ...by("energy-data").map(vline), "",
  "## For agents",
  `- [Agent Card (A2A)](${SITE}/.well-known/agent-card.json): every callable GBC service with endpoint and auth`,
  `- [agents.json](${SITE}/.well-known/agents.json) / [agents.txt](${SITE}/.well-known/agents.txt): sanctioned endpoints, protocols, rate limits`,
  `- [Network registry JSON](${SITE}/network.json): all ventures with status, pricing, agent access, siblings`,
  `- [Live stats JSON](${API}/stats): counters with refreshed_at per number`,
  `- [Agent activity feed](${API}/activity): what the GBC agent fleet did, last 24h`,
  `- [Network feed](${SITE}/feed.json): merged items from all network sources (RSS: ${SITE}/feed.xml)`,
  `- [Full text for LLMs](${SITE}/llms-full.txt): every venture page and the agents page as Markdown`,
  `- [Introduce yourself](${API}/hello): POST JSON {agent_name, operator, purpose, contact}`,
  `- [Human-readable agents page](${SITE}/agents)`, "",
  "## Credentials (built by the same team, other legal entities)", ...reg.credentials.map((c) => `- [${c.name}](${c.url}): ${c.one_liner}`), "",
  "## Context", `- [About GBC](${SITE}/about)`, `- [Network status](${SITE}/network-status): uptime of every domain and the age of every number`, `- [Legal](${SITE}/legal) · [Privacy](${SITE}/privacy) · [Terms](${SITE}/terms)`, "",
  "## Network", ...ventures.filter((v) => v.llms_txt).map((v) => `- ${v.name}: ${v.llms_txt}`),
].join("\n") + "\n";
w("llms.txt", llms);

/* ---------- llms-full.txt ---------- */
const vfull = (v) => [
  `## ${v.name}`, "", `URL: ${v.url}`, `Hub page: ${SITE}${vpath(v)}`, `Cluster: ${n.clusters[v.cluster].title}`, `Status: ${v.status} — ${reg.status_legend[v.status]}`, `Legal entity: ${v.entity} · since ${v.since}`, "",
  v.one_liner, "", `Who buys it: ${v.buyer}`, `Price: ${v.pricing}`, `Agent access: ${v.agent_access.type} (${v.agent_access.status})${v.agent_access.auth ? ", auth: " + v.agent_access.auth : ""}${v.agent_access.docs ? ", docs: " + v.agent_access.docs : ""}`,
  v.llms_txt ? `llms.txt: ${v.llms_txt}` : "", v.feed ? `Feed: ${v.feed}` : "",
  v.proof.length ? `Proof numbers (live values at the URL): ${v.proof.map((p) => `${p.label} → ${p.value_source_url}`).join("; ")}` : "",
  `Siblings in the network: ${v.siblings.map((s) => { const sv = ventures.find((x) => x.slug === s); return sv ? `${sv.name} (${SITE}${vpath(sv)})` : s; }).join(", ")}`,
  v.status === "waitlist" ? `Waitlist: POST ${API}/waitlist {"venture":"${v.slug}","email":"…"} or the form on ${SITE}${vpath(v)}` : "", "",
].filter((l) => l !== null).join("\n");
const full = [
  "# GoBeyondClouds — full text for LLMs", "", `Generated ${today} from the registry (version ${reg.version}). Source of truth: ${SITE}/network.json. Short index: ${SITE}/llms.txt.`, "",
  "# Network", "", `${n.name} is the venture network of ${n.legal} (${n.vat}, ${n.address}), founded ${n.founded}, run by ${n.founder}. ${ventures.length} ventures in three clusters. Newsletters are researched, written and sent by agents under human editorial oversight; forecasts are computed by agents; every number on the site links to the JSON it came from (${API}/stats).`, "",
  ...["a2a", "space", "energy-data"].flatMap((c) => [`# ${n.clusters[c].title} (${SITE}${n.clusters[c].path})`, "", n.clusters[c].one_liner, "", ...by(c).map(vfull)]),
  "# For agents (" + SITE + "/agents)", "",
  "Every GBC service is published in a form a machine can discover, read and call.",
  `- Agent Card (A2A): ${SITE}/.well-known/agent-card.json`, `- agents.json / agents.txt: ${SITE}/.well-known/agents.json`, `- Registry: ${SITE}/network.json`, `- Stats: ${API}/stats · Activity: ${API}/activity · Visitors: ${API}/visitors · Status: ${API}/status`,
  `- Feed: ${SITE}/feed.json (RSS ${SITE}/feed.xml)`, `- Hello: POST ${API}/hello {"agent_name","operator","purpose","contact"} — 3 per minute`, `- MCP (live): https://mcp.gobeyondclouds.io/mcp (Streamable HTTP, no auth) with tools network_stats, list_ventures, skill_rank, solar_prefeasibility (key), say_hello`,
  `- Payments: card (Stripe), SEPA; x402/USDC per call planned.`, "", "# Credentials", "", ...reg.credentials.map((c) => `- ${c.name} (${c.entity}): ${c.one_liner} ${c.url}`), "",
].join("\n") + "\n";
w("llms-full.txt", full);

/* ---------- agent-card.json (A2A) ---------- */
w(".well-known/agent-card.json", JSON.stringify({
  name: "GoBeyondClouds", description: "Brussels-based venture network building AI micro-services where space data, AI agents and the energy transition meet. This card lists every GBC service an agent can call or read.",
  url: SITE, provider: { organization: n.legal, url: SITE, legal: `${n.vat}, ${n.address}` }, version: reg.version, documentationUrl: `${SITE}/agents`,
  capabilities: { streaming: false, pushNotifications: false, stateTransitionHistory: false },
  defaultInputModes: ["text/plain", "application/json"], defaultOutputModes: ["application/json", "application/pdf", "text/plain"],
  skills: [
    { id: "network-registry", name: "Venture registry", description: "Every GBC venture with status, buyer, pricing, agent access and sibling links.", tags: ["meta"], endpoint: `${SITE}/network.json`, access: "open" },
    { id: "network-stats", name: "Live network statistics", description: "Public counters and agent-activity feed for the GBC network, refreshed_at per number.", tags: ["meta"], endpoint: `${API}/stats`, access: "open" },
    { id: "network-feed", name: "Network feed", description: "Merged items from all network sources (newsletters, lab, intel).", tags: ["media", "rss"], endpoint: `${SITE}/feed.json`, access: "open" },
    { id: "solar-prefeasibility", name: "Solar pre-feasibility report", description: "Given a factory address or coordinates, returns PV yield, payback and a bankable PDF (PVGIS/Copernicus).", tags: ["energy", "solar", "eu"], examples: ["Estimate rooftop PV potential for a plant at 50.85,4.35"], endpoint: "https://solaranalytics.space", access: "partner api-key" },
    { id: "skill-ranking", name: "Rank AI agent skills by observed outcomes", description: "Returns outcome-based quality and market price for a named agent skill or category.", tags: ["agents", "trust", "pricing"], examples: ["Which web-scraping skill has the best observed success rate this quarter?"], endpoint: "https://skillassay.com", access: "open index" },
    { id: "site-energy-forecast", name: "Site energy forecast (data capability)", description: "Local weather-driven energy forecast for an industrial site (WeatherNext 3). Network data on request, not sold as a product.", tags: ["energy", "weather", "forecast"], endpoint: `${SITE}/ventures/sitecast`, access: "request" },
    { id: "waitlist", name: "Join a venture waitlist", description: "POST {venture, email, note} for any venture with status waitlist.", tags: ["meta"], endpoint: `${API}/waitlist`, access: "open" },
    { id: "hello", name: "Introduce your agent", description: "POST {agent_name, operator, purpose, contact} to register a visit and receive the service list.", tags: ["meta"], endpoint: `${API}/hello`, access: "open, 3/min" },
  ],
  interfaces: { rest: API, mcp: { url: "https://mcp.gobeyondclouds.io/mcp", status: "live", transport: "streamable-http" }, rss: `${SITE}/feed.xml`, llms_txt: `${SITE}/llms.txt` },
  payments: { accepted: ["card (Stripe)", "SEPA"], agent_native: { protocol: "x402 / USDC on Base", status: "planned" } },
  contact: { email: n.email, human_page: `${SITE}/agents` },
}, null, 2) + "\n");

/* ---------- agents.json / agents.txt (draft-car-agents-txt-wellknown-00) ---------- */
const agentsJson = {
  version: "0.1", generated: today, site: SITE, policy: `${SITE}/terms`, contact: n.email, llms_txt: `${SITE}/llms.txt`, agent_card: `${SITE}/.well-known/agent-card.json`,
  allow: ["/", "/ventures", "/ventures/*", "/a2a", "/space", "/energy-data", "/agents", "/insights", "/network-status", "/llms.txt", "/llms-full.txt", "/network.json", "/feed.xml", "/feed.json", "/.well-known/*"],
  disallow: ["/dashboard", "/dashboard/*"],
  endpoints: [
    { name: "registry", url: `${SITE}/network.json`, protocol: "rest", method: "GET", auth: "none", rate_limit: "unlimited, cached 10 min" },
    { name: "stats", url: `${API}/stats`, protocol: "rest", method: "GET", auth: "none", rate_limit: "60/min" },
    { name: "activity", url: `${API}/activity`, protocol: "rest", method: "GET", auth: "none", rate_limit: "60/min" },
    { name: "feed", url: `${SITE}/feed.json`, protocol: "jsonfeed", method: "GET", auth: "none", rate_limit: "unlimited" },
    { name: "hello", url: `${API}/hello`, protocol: "rest", method: "POST", auth: "none", rate_limit: "3/min" },
    { name: "waitlist", url: `${API}/waitlist`, protocol: "rest", method: "POST", auth: "none", rate_limit: "3/min" },
    { name: "mcp", url: "https://mcp.gobeyondclouds.io/mcp", protocol: "mcp", transport: "streamable-http", auth: "none (api-key for solar_prefeasibility)", status: "live", tools: ["network_stats", "list_ventures", "skill_rank", "solar_prefeasibility", "say_hello"], source: "https://github.com/ITdigger/gobeyondclouds-network" },
  ],
  training: "allowed (content signal ai-train=yes on this zone; see robots.txt Content-Signal)", attribution: "cite the venture URL or gobeyondclouds.io",
};
w(".well-known/agents.json", JSON.stringify(agentsJson, null, 2) + "\n");
w(".well-known/agents.txt", [
  `# agents.txt — ${SITE} (draft-car-agents-txt-wellknown-00)`, `Version: 0.1`, `Generated: ${today}`, `Contact: ${n.email}`, `Policy: ${SITE}/terms`, `LLMs-Txt: ${SITE}/llms.txt`, `Agent-Card: ${SITE}/.well-known/agent-card.json`, `Agents-Json: ${SITE}/.well-known/agents.json`, "",
  ...agentsJson.allow.map((p) => `Allow: ${p}`), ...agentsJson.disallow.map((p) => `Disallow: ${p}`), "",
  ...agentsJson.endpoints.map((e) => `Endpoint: ${e.name} ${e.method ?? ""} ${e.url} protocol=${e.protocol} auth=${e.auth} rate=${e.rate_limit ?? "n/a"}${e.status ? " status=" + e.status : ""}`.replace(/\s+/g, " ")),
].join("\n") + "\n");

/* ---------- robots.txt ---------- */
w("robots.txt", [
  "# gobeyondclouds.io — humans and agents welcome. Machine layer: /llms.txt · /.well-known/agent-card.json · /.well-known/agents.json · /network.json",
  "# Content Signals (contentsignals.org): search=yes, ai-input=yes (cite us), ai-train=yes", "Content-Signal: search=yes, ai-input=yes, ai-train=yes", "", "User-agent: *", "Allow: /", "Disallow: /dashboard/", "",
  ...["GPTBot", "ChatGPT-User", "OAI-SearchBot", "ClaudeBot", "anthropic-ai", "Claude-User", "Claude-SearchBot", "PerplexityBot", "Perplexity-User", "Google-Extended", "Googlebot", "bingbot", "DuckAssistBot", "Applebot-Extended", "meta-externalagent", "CCBot"].flatMap((ua) => [`User-agent: ${ua}`, "Allow: /", ""]),
  `Sitemap: ${SITE}/sitemap.xml`, `Sitemap: ${SITE}/sitemap-network.xml`, "", `# llms.txt: ${SITE}/llms.txt`, `# IndexNow key: ${SITE}/${INDEXNOW_KEY}.txt`,
].join("\n") + "\n");
w(`${INDEXNOW_KEY}.txt`, INDEXNOW_KEY);

/* ---------- sitemaps ---------- */
const pages = ["/", "/ventures", ...ventures.map(vpath), "/a2a", "/space", "/energy-data", "/agents", "/insights", "/network-status", "/about", "/legal", "/privacy", "/terms"];
w("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((p) => `  <url><loc>${SITE}${p}</loc><lastmod>${today}</lastmod><changefreq>${p === "/insights" || p === "/" ? "daily" : "weekly"}</changefreq></url>`).join("\n")}\n</urlset>\n`);
const sisterMaps = ventures.filter((v) => !v.url.startsWith(SITE)).map((v) => `${v.url.replace(/\/$/, "")}/sitemap.xml`);
w("sitemap-network.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${SITE}/sitemap.xml</loc><lastmod>${today}</lastmod></sitemap>\n${sisterMaps.map((u) => `  <sitemap><loc>${u}</loc></sitemap>`).join("\n")}\n</sitemapindex>\n`);

/* ---------- feeds (merged network feed + weekly "agents did" digest) ---------- */
const pick = (xml, tag) => { const m = xml.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`)); return m ? m[1].trim() : ""; };
const items = [];
for (const f of reg.feeds.filter((f) => /\.(xml|rss)$/.test(f.url))) {
  try {
    const xml = await (await fetch(f.url, { headers: { "User-Agent": "gbc-hub-build/1.0" }, signal: AbortSignal.timeout(15000) })).text();
    for (const b of xml.split("<item>").slice(1, 15)) items.push({ id: pick(b, "guid") || pick(b, "link"), url: pick(b, "link"), title: pick(b, "title").replace(/<[^>]+>/g, ""), date: new Date(pick(b, "pubDate")).toISOString(), summary: pick(b, "description").replace(/<[^>]+>/g, "").slice(0, 400), source: f.name, cluster: f.cluster });
  } catch (e) { console.warn("feed skipped", f.url, e.message); }
}
try {
  const a = await (await fetch(`${API}/activity?limit=200`, { signal: AbortSignal.timeout(15000) })).json();
  const week = new Date(Date.now() - 7 * 86400000).toISOString();
  const rows = (a.items ?? []).filter((r) => r.ts > week);
  const byV = {}; for (const r of rows) (byV[r.venture] ??= []).push(r);
  const summary = Object.entries(byV).map(([v, rs]) => `${v}: ${rs.length} actions (${[...new Set(rs.map((r) => r.action))].slice(0, 4).join(", ")})`).join("; ");
  const wk = `${today.slice(0, 4)}-W${String(Math.ceil((((new Date(today) - new Date(today.slice(0, 4) + "-01-01")) / 86400000) + new Date(today.slice(0, 4) + "-01-01").getDay() + 1) / 7)).padStart(2, "0")}`;
  if (rows.length) items.push({ id: `${SITE}/agents#${wk}`, url: `${SITE}/agents`, title: `What the agents did this week (${wk}): ${rows.length} actions`, date: new Date().toISOString(), summary: `${summary}. Live log: ${API}/activity`, source: "GBC agent activity digest", cluster: "network" });
} catch (e) { console.warn("activity digest skipped", e.message); }
items.sort((a, b) => (a.date < b.date ? 1 : -1));
w("feed.json", JSON.stringify({ version: "https://jsonfeed.org/version/1.1", title: "GoBeyondClouds network feed", home_page_url: SITE, feed_url: `${SITE}/feed.json`, description: "Merged items from every GoBeyondClouds network source plus the weekly agent-activity digest.", language: "en", authors: [{ name: n.legal, url: SITE }], items: items.slice(0, 50).map((i) => ({ id: i.id, url: i.url, title: i.title, date_published: i.date, summary: i.summary, authors: [{ name: i.source }], tags: [i.cluster, i.source] })) }, null, 2) + "\n");
w("feed.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>GoBeyondClouds network feed</title><link>${SITE}</link><description>Merged items from every GoBeyondClouds network source plus the weekly agent-activity digest.</description><language>en</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate><atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>\n${items.slice(0, 50).map((i) => `<item><title>${esc(i.title)}</title><link>${esc(i.url)}</link><guid isPermaLink="false">${esc(i.id)}</guid><pubDate>${new Date(i.date).toUTCString()}</pubDate><category>${esc(i.cluster)}</category><source url="${esc(i.url)}">${esc(i.source)}</source><description>${esc(i.summary)}</description></item>`).join("\n")}\n</channel></rss>\n`);

/* ---------- OG images (1200×630 PNG per page, no placeholders) ---------- */
let Resvg = null;
try { ({ Resvg } = await import("@resvg/resvg-js")); } catch { console.warn("resvg not available — OG images skipped"); }
if (Resvg) {
  const og = (title, sub, tag) => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0B1426"/><stop offset="1" stop-color="#1E3A5F"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/><rect x="0" y="0" width="14" height="630" fill="#00D4AA"/><text x="80" y="110" font-family="sans-serif" font-size="26" letter-spacing="6" fill="#00D4AA">${esc(tag.toUpperCase())}</text><text x="80" y="230" font-family="sans-serif" font-weight="700" font-size="${title.length > 34 ? 52 : 68}" fill="#F0F4F8">${esc(title.slice(0, 48))}</text><text x="80" y="310" font-family="sans-serif" font-size="30" fill="#94A3B8">${esc(sub.slice(0, 70))}</text>${sub.length > 70 ? `<text x="80" y="355" font-family="sans-serif" font-size="30" fill="#94A3B8">${esc(sub.slice(70, 140))}</text>` : ""}<text x="80" y="560" font-family="sans-serif" font-weight="700" font-size="34" fill="#00D4AA">gobeyondclouds.io</text><text x="420" y="560" font-family="sans-serif" font-size="26" fill="#94A3B8">${esc(n.legal)} · Brussels · ${ventures.length} ventures</text></svg>`;
  const render = (name, svg) => { const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng(); fs.mkdirSync(path.join(pub, "og"), { recursive: true }); fs.writeFileSync(path.join(pub, "og", `${name}.png`), png); };
  render("home", og("A venture network run by agents", `${ventures.length} ventures · A2A · Space · Energy data`, "GoBeyondClouds"));
  render("ventures", og("Ventures", "Status, buyer, price and agent access for every service", "Registry"));
  render("agents", og("Agents welcome.", "llms.txt · Agent Card · agents.json · API · feed", "For agents"));
  render("insights", og("Insights", "What the network published this week", "Auto-fed"));
  render("network-status", og("Network status", "Uptime of every domain, age of every number", "Transparency"));
  render("about", og("About GoBeyondClouds", "GBC SRL, Brussels, founded 2008", "About"));
  render("legal", og("Legal notice", n.legal, "Legal")); render("privacy", og("Privacy", n.legal, "Legal")); render("terms", og("Terms", n.legal, "Legal"));
  for (const c of ["a2a", "space", "energy-data"]) render(c, og(n.clusters[c].title, n.clusters[c].one_liner, `${n.clusters[c].name} cluster`));
  for (const v of ventures) render(`ventures-${v.slug}`, og(v.name, v.one_liner, `${v.status} · ${n.clusters[v.cluster].name}`));
  console.log("wrote og/*.png");
}
console.log(`machine layer generated for ${ventures.length} ventures (registry ${reg.version})`);
