# AI Capability Map — ShopLite

| Capability | Intent (user) | Inputs (this sprint) | Risk 1–5 (tag) | p95 ms | Est. cost/action | Fallback | Selected |
|---|---|---|---|---:|---:|---|:---:|
| Product search typeahead | Find products faster by seeing suggestions while typing | SKU titles, categories, embeddings index | 2 | 300 | $0.002 | Default keyword match | ✅ |
| Support Q&A assistant | Get instant answers about orders, policies, returns | Policies.md, FAQ.md, order-status API | 3 | 1200 | $0.04 | Escalate to agent | ✅ |
| Personalized product ranking | See recommendations tailored to me | Past orders, browsing events | 4 | 400 | $0.05 | Default ranking |  |
| Auto-generate marketing copy | Merchants want product descriptions improved | Raw SKU text, LLM prompt | 5 | 2000 | $0.08 | Manual editing |  |
| Customer sentiment summarizer | Support leads want to know “top 3 issues today” | Support tickets, chat logs | 4 | 1500 | $0.06 | Manual dashboard |  |

---

## Why these two

We selected **Product search typeahead** and **Support Q&A assistant** because they are closest to core KPIs. Typeahead directly improves **conversion rate** by reducing friction in finding SKUs, and its latency/cost profile is manageable with caching. The support assistant addresses a measurable pain point — high contact rate for order status and returns — with relatively low integration risk since we already have structured sources (Policies.md, order-status API). Other options like marketing copy and recommendations may help long-term but carry higher data risk, unclear ROI, and longer integration paths.
