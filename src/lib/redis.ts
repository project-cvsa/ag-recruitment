import Redis from "ioredis";

const redis = new Redis(import.meta.env.REDIS_URL || "redis://localhost:6379", {
	maxRetriesPerRequest: 3,
});

const TOKEN_TTL = 300;

export async function checkAndMarkToken(token: string): Promise<boolean> {
	const key = `ucaptcha:token:${token}`;
	const result = await redis.set(key, "1", "EX", TOKEN_TTL, "NX");
	return result === "OK";
}

export { redis };
