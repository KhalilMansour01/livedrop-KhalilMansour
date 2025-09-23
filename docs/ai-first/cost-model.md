# Cost Model — ShopLite AI Touchpoints

---

## Assumptions
- Model: GPT-4o-mini at $0.15/1K prompt tokens, $0.60/1K completion tokens
- Requests/day:  
  - Support assistant: 1,000/day (30% cache hit)  
  - Typeahead: 50,000/day (70% cache hit)  

---

### Support Assistant

- Avg tokens in: 400  
- Avg tokens out: 200  

**Calculation**  
Cost/action = (400/1000 * 0.15) + (200/1000 * 0.60)  
= 0.06 + 0.12 = **$0.18 per uncached action**  

Daily cost = $0.18 * 1000 * (1 - 0.30)  
= $0.18 * 700 = **$126/day**  

---

### Typeahead

- Avg tokens in: 50  
- Avg tokens out: 30  

**Calculation**  
Cost/action = (50/1000 * 0.15) + (30/1000 * 0.60)  
= 0.0075 + 0.018 = **$0.0255 per uncached action**  

Daily cost = $0.0255 * 50,000 * (1 - 0.70)  
= $0.0255 * 15,000 ≈ **$382.50/day**  

---

## Results
- Support assistant: Cost/action ≈ **$0.18**, Daily ≈ **$126**  
- Typeahead: Cost/action ≈ **$0.026**, Daily ≈ **$383**  

---

## Cost lever if over budget
- Reduce context length for typeahead (e.g., limit to 20 tokens).  
- Consider cheaper model (e.g., Llama 3.1 8B at 25–30% of cost).  
- Increase cache hit rates with prefix caching for typeahead.  
