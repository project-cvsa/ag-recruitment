import type { APIRoute } from "astro";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, S3_BUCKET, S3_PUBLIC_URL_PREFIX } from "../../lib/s3";
import { verifyRequest } from "../../lib/verify-token";

const MAX_UPLOAD_SIZE = 50 * 1024 * 1024; // 50 MB

export const POST: APIRoute = async ({ request }) => {
	try {
		const authError = await verifyRequest(request);
		if (authError) return authError;

		const { filename, contentType, contentLength } = (await request.json()) as {
			filename?: string;
			contentType?: string;
			contentLength?: number;
		};

		if (!filename) {
			return new Response(JSON.stringify({ error: "未提供文件名" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		if (contentLength !== undefined && contentLength > MAX_UPLOAD_SIZE) {
			return new Response(JSON.stringify({ error: "文件大小不能超过 50 MB" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		const timestamp = Date.now();
		const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
		const key = `portfolio/${timestamp}-${safeName}`;

		const command = new PutObjectCommand({
			Bucket: S3_BUCKET,
			Key: key,
			ContentType: contentType || "application/octet-stream",
		});
		if (contentLength !== undefined) {
			command.input.ContentLength = contentLength;
		}

		const presignedUrl = await getSignedUrl(s3Client, command, {
			expiresIn: 300,
		});

		const url = `${S3_PUBLIC_URL_PREFIX}/${key}`;

		return new Response(JSON.stringify({ presignedUrl, url, key }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (err) {
		console.error("Upload presign error:", err);
		return new Response(JSON.stringify({ error: "无法生成上传链接" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};
