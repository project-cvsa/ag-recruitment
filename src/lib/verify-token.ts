import { jwtVerify } from "jose";
import { checkAndMarkToken } from "./redis";

const JWT_SECRET = import.meta.env.JWT_SECRET || "";

function getKey(): Uint8Array {
	if (!JWT_SECRET) {
		throw new Error("JWT_SECRET not configured");
	}
	return new TextEncoder().encode(JWT_SECRET);
}

export async function verifyRequest(request: Request): Promise<Response | null> {
	const auth = request.headers.get("authorization");
	if (!auth?.startsWith("Bearer ")) {
		return new Response(JSON.stringify({ error: "无法验证请求" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	const token = auth.slice(7);

	try {
		await jwtVerify(token, getKey());
	} catch {
		return new Response(JSON.stringify({ error: "无法验证请求" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	const isNew = await checkAndMarkToken(token);
	if (!isNew) {
		return new Response(JSON.stringify({ error: "无法验证请求" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	return null;
}
