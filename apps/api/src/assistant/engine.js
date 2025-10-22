// Intelligent Assistant Engine
// Main orchestrator for the support assistant

import IntentClassifier from './intent-classifier.js';
import FunctionRegistry from './function-registry.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class AssistantEngine {
  constructor() {
    this.intentClassifier = new IntentClassifier();
    this.functionRegistry = new FunctionRegistry();
    this.knowledgeBase = this.loadKnowledgeBase();
    this.config = this.loadConfig();
    this.stats = {
      totalQueries: 0,
      intentDistribution: {},
      functionCalls: {},
      responseTimes: []
    };
  }

  // Load knowledge base from ground-truth.json
  loadKnowledgeBase() {
    try {
      const knowledgePath = path.join(__dirname, '../../../docs/ground-truth.json');
      const data = fs.readFileSync(knowledgePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.warn('Could not load knowledge base, using empty array:', error.message);
      return [];
    }
  }

  // Load assistant configuration
  loadConfig() {
    try {
      const configPath = path.join(__dirname, '../../../docs/prompts.yaml');
      // For now, return default config - YAML parsing would need a library
      return {
        identity: {
          name: "Alex",
          role: "Customer Support Specialist",
          personality: "friendly, helpful, professional"
        },
        intents: {
          policy_question: "Provide helpful policy information with citations",
          order_status: "Check order status and provide updates",
          product_search: "Help find products and provide recommendations",
          complaint: "Listen empathetically and work to resolve issues",
          chitchat: "Be friendly and redirect to support topics",
          off_topic: "Politely redirect to store-related topics",
          violation: "Set clear boundaries and redirect appropriately"
        }
      };
    } catch (error) {
      console.warn('Could not load config, using defaults:', error.message);
      return {
        identity: { name: "Alex", role: "Support Specialist", personality: "helpful" }
      };
    }
  }

  // Main processing method
  async processQuery(userInput, context = {}) {
    const startTime = Date.now();
    this.stats.totalQueries++;

    try {
      // 1. Classify intent
      const intentResult = this.intentClassifier.classify(userInput);
      this.updateIntentStats(intentResult.intent);

      // 2. Route by intent
      const response = await this.routeByIntent(userInput, intentResult, context);
      
      // 3. Record response time
      const responseTime = Date.now() - startTime;
      this.stats.responseTimes.push(responseTime);

      return {
        ...response,
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        responseTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Assistant processing error:', error);
      return {
        text: "I apologize, but I'm experiencing some technical difficulties. Please try again or contact our support team directly.",
        intent: 'error',
        confidence: 0,
        error: error.message,
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Route processing by intent
  async routeByIntent(userInput, intentResult, context) {
    const { intent } = intentResult;

    switch (intent) {
      case 'policy_question':
        return await this.handlePolicyQuestion(userInput);
      
      case 'order_status':
        return await this.handleOrderStatus(userInput, context);
      
      case 'product_search':
        return await this.handleProductSearch(userInput, context);
      
      case 'complaint':
        return await this.handleComplaint(userInput);
      
      case 'chitchat':
        return await this.handleChitchat(userInput);
      
      case 'off_topic':
        return await this.handleOffTopic(userInput);
      
      case 'violation':
        return await this.handleViolation(userInput);
      
      default:
        return await this.handleDefault(userInput);
    }
  }

  // Handle policy questions with knowledge base grounding
  async handlePolicyQuestion(userInput) {
    const relevantPolicies = this.findRelevantPolicies(userInput);
    
    if (relevantPolicies.length === 0) {
      return {
        text: "I'd be happy to help with policy questions! Could you be more specific about what you'd like to know? For example, you can ask about our return policy, shipping options, or warranty information.",
        citations: [],
        functionsCalled: []
      };
    }

    // Use the first relevant policy for response
    const policy = relevantPolicies[0];
    const response = this.generatePolicyResponse(policy, userInput);
    
    return {
      text: response,
      citations: [policy.id],
      functionsCalled: []
    };
  }

  // Handle order status queries
  async handleOrderStatus(userInput, context) {
    // Extract order ID from input (simple pattern matching)
    const orderIdMatch = userInput.match(/(?:order|order\s+id|order\s+number)[\s:]*([a-f0-9]{24})/i);
    const orderId = orderIdMatch ? orderIdMatch[1] : context.orderId;

    if (!orderId) {
      return {
        text: "I'd be happy to help you check your order status! Could you please provide your order ID or order number?",
        citations: [],
        functionsCalled: []
      };
    }

    try {
      const result = await this.functionRegistry.execute('getOrderStatus', { orderId });
      
      if (result.success) {
        const order = result.result;
        const response = this.generateOrderStatusResponse(order);
        return {
          text: response,
          citations: [],
          functionsCalled: ['getOrderStatus']
        };
      } else {
        return {
          text: "I couldn't find that order. Please double-check your order ID and try again, or contact our support team for assistance.",
          citations: [],
          functionsCalled: ['getOrderStatus']
        };
      }
    } catch (error) {
      return {
        text: "I'm having trouble accessing your order information right now. Please try again in a moment or contact our support team.",
        citations: [],
        functionsCalled: []
      };
    }
  }

  // Handle product search queries
  async handleProductSearch(userInput, context) {
    const searchQuery = this.extractSearchQuery(userInput);
    
    if (!searchQuery) {
      return {
        text: "I'd be happy to help you find products! What are you looking for? You can describe the item, category, or any specific features you need.",
        citations: [],
        functionsCalled: []
      };
    }

    try {
      const result = await this.functionRegistry.execute('searchProducts', { 
        query: searchQuery,
        limit: 5
      });
      
      if (result.success && result.result.results.length > 0) {
        const response = this.generateProductSearchResponse(result.result);
        return {
          text: response,
          citations: [],
          functionsCalled: ['searchProducts']
        };
      } else {
        return {
          text: "I couldn't find any products matching your search. Try different keywords or browse our categories to discover what we have available.",
          citations: [],
          functionsCalled: ['searchProducts']
        };
      }
    } catch (error) {
      return {
        text: "I'm having trouble searching our products right now. Please try again in a moment.",
        citations: [],
        functionsCalled: []
      };
    }
  }

  // Handle complaints with empathy
  async handleComplaint(userInput) {
    return {
      text: "I'm really sorry to hear about your experience, and I understand your frustration. I want to help make this right for you. Could you tell me more about what happened so I can assist you better?",
      citations: [],
      functionsCalled: []
    };
  }

  // Handle chitchat
  async handleChitchat(userInput) {
    const responses = [
      "Hello! I'm Alex, your customer support specialist. How can I help you today?",
      "Hi there! I'm here to assist you with any questions about our products, orders, or policies.",
      "Good to see you! What can I help you with today?",
      "Hello! I'm ready to help with any questions you might have."
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      text: response,
      citations: [],
      functionsCalled: []
    };
  }

  // Handle off-topic queries
  async handleOffTopic(userInput) {
    return {
      text: "I'm here to help with questions about our store, products, orders, and policies. Is there anything store-related I can assist you with?",
      citations: [],
      functionsCalled: []
    };
  }

  // Handle violations
  async handleViolation(userInput) {
    return {
      text: "I'm here to help in a respectful and professional manner. Let's focus on how I can assist you with our products, orders, or policies. How can I help you today?",
      citations: [],
      functionsCalled: []
    };
  }

  // Default handler
  async handleDefault(userInput) {
    return {
      text: "I'm here to help! You can ask me about our products, check your order status, or get information about our policies. What would you like to know?",
      citations: [],
      functionsCalled: []
    };
  }

  // Find relevant policies using keyword matching
  findRelevantPolicies(userInput) {
    const query = userInput.toLowerCase();
    const categoryKeywords = {
      'returns': ['return', 'refund', 'exchange', 'money back'],
      'shipping': ['shipping', 'delivery', 'shipping cost', 'delivery time'],
      'warranty': ['warranty', 'guarantee', 'defect', 'broken'],
      'privacy': ['privacy', 'data', 'personal information', 'security'],
      'payment': ['payment', 'billing', 'charge', 'credit card']
    };

    let matchedCategory = null;
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(kw => query.includes(kw))) {
        matchedCategory = category;
        break;
      }
    }

    return matchedCategory 
      ? this.knowledgeBase.filter(p => p.category === matchedCategory)
      : this.knowledgeBase.slice(0, 3); // Return first 3 if no category match
  }

  // Generate policy response
  generatePolicyResponse(policy, userInput) {
    const assistantName = this.config.identity.name;
    return `Based on our ${policy.category} policy, ${policy.answer} [${policy.id}]`;
  }

  // Generate order status response
  generateOrderStatusResponse(order) {
    const statusMessages = {
      'PENDING': 'Your order is being processed',
      'PROCESSING': 'Your order is being prepared for shipment',
      'SHIPPED': 'Your order has been shipped and is on its way',
      'DELIVERED': 'Your order has been delivered'
    };

    const statusMessage = statusMessages[order.status] || `Your order status is ${order.status.toLowerCase()}`;
    
    return `Here's your order information:\n\n` +
           `Order #${order.orderId}\n` +
           `Status: ${statusMessage}\n` +
           `Total: $${order.total}\n` +
           `Carrier: ${order.carrier}\n` +
           `Estimated Delivery: ${new Date(order.estimatedDelivery).toLocaleDateString()}`;
  }

  // Generate product search response
  generateProductSearchResponse(searchResult) {
    const { query, results } = searchResult;
    
    if (results.length === 0) {
      return `I couldn't find any products matching "${query}". Try different keywords or browse our categories.`;
    }

    let response = `I found ${results.length} product(s) matching "${query}":\n\n`;
    
    results.forEach((product, index) => {
      response += `${index + 1}. ${product.name} - $${product.price}\n`;
      response += `   ${product.description}\n`;
      if (product.stock > 0) {
        response += `   In Stock (${product.stock} available)\n`;
      } else {
        response += `   Out of Stock\n`;
      }
      response += `\n`;
    });

    return response;
  }

  // Extract search query from user input
  extractSearchQuery(userInput) {
    // Remove common search terms and return the core query
    const cleaned = userInput
      .replace(/\b(?:find|search|looking for|need|want|buy|purchase|show me|get me)\b/gi, '')
      .trim();
    
    return cleaned.length > 0 ? cleaned : null;
  }

  // Update intent statistics
  updateIntentStats(intent) {
    this.stats.intentDistribution[intent] = (this.stats.intentDistribution[intent] || 0) + 1;
  }

  // Get assistant statistics
  getStats() {
    const avgResponseTime = this.stats.responseTimes.length > 0
      ? this.stats.responseTimes.reduce((a, b) => a + b, 0) / this.stats.responseTimes.length
      : 0;

    return {
      ...this.stats,
      averageResponseTime: Math.round(avgResponseTime),
      functionStats: this.functionRegistry.getStats()
    };
  }

  // Validate citations
  validateCitations(text, citations) {
    const citationPattern = /\[([^\]]+)\]/g;
    const foundCitations = [];
    let match;
    
    while ((match = citationPattern.exec(text)) !== null) {
      foundCitations.push(match[1]);
    }

    const validCitations = citations.filter(citation => 
      this.knowledgeBase.some(policy => policy.id === citation)
    );

    const invalidCitations = foundCitations.filter(citation => 
      !this.knowledgeBase.some(policy => policy.id === citation)
    );

    return {
      isValid: invalidCitations.length === 0,
      validCitations,
      invalidCitations,
      foundCitations
    };
  }
}

export default AssistantEngine;
