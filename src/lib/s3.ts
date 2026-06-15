import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
	region: import.meta.env.S3_REGION || "us-east-1",
	endpoint: import.meta.env.S3_ENDPOINT,
	credentials: {
		accessKeyId: import.meta.env.S3_ACCESS_KEY_ID || "",
		secretAccessKey: import.meta.env.S3_SECRET_ACCESS_KEY || "",
	},
	forcePathStyle: true,
});

export { s3Client };
export const S3_BUCKET = import.meta.env.S3_BUCKET || "";
export const S3_PUBLIC_URL_PREFIX = import.meta.env.S3_PUBLIC_URL_PREFIX || "";
