// Simple Redis client using built-in Node.js compatibility
let redisClient: any = null;

const getRedisClient = () => {
  if (!redisClient) {
    redisClient = require('redis').createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    redisClient.on('error', (err: any) => console.error('Redis Error:', err));
  }
  return redisClient;
};

export const redis = {
  async canUserBid(userId: string, auctionId: string): Promise<boolean> {
    const client = getRedisClient();
    const key = `bid_limit:${userId}:${auctionId}`;
    const count = await client.incr(key);
    if (count === 1) await client.expire(key, 5);
    return count <= 3;
  },

  async registerBid(auctionId: string, bidData: any): Promise<boolean> {
    const client = getRedisClient();
    const key = `auction:${auctionId}:current_bid`;
    const current = await client.get(key);
    const currentBid = current ? JSON.parse(current) : { amount: 0 };
    
    if (bidData.amount <= currentBid.amount) return false;
    
    await client.set(key, JSON.stringify(bidData));
    return true;
  }
};