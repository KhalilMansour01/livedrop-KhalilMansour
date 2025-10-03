# RAG System Evaluation Tests

## Retrieval Quality Tests (10 tests)

| Test ID | Question | Expected Documents | Pass Criteria |
|---------|----------|-------------------|---------------|
| R01 | How do I make a seller account? | Document 8 | Finds "Becoming a Seller" document |
| R02 | What payment methods can I use? | Document 4 | Finds "Payment Options and Safety" |
| R03 | How long do I have to return something? | Document 6 | Finds "Returns and Getting Your Money Back" |
| R04 | How long do items stay in my cart? | Document 2 | Finds "Shopping Cart Basics" |
| R05 | How much does it cost to sell? | Document 10 | Finds "Seller Fees and Getting Paid" |
| R06 | How can I track my order? | Document 5 | Finds "Tracking Your Order" |
| R07 | How do I contact customer service? | Document 11 | Finds "Getting Help from Customer Service" |
| R08 | Can anyone write reviews? | Document 7 | Finds "Writing Product Reviews" |
| R09 | What special app features are there? | Document 12 | Finds "Shoplite Mobile App" |
| R10 | How do sellers manage products? | Document 9 | Finds "Managing Your Products as a Seller" |

## Response Quality Tests (15 tests)

| Test ID | Question | Required Keywords | Forbidden Terms | Expected Behavior |
|---------|----------|-------------------|-----------------|-------------------|
| Q01 | Seller account creation | ["business information", "2-3 days"] | ["instant", "no verification"] | Correct process description |
| Q02 | Payment methods | ["credit cards", "PayPal", "secure"] | ["bank transfers", "unsafe"] | Lists accepted methods |
| Q03 | Return policy | ["30 days", "electronics", "14 days"] | ["60 days", "no returns"] | Correct timeframes |
| Q04 | Cart duration | ["30 days", "saved", "automatically"] | ["7 days", "forever"] | Correct time period |
| Q05 | Seller fees | ["8.5%", "2.9%", "$29.99"] | ["free", "no fees"] | Correct percentages |
| Q06 | Order tracking | ["tracking number", "email", "3-5 days"] | ["no tracking", "weeks"] | Tracking process |
| Q07 | Customer service | ["24/7", "live chat", "2 minutes"] | ["9-5", "no phone"] | Support options |
| Q08 | Review rules | ["bought the item", "90 days"] | ["anyone", "no rules"] | Review requirements |
| Q09 | Mobile features | ["barcode", "AR", "offline"] | ["same as website"] | Special features |
| Q10 | Seller management | ["dashboard", "low stock alerts"] | ["email us", "manual"] | Management tools |
| Q11 | Account creation | ["email", "password", "verification"] | ["phone number", "simple"] | Requirements |
| Q12 | Data safety | ["encryption", "never sell"] | ["not secure", "sells data"] | Security measures |
| Q13 | Checkout steps | ["four steps", "confirmation email"] | ["one step", "no email"] | Process description |
| Q14 | Discount codes | ["percentage", "free shipping"] | ["unlimited stacking"] | Code types |
| Q15 | API access | ["API", "OAuth", "developers"] | ["no API", "manual"] | Developer access |

## Edge Case Tests (5 tests)

| Test ID | Scenario | Expected Response Type |
|---------|----------|----------------------|
| E01 | "How do I return a spaceship?" | Should say it doesn't know about spaceships |
| E02 | "I need help with returns" (vague) | Should ask what kind of return help |
| E03 | "Tell me about seller accounts and returns" | Should use multiple documents |
| E04 | "asdfghjkl" (nonsense) | Should ask for clarification |
| E05 | "When will you add video streaming?" | Should say it doesn't know about future features |