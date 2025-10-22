// Assistant system tests
import AssistantEngine from '../src/assistant/engine.js';
import IntentClassifier from '../src/assistant/intent-classifier.js';
import FunctionRegistry from '../src/assistant/function-registry.js';

describe('Intent Classification', () => {
  const classifier = new IntentClassifier();

  test('should classify policy questions correctly', () => {
    const result = classifier.classify('What is your return policy?');
    expect(result.intent).toBe('policy_question');
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  test('should classify order status queries correctly', () => {
    const result = classifier.classify('Where is my order?');
    expect(result.intent).toBe('order_status');
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  test('should classify product search queries correctly', () => {
    const result = classifier.classify('I need wireless headphones');
    expect(result.intent).toBe('product_search');
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  test('should classify complaints correctly', () => {
    const result = classifier.classify('This product is terrible and broken');
    expect(result.intent).toBe('complaint');
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  test('should classify chitchat correctly', () => {
    const result = classifier.classify('Hello, how are you?');
    expect(result.intent).toBe('chitchat');
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  test('should classify off-topic queries correctly', () => {
    const result = classifier.classify('What is the weather like today?');
    expect(result.intent).toBe('off_topic');
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  test('should classify violations correctly', () => {
    const result = classifier.classify('This is stupid and useless');
    expect(result.intent).toBe('violation');
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  test('should handle empty input', () => {
    const result = classifier.classify('');
    expect(result.intent).toBe('off_topic');
    expect(result.confidence).toBe(0);
  });

  test('should handle null input', () => {
    const result = classifier.classify(null);
    expect(result.intent).toBe('off_topic');
    expect(result.confidence).toBe(0);
  });
});

describe('Function Registry', () => {
  const registry = new FunctionRegistry();

  test('should register and execute functions', async () => {
    // Test function registration
    registry.register('testFunction', {
      name: 'testFunction',
      description: 'A test function',
      parameters: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        },
        required: ['message']
      }
    }, async (params) => {
      return { result: `Echo: ${params.message}` };
    });

    // Test function execution
    const result = await registry.execute('testFunction', { message: 'Hello' });
    expect(result.success).toBe(true);
    expect(result.result.result).toBe('Echo: Hello');
  });

  test('should handle function execution errors', async () => {
    registry.register('errorFunction', {
      name: 'errorFunction',
      description: 'A function that throws errors',
      parameters: { type: 'object', properties: {} }
    }, async () => {
      throw new Error('Test error');
    });

    const result = await registry.execute('errorFunction', {});
    expect(result.success).toBe(false);
    expect(result.error).toBe('Test error');
  });

  test('should return function schemas', () => {
    const schemas = registry.getAllSchemas();
    expect(schemas).toHaveProperty('getOrderStatus');
    expect(schemas).toHaveProperty('searchProducts');
    expect(schemas).toHaveProperty('getCustomerOrders');
  });

  test('should track function call statistics', async () => {
    await registry.execute('getOrderStatus', { orderId: 'test123' });
    const stats = registry.getStats();
    expect(stats.getOrderStatus.callCount).toBeGreaterThan(0);
  });
});

describe('Assistant Engine', () => {
  const engine = new AssistantEngine();

  test('should process policy questions with grounding', async () => {
    const result = await engine.processQuery('What is your return policy?');
    
    expect(result.intent).toBe('policy_question');
    expect(result.text).toContain('return');
    expect(result.citations).toBeDefined();
  });

  test('should handle order status queries', async () => {
    const result = await engine.processQuery('What is the status of order 123?');
    
    expect(result.intent).toBe('order_status');
    expect(result.text).toContain('order');
  });

  test('should handle product search queries', async () => {
    const result = await engine.processQuery('I need wireless headphones');
    
    expect(result.intent).toBe('product_search');
    expect(result.text).toContain('product');
  });

  test('should handle complaints with empathy', async () => {
    const result = await engine.processQuery('This product is terrible');
    
    expect(result.intent).toBe('complaint');
    expect(result.text).toContain('sorry');
  });

  test('should handle chitchat appropriately', async () => {
    const result = await engine.processQuery('Hello there');
    
    expect(result.intent).toBe('chitchat');
    expect(result.text).toContain('Alex');
  });

  test('should handle off-topic queries', async () => {
    const result = await engine.processQuery('What is the weather?');
    
    expect(result.intent).toBe('off_topic');
    expect(result.text).toContain('store');
  });

  test('should handle violations appropriately', async () => {
    const result = await engine.processQuery('This is stupid');
    
    expect(result.intent).toBe('violation');
    expect(result.text).toContain('respectful');
  });

  test('should validate citations correctly', () => {
    const text = "You can return items within 30 days [Policy3.1]";
    const citations = ["Policy3.1"];
    
    const validation = engine.validateCitations(text, citations);
    expect(validation.isValid).toBe(true);
    expect(validation.validCitations).toContain("Policy3.1");
  });

  test('should detect invalid citations', () => {
    const text = "You can return items within 30 days [InvalidPolicy]";
    const citations = ["InvalidPolicy"];
    
    const validation = engine.validateCitations(text, citations);
    expect(validation.isValid).toBe(false);
    expect(validation.invalidCitations).toContain("InvalidPolicy");
  });

  test('should track statistics', async () => {
    await engine.processQuery('Test query');
    const stats = engine.getStats();
    
    expect(stats.totalQueries).toBeGreaterThan(0);
    expect(stats.intentDistribution).toBeDefined();
  });
});

describe('Integration Tests', () => {
  const engine = new AssistantEngine();

  test('should handle multi-intent conversation', async () => {
    // Start with greeting
    const greeting = await engine.processQuery('Hello');
    expect(greeting.intent).toBe('chitchat');

    // Ask about products
    const productQuery = await engine.processQuery('I need headphones');
    expect(productQuery.intent).toBe('product_search');

    // Ask about policy
    const policyQuery = await engine.processQuery('What is your return policy?');
    expect(policyQuery.intent).toBe('policy_question');

    // Check order status
    const orderQuery = await engine.processQuery('Where is my order?');
    expect(orderQuery.intent).toBe('order_status');
  });

  test('should maintain context across queries', async () => {
    const context = { orderId: 'test123' };
    
    const result1 = await engine.processQuery('Check my order status', context);
    const result2 = await engine.processQuery('What is the status?', context);
    
    expect(result1.intent).toBe('order_status');
    expect(result2.intent).toBe('order_status');
  });

  test('should handle edge cases gracefully', async () => {
    const edgeCases = [
      '',
      '   ',
      'a'.repeat(1000),
      '!@#$%^&*()',
      '1234567890'
    ];

    for (const query of edgeCases) {
      const result = await engine.processQuery(query);
      expect(result).toBeDefined();
      expect(result.intent).toBeDefined();
      expect(result.text).toBeDefined();
    }
  });
});
