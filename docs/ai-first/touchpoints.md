# AI Touchpoint Specs — ShopLite

---

## Touchpoint 1: Product Search Typeahead

**Problem statement**  
Users often abandon search because keyword-only matches miss relevant SKUs. A typeahead system that suggests products and categories as they type can improve discoverability and reduce bounce.

**Happy path**  
1. User types "snea…" into search bar.  
2. Frontend sends query fragment to typeahead API.  
3. Cache layer checks for recent results for this prefix.  
4. If cache miss, LLM (or embeddings search + LLM re-ranker) generates top 5 suggestions.  
5. Results returned within 300 ms budget.  
6. UI shows suggestions.  
7. User clicks suggestion and lands on product results page.  
8. Impression and click metrics logged.  
9. Cache updated.  
10. Downstream analytics updates "conversion via typeahead".

**Grounding & guardrails**  
- Source of truth: SKU database + embeddings index.  
- Retrieval limited to 10k SKUs this sprint.  
- Context max 200 tokens (product titles/categories only).  
- Refuse to hallucinate unseen SKUs.  

**Human-in-the-loop**  
- No direct escalation (low risk).  
- Merchants can flag bad suggestions in admin UI.  
- Review SLA: 48h to adjust embeddings/index.  

**Latency budget**  
- Cache check: 20 ms  
- Embedding/vector lookup: 80 ms  
- LLM re-rank: 150 ms  
- Network + serialization: 50 ms  
= Total p95 ≤ 300 ms  

**Error & fallback behavior**  
- On error, default to keyword match from DB.  
- If cache warm, stale results allowed ≤ 5 min TTL.  

**PII handling**  
- No PII leaves the app. Queries are plain text. Logs anonymized.  

**Success metrics**  
- Product: % of searches with typeahead suggestions (coverage).  
- Product: CTR on suggestions.  
- Business: Conversion uplift from typeahead users vs baseline.  

**Feasibility note**  
We already have SKU catalog in Postgres. An embedding index can be built with open-source (FAISS) or vector DB. Prototype step: build embeddings for SKU titles, serve top-5 search via REST with GPT re-ranker.

---

## Touchpoint 2: Support Q&A Assistant

**Problem statement**  
Users frequently ask repetitive questions (e.g., “Where is my order?” “What is the return window?”). Human agents handle these slowly, increasing costs and customer frustration. An AI assistant can instantly answer within guardrails.

**Happy path**  
1. User opens support chat.  
2. Types question: “When will order #123 ship?”  
3. Frontend sends to Support Assistant API.  
4. API checks cache for similar queries.  
5. Retrieval system fetches Policies.md and order-status API for #123.  
6. LLM composes grounded answer.  
7. Answer returned to user in ≤1200 ms.  
8. User accepts answer or asks follow-up.  
9. If confidence < threshold, escalation suggested.  
10. Agent sees flagged chat with context attached.  

**Grounding & guardrails**  
- Sources: Policies.md, FAQ.md, order-status API.  
- Context max 1500 tokens.  
- Refuse questions outside support scope (e.g., "write me code").  

**Human-in-the-loop**  
- Escalation triggers: low confidence, repeated clarifications, out-of-scope.  
- UI: “Would you like to chat with an agent?” button.  
- SLA: agent responds within 5 min.  

**Latency budget**  
- Cache check: 50 ms  
- Retrieval: 200 ms  
- LLM reasoning: 800 ms  
- Network/UI: 150 ms  
= Total p95 ≤ 1200 ms  

**Error & fallback behavior**  
- If API error, show “Check your order status [link] or connect to an agent.”  
- If Policies.md retrieval fails, fallback to canned FAQ answers.  

**PII handling**  
- Order ID only leaves app for order-status API (internal).  
- Logs anonymized. No full names or addresses stored in prompt.  

**Success metrics**  
- Product: % of questions answered without escalation.  
- Product: Average response latency (p95).  
- Business: Reduction in agent-handled tickets per day.  

**Feasibility note**  
We already have Policies.md and FAQ.md in markdown. Order-status API exists. Prototype step: wrap retrieval + GPT-4o-mini in a simple API, log user satisfaction on first answers.
