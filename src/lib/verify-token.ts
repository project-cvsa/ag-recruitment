import { jwtVerify } from "jose";
import { checkAndMarkToken } from "./redis";

const JWT_SECRET = import.meta.env.JWT_SECRET || "";

function getKey(): Uint8Array {
	if (!JWT_SECRET) {
		throw new Error("JWT_SECRET not configured");
	}
	return new TextEncoder().encode(JWT_SECRET);
}

async function safeJwtVerify(token: string, secret: Uint8Array, options?: any) {
	try {
		const result = await jwtVerify(token, secret, options);
		return { valid: true, payload: result.payload, protectedHeader: result.protectedHeader, error: null };
	} catch (error: any) {
		return { valid: false, payload: null, protectedHeader: null, error: error.code || error.message };
	}
}

export async function verifyRequest(request: Request, action: string): Promise<Response | null> {
	const auth = request.headers.get("authorization");
	if (!auth?.startsWith("Bearer ")) {
		return new Response(JSON.stringify({ error: "无法验证请求" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	const token = auth.slice(7);

	const { payload, valid } = await safeJwtVerify(token, getKey());
	if (!valid || !payload || payload.resource !== action || payload.siteKey !== "WmJvvB2R") {
		return new Response(JSON.stringify({ error: "无法验证请求" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	const isNew = await checkAndMarkToken(payload.jti ?? token);
	if (!isNew) {
		return new Response(JSON.stringify({ error: "无法验证请求" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	return null;
}
