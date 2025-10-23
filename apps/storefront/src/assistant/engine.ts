import groundTruth from './ground-truth.json';
import { api } from '../lib/api';
import { formatOrderId } from '../lib/format';

export interface SupportResponse {
  answer: string;
  citation?: string;
  confidence: number;
}

export class SupportEngine {
  private groundTruth = groundTruth;

  private extractOrderId(text: string): string | null {
    const orderIdMatch = text.match(/[A-Z0-9]{10,}/g);
    return orderIdMatch ? orderIdMatch[0] : null;
  }

  private calculateScore(question: string, query: string): number {
    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    const questionWords = question.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    
    let score = 0;
    queryWords.forEach(qWord => {
      questionWords.forEach(htWord => {
        if (htWord.includes(qWord) || qWord.includes(htWord)) {
          score += 1;
        }
      });
    });
    
    return score / Math.max(queryWords.length, questionWords.length);
  }

  async processQuery(query: string): Promise<SupportResponse> {
    const orderId = this.extractOrderId(query);
    
    // Check for order status first
    if (orderId) {
      try {
        const order = await api.getOrderStatus(orderId);
        if (order) {
          return {
            answer: `Order ${formatOrderId(order._id)} is ${order.status.toLowerCase()}.${order.carrier ? ` Shipped via ${order.carrier} with ETA ${order.eta}.` : ''}`,
            confidence: 1.0
          };
        } else {
          return {
            answer: `Order ${formatOrderId(orderId)} not found. Please check the order ID and try again.`,
            confidence: 1.0
          };
        }
      } catch (error) {
        return {
          answer: `Unable to check order status at the moment. Please try again later.`,
          confidence: 0
        };
      }
    }

    // Search ground truth Q&A
    let bestMatch = { score: 0, qa: groundTruth[0] };
    
    for (const qa of this.groundTruth) {
      const score = this.calculateScore(qa.question, query);
      if (score > bestMatch.score) {
        bestMatch = { score, qa };
      }
    }

    // Threshold for accepting matches
   if (bestMatch.score > 0.3) {
  return {
    answer: `${bestMatch.qa.answer} [${bestMatch.qa.qid}]`,
    citation: bestMatch.qa.qid,
    confidence: bestMatch.score
  };
}
    // No good match found
    return {
      answer: "I can only help with order status and common questions about returns, shipping, payments, and general policies.",
      confidence: 0
    };
  }
}

// Singleton instance
export const supportEngine = new SupportEngine();
