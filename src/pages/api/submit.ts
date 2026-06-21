import type { APIRoute } from "astro";
import fs from "node:fs/promises";
import path from "node:path";
import { verifyRequest } from "../../lib/verify-token";

const SUBMISSIONS_DIR = import.meta.env.SUBMISSIONS_DIR || "./data/submissions";

export const POST: APIRoute = async ({ request }) => {
	try {
		const authError = await verifyRequest(request, "submit");
		if (authError) return authError;

		const body = await request.json();
		const { nickname, contact, roles, social, portfolioUrl } = body;

		if (!nickname?.trim()) {
			return new Response(JSON.stringify({ error: "请填写昵称" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}
		if (!contact?.trim()) {
			return new Response(JSON.stringify({ error: "请填写联系方式" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}
		if (!roles || roles.length === 0) {
			return new Response(JSON.stringify({ error: "请至少选择一个职能" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		const timestamp = Date.now();
		const safeNickname = nickname.replace(/[^a-zA-Z0-9\u4e00-\u9fff_-]/g, "_");
		const filename = `${timestamp}-${safeNickname}.json`;

		const submission = {
			nickname: nickname.trim(),
			contact: contact.trim(),
			roles,
			social: social?.trim() || "",
			portfolioUrl: portfolioUrl || "",
			submittedAt: new Date(timestamp).toISOString(),
		};

		const dir = path.resolve(SUBMISSIONS_DIR);
		await fs.mkdir(dir, { recursive: true });
		await fs.writeFile(
			path.join(dir, filename),
			JSON.stringify(submission, null, 2),
			"utf-8",
		);

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (err) {
		console.error("Submit error:", err);
		return new Response(JSON.stringify({ error: "提交失败，请稍后重试" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};
