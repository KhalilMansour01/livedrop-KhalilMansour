# Ground Truth Q&A for Testing

### Q01: How do I make a seller account?
**Expected retrieval context:** Document 8: Becoming a Seller
**Authoritative answer:** You need to apply for a seller account with your business information and tax ID. It takes 2-3 days to get approved.
**Required keywords in LLM response:** ["seller account", "business information", "2-3 days", "approved"]
**Forbidden content:** ["instant", "no verification", "personal account"]

### Q02: What payment methods can I use?
**Expected retrieval context:** Document 4: Payment Options and Safety
**Authoritative answer:** You can use credit cards like Visa and MasterCard, PayPal, or Shoplite Wallet. All methods are secure.
**Required keywords in LLM response:** ["credit cards", "PayPal", "Shoplite Wallet", "secure"]
**Forbidden content:** ["bank transfers", "cash", "unsafe"]

### Q03: How long do I have to return something?
**Expected retrieval context:** Document 6: Returns and Getting Your Money Back
**Authoritative answer:** Most items can be returned within 30 days of delivery. Electronics only have 14 days.
**Required keywords in LLM response:** ["30 days", "return", "electronics", "14 days"]
**Forbidden content:** ["60 days", "no returns", "always"]

### Q04: How long do items stay in my cart?
**Expected retrieval context:** Document 2: Shopping Cart Basics
**Authoritative answer:** Items stay in your cart for 30 days if you're logged in, then they get removed automatically.
**Required keywords in LLM response:** ["30 days", "cart", "saved", "automatically removed"]
**Forbidden content:** ["7 days", "forever", "immediately"]

### Q05: How much does it cost to sell on Shoplite?
**Expected retrieval context:** Document 10: Seller Fees and Getting Paid
**Authoritative answer:** Sellers pay 8.5% commission plus 2.9% payment fee. Premium accounts cost $29.99 monthly with 6.5% commission.
**Required keywords in LLM response:** ["8.5%", "2.9%", "$29.99", "6.5%"]
**Forbidden content:** ["free", "no fees", "monthly only"]

### Q06: How can I see where my order is?
**Expected retrieval context:** Document 5: Tracking Your Order
**Authoritative answer:** You get a tracking number by email and can check it in your account. Regular shipping takes 3-5 days.
**Required keywords in LLM response:** ["tracking number", "email", "account", "3-5 days"]
**Forbidden content:** ["no tracking", "weeks", "can't track"]

### Q07: How do I contact customer service?
**Expected retrieval context:** Document 11: Getting Help from Customer Service
**Authoritative answer:** We have 24/7 support through live chat (2 minutes), email (4 hours), and phone (5 minutes).
**Required keywords in LLM response:** ["24/7", "live chat", "email", "phone", "2 minutes"]
**Forbidden content:** ["9-5", "no phone", "days to respond"]

### Q08: Can anyone write product reviews?
**Expected retrieval context:** Document 7: Writing Product Reviews
**Authoritative answer:** Only people who bought the item can review it within 90 days of purchase. Reviews are checked before posting.
**Required keywords in LLM response:** ["bought the item", "90 days", "checked before posting"]
**Forbidden content:** ["anyone", "no rules", "immediate posting"]

### Q09: What special features does the mobile app have?
**Expected retrieval context:** Document 12: Shoplite Mobile App
**Authoritative answer:** The app has barcode scanning, augmented reality, shake-to-search, and works offline for browsing.
**Required keywords in LLM response:** ["barcode scanning", "augmented reality", "shake-to-search", "offline"]
**Forbidden content:** ["same as website", "no extra features", "online only"]

### Q10: How do sellers manage their products?
**Expected retrieval context:** Document 9: Managing Your Products as a Seller
**Authoritative answer:** Sellers use their dashboard to add, edit, or remove products. They get alerts when stock is low.
**Required keywords in LLM response:** ["dashboard", "add products", "edit products", "low stock alerts"]
**Forbidden content:** ["email us", "manual only", "no alerts"]

### Q11: What do I need to make an account?
**Expected retrieval context:** Document 1: How to Make a Shoplite Account
**Authoritative answer:** You need an email address and a password with at least 8 characters including a number. Email verification is required.
**Required keywords in LLM response:** ["email", "password", "8 characters", "email verification"]
**Forbidden content:** ["phone number", "simple password", "no verification"]

### Q12: Is my personal information safe?
**Expected retrieval context:** Document 14: Keeping Your Information Safe
**Authoritative answer:** Yes, we use bank-level encryption, regular security checks, and never sell your personal information.
**Required keywords in LLM response:** ["encryption", "security checks", "never sell your information"]
**Forbidden content:** ["not secure", "sells data", "no protection"]

### Q13: What are the steps to check out?
**Expected retrieval context:** Document 3: How to Check Out
**Authoritative answer:** There are four steps: review cart, enter shipping, choose payment, and confirm order. You get a confirmation email.
**Required keywords in LLM response:** ["four steps", "review cart", "shipping", "payment", "confirmation email"]
**Forbidden content:** ["one step", "no email", "complicated process"]

### Q14: What kinds of discount codes are there?
**Expected retrieval context:** Document 15: Discount Codes and Sales
**Authoritative answer:** We have percentage discounts, fixed amount discounts, free shipping, and buy-one-get-one codes, usually with minimum purchases.
**Required keywords in LLM response:** ["percentage discounts", "fixed amount", "free shipping", "minimum purchases"]
**Forbidden content:** ["unlimited stacking", "no rules", "always available"]

### Q15: Can developers connect to Shoplite?
**Expected retrieval context:** Document 13: Using Shoplite's API
**Authoritative answer:** Yes, developers can use our API for product search, order management, and inventory updates with OAuth authentication.
**Required keywords in LLM response:** ["API", "product search", "order management", "OAuth"]
**Forbidden content:** ["no API", "manual only", "no authentication"]

### Q16: What if no one is home for delivery?
**Expected retrieval context:** Document 16: What Happens If Delivery Fails
**Authoritative answer:** The package goes to the local carrier office for 5 business days where you can pick it up with ID.
**Required keywords in LLM response:** ["carrier office", "5 business days", "pick it up", "ID"]
**Forbidden content:** ["return to sender", "keep trying", "leave at door"]

### Q17: Can I save my credit card for faster checkout?
**Expected retrieval context:** Document 17: Saving Payment Methods
**Authoritative answer:** Yes, you can save payment methods but need to enter the security code each time for safety.
**Required keywords in LLM response:** ["save payment methods", "security code", "each time", "safety"]
**Forbidden content:** ["saves security code", "automatic payments", "unsafe"]

### Q18: What if an item sells out while in my cart?
**Expected retrieval context:** Document 18: Out of Stock Items in Cart
**Authoritative answer:** The item automatically disappears from your cart and you'll see a message. The system prevents overselling.
**Required keywords in LLM response:** ["automatically disappears", "message", "prevents overselling"]
**Forbidden content:** ["stays in cart", "backorder", "can still buy"]

### Q19: How do returns work for broken items?
**Expected retrieval context:** Document 6: Returns and Getting Your Money Back
**Authoritative answer:** For broken or wrong items, we pay the return shipping and refund includes original shipping costs within 5-7 days.
**Required keywords in LLM response:** ["we pay return shipping", "includes original shipping", "5-7 days"]
**Forbidden content:** ["you pay shipping", "no refund", "instant"]

### Q20: What do sellers need to do to keep their account?
**Expected retrieval context:** Document 8: Becoming a Seller
**Authoritative answer:** Sellers need 4+ star ratings and must answer customer questions within 2 days. Performance is tracked.
**Required keywords in LLM response:** ["4 star ratings", "answer questions", "2 days", "performance tracked"]
**Forbidden content:** ["no requirements", "unlimited time", "not monitored"]