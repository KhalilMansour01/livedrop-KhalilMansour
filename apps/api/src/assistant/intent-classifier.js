// Intent Classification System
// Classifies user input into 7 different intent categories

const INTENT_KEYWORDS = {
  policy_question: [
    'return', 'refund', 'exchange', 'warranty', 'guarantee', 'policy', 'shipping', 'delivery',
    'return policy', 'refund policy', 'exchange policy', 'warranty policy', 'shipping policy',
    'delivery policy', 'return window', 'money back', 'store credit', 'exchange window',
    'warranty period', 'guarantee period', 'shipping cost', 'delivery time', 'free shipping',
    'shipping options', 'return shipping', 'refund process', 'exchange process'
  ],
  
  order_status: [
    'order status', 'track order', 'order tracking', 'where is my order', 'order update',
    'shipping status', 'delivery status', 'order progress', 'order location', 'tracking',
    'order number', 'order id', 'order details', 'order history', 'my orders',
    'order confirmation', 'order received', 'order shipped', 'order delivered'
  ],
  
  product_search: [
    'search', 'find', 'looking for', 'need', 'want', 'buy', 'purchase', 'product',
    'item', 'available', 'in stock', 'out of stock', 'price', 'cost', 'expensive',
    'cheap', 'affordable', 'discount', 'sale', 'deal', 'offer', 'promotion',
    'category', 'type', 'brand', 'model', 'size', 'color', 'specifications'
  ],
  
  complaint: [
    'problem', 'issue', 'complaint', 'dissatisfied', 'unhappy', 'disappointed',
    'frustrated', 'angry', 'upset', 'terrible', 'awful', 'bad', 'poor quality',
    'defective', 'broken', 'damaged', 'wrong item', 'not as described',
    'late delivery', 'missing item', 'incorrect order', 'billing issue',
    'charge', 'payment', 'refund', 'compensation', 'make it right'
  ],
  
  chitchat: [
    'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
    'how are you', 'how\'s it going', 'what\'s up', 'thanks', 'thank you',
    'appreciate', 'help', 'assistance', 'support', 'customer service',
    'speak to', 'talk to', 'human', 'representative', 'agent'
  ],
  
  off_topic: [
    'weather', 'sports', 'politics', 'news', 'entertainment', 'movies', 'music',
    'travel', 'vacation', 'personal', 'family', 'friends', 'work', 'job',
    'school', 'education', 'health', 'medical', 'legal', 'financial advice'
  ],
  
  violation: [
    'hate', 'stupid', 'idiot', 'moron', 'dumb', 'suck', 'sucks', 'terrible',
    'awful', 'worst', 'garbage', 'trash', 'useless', 'worthless', 'scam',
    'fraud', 'cheat', 'lie', 'liar', 'deceive', 'mislead', 'inappropriate',
    'offensive', 'rude', 'disrespectful', 'abusive', 'harassment'
  ]
};

export class IntentClassifier {
  constructor() {
    this.intentScores = {};
  }

  // Classify user input into intent categories
  classify(input) {
    if (!input || typeof input !== 'string') {
      return {
        intent: 'off_topic',
        confidence: 0,
        reasoning: 'Invalid input'
      };
    }

    const query = input.toLowerCase().trim();
    this.intentScores = {};

    // Calculate scores for each intent
    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
      this.intentScores[intent] = this.calculateScore(query, keywords);
    }

    // Find the intent with highest score
    const sortedIntents = Object.entries(this.intentScores)
      .sort(([,a], [,b]) => b - a);

    const [topIntent, topScore] = sortedIntents[0];
    const confidence = Math.min(topScore / 10, 1); // Normalize to 0-1

    return {
      intent: topIntent,
      confidence: confidence,
      reasoning: this.getReasoning(query, topIntent),
      allScores: this.intentScores
    };
  }

  // Calculate score for an intent based on keyword matches
  calculateScore(query, keywords) {
    let score = 0;
    
    for (const keyword of keywords) {
      if (query.includes(keyword)) {
        // Exact phrase matches get higher score
        if (keyword.includes(' ')) {
          score += 3;
        } else {
          score += 1;
        }
      }
    }

    // Bonus for multiple keyword matches
    const matchCount = keywords.filter(keyword => query.includes(keyword)).length;
    if (matchCount > 1) {
      score += matchCount * 0.5;
    }

    return score;
  }

  // Generate reasoning for the classification
  getReasoning(query, intent) {
    const matchedKeywords = INTENT_KEYWORDS[intent].filter(keyword => 
      query.includes(keyword)
    );

    if (matchedKeywords.length === 0) {
      return `No specific keywords matched for ${intent}`;
    }

    return `Matched keywords: ${matchedKeywords.slice(0, 3).join(', ')}${matchedKeywords.length > 3 ? '...' : ''}`;
  }

  // Get all possible intents
  getAllIntents() {
    return Object.keys(INTENT_KEYWORDS);
  }

  // Check if an intent is valid
  isValidIntent(intent) {
    return Object.keys(INTENT_KEYWORDS).includes(intent);
  }
}

export default IntentClassifier;
