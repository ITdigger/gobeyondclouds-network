// MCP server for the GoBeyondClouds network — Streamable HTTP (JSON-RPC 2.0 over POST), stateless.
// Served at https://mcp.gobeyondclouds.io/mcp (and https://gobeyondclouds.io/mcp). Decision B3 = yes (2026-11-02).
// Tools: network_stats, list_ventures, skill_rank, solar_prefeasibility (key-gated), say_hello. Read-only except say_hello/log.
const API = "https://wbpslhusjnztofaefwkv.supabase.co/functions/v1/gbc-public";
const SITE = "https://gobeyondclouds.io";
const TOOLS = [
  { name: "network_stats", title: "Network statistics", annotations: { title: "Network statistics", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }, description: "Live counters of the GoBeyondClouds network (newsletter subscribers, articles written by agents, site energy forecasts, skills indexed, skill calls scored) with refreshed_at per number and the source URL.", inputSchema: { type: "object", properties: {}, additionalProperties: false } },
  { name: "list_ventures", title: "List ventures", annotations: { title: "List ventures", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }, description: "The venture registry: every GBC venture with cluster, status, one-liner, buyer, pricing, URL, agent access and siblings. Optional filter by cluster (a2a | space | energy-data) or status (live | pilot | lab | programme | data-capability | waitlist).", inputSchema: { type: "object", properties: { cluster: { type: "string" }, status: { type: "string" } }, additionalProperties: false } },
  { name: "skill_rank", title: "Skill ranking lookup (SkillAssay)", annotations: { title: "Skill ranking lookup (SkillAssay)", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }, description: "Look up an AI agent skill or category on SkillAssay (outcome-based ranking). Returns the SkillAssay URL to query and the current index size; the index itself is public at skillassay.com.", inputSchema: { type: "object", properties: { query: { type: "string", description: "skill name or category, e.g. 'web scraping'" } }, required: ["query"], additionalProperties: false } },
  { name: "solar_prefeasibility", title: "Solar pre-feasibility (SolarAnalytics EU)", annotations: { title: "Solar pre-feasibility (SolarAnalytics EU)", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }, description: "Solar pre-feasibility for a factory roof via SolarAnalytics EU (PVGIS + satellite). Requires a SolarAnalytics partner API key (api_key). Without a key, returns how to get one.", inputSchema: { type: "object", properties: { lat: { type: "number" }, lon: { type: "number" }, address: { type: "string" }, api_key: { type: "string" } }, additionalProperties: false } },
  { name: "say_hello", title: "Say hello (register your agent)", annotations: { title: "Say hello (register your agent)", readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }, description: "Introduce your agent to the network: registers a visit (your operator and purpose may be listed on gobeyondclouds.io/agents; contact is never shown) and returns the service list.", inputSchema: { type: "object", properties: { agent_name: { type: "string" }, operator: { type: "string" }, purpose: { type: "string" }, contact: { type: "string" } }, required: ["agent_name"], additionalProperties: false } },
];
const text = (s) => ({ content: [{ type: "text", text: typeof s === "string" ? s : JSON.stringify(s, null, 2) }] });
const get = (u) => fetch(u, { headers: { "User-Agent": "gbc-mcp/1.0" } }).then((r) => r.json());
async function call(name, a = {}, request) {
  fetch(`${API}/event`, { method: "POST", headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("user-agent") || "mcp-client" }, body: JSON.stringify({ event: "mcp_call", page: "/mcp", venture: name }) }).catch(() => {});
  switch (name) {
    case "network_stats": return text(await get(`${API}/stats`));
    case "list_ventures": { const r = await get(`${SITE}/network.json`).catch(() => get(`${API}/network.json`)); let v = r.ventures; if (a.cluster) v = v.filter((x) => x.cluster === a.cluster); if (a.status) v = v.filter((x) => x.status === a.status); return text({ version: r.version, count: v.length, ventures: v }); }
    case "skill_rank": { const s = await get(`${API}/stats`); return text({ query: a.query, lookup_url: `https://skillassay.com/?q=${encodeURIComponent(a.query)}`, skills_indexed: s.stats.skillassay_skills_indexed?.value, outcomes_observed: s.stats.skillassay_outcomes_observed?.value, note: "SkillAssay ranks skills on observed outcomes. The public index is at skillassay.com; the lab publishes one investigation a week." }); }
    case "solar_prefeasibility": { if (!a.api_key) return text({ status: "api_key_required", how_to: "Partner tier of SolarAnalytics EU (€149/month) includes API access: https://solaranalytics.space/partners?utm_source=gbc&utm_medium=mcp", self_serve: "Humans can order a report at https://solaranalytics.space (€0 / €9 / €29)." }); const r = await fetch("https://solaranalytics.space/api/v1/prefeasibility", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${a.api_key}` }, body: JSON.stringify({ lat: a.lat, lon: a.lon, address: a.address }) }); return text(await r.text()); }
    case "say_hello": { const r = await fetch(`${API}/hello`, { method: "POST", headers: { "Content-Type": "application/json", "X-Forwarded-For": request.headers.get("cf-connecting-ip") || "" }, body: JSON.stringify({ ...a, framework: "mcp" }) }); return text(await r.json()); }
    default: throw new Error(`unknown tool ${name}`);
  }
}
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS, DELETE", "Access-Control-Allow-Headers": "content-type, mcp-session-id, mcp-protocol-version, authorization" };
const json = (b, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });
export async function onRequest({ request }) {
  if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (request.method === "GET") return json({ name: "gobeyondclouds", transport: "streamable-http", endpoint: `${SITE}/mcp`, tools: TOOLS.map((t) => t.name), docs: `${SITE}/agents`, usage: "POST JSON-RPC 2.0: initialize, tools/list, tools/call" });
  let msg; try { msg = await request.json(); } catch { return json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "parse error" } }, 400); }
  const handle = async (m) => {
    const id = m.id ?? null;
    try {
      switch (m.method) {
        case "initialize": return { jsonrpc: "2.0", id, result: { protocolVersion: m.params?.protocolVersion || "2025-06-18", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "gobeyondclouds", version: "1.0.0", title: "GoBeyondClouds network" }, instructions: "Read-only tools over the GoBeyondClouds venture network (GBC SRL, Brussels). Numbers carry refreshed_at and a source URL; cite them." } };
        case "notifications/initialized": case "ping": return id === null ? null : { jsonrpc: "2.0", id, result: {} };
        case "tools/list": return { jsonrpc: "2.0", id, result: { tools: TOOLS } };
        case "tools/call": return { jsonrpc: "2.0", id, result: await call(m.params?.name, m.params?.arguments || {}, request) };
        default: return { jsonrpc: "2.0", id, error: { code: -32601, message: `method not found: ${m.method}` } };
      }
    } catch (e) { return { jsonrpc: "2.0", id, result: { isError: true, content: [{ type: "text", text: String(e.message || e) }] } }; }
  };
  const out = Array.isArray(msg) ? (await Promise.all(msg.map(handle))).filter(Boolean) : await handle(msg);
  if (out === null) return new Response(null, { status: 202, headers: CORS });
  return json(out);
}
