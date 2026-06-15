import type { APIRoute } from "astro";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, S3_BUCKET, S3_PUBLIC_URL_PREFIX } from "../../lib/s3";
import { verifyRequest } from "../../lib/verify-token";

export const POST: APIRoute = async ({ request }) => {
	try {
		const authError = await verifyRequest(request);
		if (authError) return authError;

		const formData = await request.formData();
		const file = formData.get("file") as File | null;

		if (!file) {
			return new Response(JSON.stringify({ error: "未提供文件" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		const buffer = await file.arrayBuffer();
		const timestamp = Date.now();
		const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
		const key = `portfolio/${timestamp}-${safeName}`;

		await s3Client.send(
			new PutObjectCommand({
				Bucket: S3_BUCKET,
				Key: key,
				Body: Buffer.from(buffer),
				ContentType: file.type || "application/octet-stream",
			}),
		);

		const url = `${S3_PUBLIC_URL_PREFIX}/${key}`;

		return new Response(JSON.stringify({ url, key }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (err) {
		console.error("Upload error:", err);
		return new Response(JSON.stringify({ error: "文件上传失败" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};
