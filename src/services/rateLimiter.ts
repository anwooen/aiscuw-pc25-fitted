interface RateLimitRule {
  windowMs: number;    // Time window in milliseconds
  maxRequests: number; // Maximum requests allowed in the window
}

export class RateLimiter {
  private static instance: RateLimiter;
  private requests: Map<string, number[]>;
  private rules: RateLimitRule[];

  private constructor() {
    this.requests = new Map();
    this.rules = [
      { windowMs: 1000 * 60,      maxRequests: 60  },  // 60 requests per minute
      { windowMs: 1000 * 60 * 60, maxRequests: 1000 }, // 1000 requests per hour
    ];
  }

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  canMakeRequest(clientId: string): boolean {
    const now = Date.now();
    const clientRequests = this.requests.get(clientId) || [];

    // Remove expired timestamps
    const validRequests = clientRequests.filter(timestamp => 
      timestamp > now - Math.max(...this.rules.map(r => r.windowMs))
    );

    // Check each rule
    for (const rule of this.rules) {
      const requestsInWindow = validRequests.filter(timestamp => 
        timestamp > now - rule.windowMs
      );

      if (requestsInWindow.length >= rule.maxRequests) {
        return false;
      }
    }

    // Update requests
    validRequests.push(now);
    this.requests.set(clientId, validRequests);

    return true;
  }

  getRemainingRequests(clientId: string): { [key: string]: number } {
    const now = Date.now();
    const clientRequests = this.requests.get(clientId) || [];
    const remaining: { [key: string]: number } = {};

    for (const rule of this.rules) {
      const requestsInWindow = clientRequests.filter(timestamp => 
        timestamp > now - rule.windowMs
      );
      remaining[`${rule.windowMs}ms`] = rule.maxRequests - requestsInWindow.length;
    }

    return remaining;
  }

  resetClientLimit(clientId: string): void {
    this.requests.delete(clientId);
  }
}