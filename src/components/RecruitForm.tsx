import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getNewCaptcha, solveAndSubmit } from "../lib/ucaptcha";

gsap.registerPlugin(ScrollTrigger);

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const ROLES = [
	"画师",
	"视频制作",
	"作编曲",
	"作词",
	"文案",
	"项目策划",
	"活动策划",
	"周边美工",
	"平面设计",
	"其他",
];

interface FormState {
	nickname: string;
	contact: string;
	roles: string[];
	social: string;
	file: File | null;
}

function FieldPanel({
	index,
	label,
	children,
}: {
	index: string;
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="form-field relative border border-foreground/30 p-6 md:p-10 bg-background/50 backdrop-blur-sm">
			<div className="absolute -top-3 left-6 px-2 bg-background font-[Outfit] text-[10px] tracking-[0.2em] uppercase text-foreground/70">
				{label}
			</div>
			<div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-foreground" />
			<div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-foreground" />
			<div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-foreground" />
			<div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-foreground" />
			<div className="flex items-start gap-4">
				<span className="font-[Outfit] mt-2 text-2xl font-extralight text-foreground/30">{index}</span>
				<div className="flex-1">{children}</div>
			</div>
		</div>
	);
}

type FileStatus = "idle" | "validating" | "uploading" | "uploaded" | "error";

export function RecruitForm({ className }: { className?: string }) {
	const sectionRef = useRef<HTMLElement>(null);
	const successRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [form, setForm] = useState<FormState>({
		nickname: "",
		contact: "",
		roles: [],
		social: "",
		file: null,
	});
	const [submitted, setSubmitted] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [dragOver, setDragOver] = useState(false);
	const [fileStatus, setFileStatus] = useState<FileStatus>("idle");
	const [uploadProgress, setUploadProgress] = useState(0);
	const [portfolioUrl, setPortfolioUrl] = useState<string>("");

	useEffect(() => {
		const ctx = gsap.context(() => {
			gsap.fromTo(
				".form-header",
				{ x: -40, opacity: 0 },
				{
					x: 0,
					opacity: 1,
					duration: 0.8,
					ease: "power2.out",
					scrollTrigger: {
						trigger: ".form-header",
						start: "top 80%",
						toggleActions: "play none none reverse",
					},
				},
			);

			const fields = gsap.utils.toArray<HTMLElement>(".form-field");
			fields.forEach((field, i) => {
				gsap.fromTo(
					field,
					{ y: 60, opacity: 0 },
					{
						y: 0,
						opacity: 1,
						duration: 0.6,
						delay: i * 0.05,
						ease: "power2.out",
						scrollTrigger: {
							trigger: field,
							start: "top 85%",
							toggleActions: "play none none reverse",
						},
					},
				);
			});
		}, sectionRef);

		return () => ctx.revert();
	}, []);

	useEffect(() => {
		if (submitted && successRef.current) {
			gsap.fromTo(
				successRef.current,
				{ opacity: 0, y: 40, scale: 0.98 },
				{ opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power2.out" },
			);
		}
	}, [submitted]);

	const toggleRole = (role: string) => {
		setForm((prev) => ({
			...prev,
			roles: prev.roles.includes(role)
				? prev.roles.filter((r) => r !== role)
				: [...prev.roles, role],
		}));
		setError(null);
	};

	const uploadFile = useCallback(async (file: File) => {
		setFileStatus("validating");
		setUploadProgress(0);
		try {
			const captcha = await getNewCaptcha("upload-files");
			const token = await solveAndSubmit(captcha);

			const presignRes = await fetch("/api/upload", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					filename: file.name,
					contentType: file.type,
					contentLength: file.size,
				}),
			});

			if (!presignRes.ok) {
				const data = await presignRes.json();
				throw new Error(data.error || "无法获取上传链接");
			}

			const { presignedUrl, url } = await presignRes.json();

			setFileStatus("uploading");

			await new Promise<void>((resolve, reject) => {
				const xhr = new XMLHttpRequest();
				xhr.open("PUT", presignedUrl);
				xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

				xhr.upload.onprogress = (e) => {
					if (e.lengthComputable) {
						setUploadProgress(Math.round((e.loaded / e.total) * 100));
					}
				};

				xhr.onload = () => {
					if (xhr.status >= 200 && xhr.status < 300) {
						resolve();
					} else {
						reject(new Error("文件上传失败"));
					}
				};

				xhr.onerror = () => reject(new Error("文件上传失败"));
				xhr.send(file);
			});

			setPortfolioUrl(url);
			setFileStatus("uploaded");
		} catch (err) {
			setFileStatus("error");
			setError(err instanceof Error ? err.message : "文件上传失败");
		}
	}, []);

	const handleFile = (file: File) => {
		if (file.size > MAX_FILE_SIZE) {
			setError("文件大小不能超过 50 MB");
			return;
		}
		setForm((prev) => ({ ...prev, file }));
		setError(null);
		setFileStatus("idle");
		setUploadProgress(0);
		setPortfolioUrl("");
		uploadFile(file);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setDragOver(false);
		const file = e.dataTransfer.files[0];
		if (file) handleFile(file);
	};

	const validate = () => {
		if (!form.nickname.trim()) return "请填写昵称";
		if (!form.contact.trim()) return "请填写联系方式";
		if (form.roles.length === 0) return "请至少选择一个职能";
		return null;
	};

	const handleSubmit = async () => {
		const err = validate();
		if (err) {
			setError(err);
			gsap.fromTo(
				sectionRef.current,
				{ x: -6 },
				{ x: 6, duration: 0.05, repeat: 5, yoyo: true, ease: "power1.inOut" },
			);
			return;
		}

		if (form.file && (fileStatus === "validating" || fileStatus === "uploading")) {
			setError("文件正在上传中，请稍候...");
			return;
		}

		if (form.file && fileStatus === "error") {
			setError("文件上传失败，请重新选择文件");
			return;
		}

		setSubmitting(true);
		setError(null);

		try {
			const captcha = await getNewCaptcha("submit");
			const token = await solveAndSubmit(captcha);

			const submitRes = await fetch("/api/submit", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					nickname: form.nickname,
					contact: form.contact,
					roles: form.roles,
					social: form.social,
					portfolioUrl: form.file ? portfolioUrl : "",
				}),
			});

			if (!submitRes.ok) {
				const data = await submitRes.json();
				throw new Error(data.error || "提交失败");
			}

			setSubmitted(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "提交失败，请稍后重试");
		} finally {
			setSubmitting(false);
		}
	};

	if (submitted) {
		return (
			<section
				ref={sectionRef}
				className={`story-section relative min-h-screen flex items-center justify-center px-6 py-32 ${className ?? ""}`}
			>
				<div
					ref={successRef}
					className="relative z-10 max-w-4xl text-center border border-foreground/30 p-10 md:p-16 bg-background/60 backdrop-blur-sm"
				>
					<div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-foreground" />
					<div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-foreground" />
					<div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-foreground" />
					<div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-foreground" />
					<div className="font-[Outfit] text-[11px] tracking-[0.25em] uppercase text-foreground/70 mb-6">
						{"03 / ENLIST // COMPLETE"}
					</div>
					<h2 className="text-4xl leading-[0.9] font-[Outfit] font-extralight tracking-tight text-foreground mb-4">
						档案已接收
					</h2>
					<p className="text-foreground/80 mb-8">
						我们会尽快审阅你的资料，并期待与你相遇。
					</p>
				</div>
			</section>
		);
	}

	return (
		<section
			ref={sectionRef}
			className={`story-section relative min-h-screen px-6 md:px-14 lg:px-36 py-24 md:py-32 ${className ?? ""}`}
		>
			<div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
				<div className="lg:col-span-4">
					<div className="form-header lg:sticky lg:top-32">
						<div className="font-[Outfit] text-[11px] tracking-[0.25em] uppercase text-foreground/70 mb-4">
							03 / ENLIST
						</div>
						<h2 className="text-[clamp(3.5rem,5vw,6rem)] leading-[0.9] font-[Outfit] font-extralight tracking-tight text-foreground mb-6">
							登记档案
						</h2>
						<div className="h-px w-16 bg-foreground/40 mb-6" />
						<p className="text-base text-foreground/80 leading-relaxed">
							填写以下信息，让我们认识你。
						</p>
					</div>
				</div>

				<div className="lg:col-span-7 flex flex-col gap-8">
					<FieldPanel index="01" label="昵称 / Nickname">
						<label htmlFor="nickname" className="sr-only">
							昵称
						</label>
						<input
							id="nickname"
							type="text"
							value={form.nickname}
							onChange={(e) => setForm((p) => ({ ...p, nickname: e.target.value }))}
							placeholder="你希望被称呼的昵称"
							className="geo-input"
						/>
					</FieldPanel>

					<FieldPanel index="02" label="联系方式 / Contact">
						<label htmlFor="contact" className="sr-only">
							联系方式
						</label>
						<input
							id="contact"
							type="text"
							value={form.contact}
							onChange={(e) => setForm((p) => ({ ...p, contact: e.target.value }))}
							placeholder="邮箱 / QQ / 微信 / 其他可联系的方式"
							className="geo-input"
						/>
					</FieldPanel>

					<FieldPanel index="03" label="申请职能 / Role">
						<p className="text-foreground/80 mb-2 text-sm mt-3">请选择想要申请的所有职能</p>
						<div className="flex flex-wrap gap-3">
							{ROLES.map((role) => (
								<button
									key={role}
									type="button"
									onClick={() => toggleRole(role)}
									className={`geo-chip ${form.roles.includes(role) ? "selected" : ""}`}
								>
									{role}
								</button>
							))}
						</div>
					</FieldPanel>

					<FieldPanel index="04" label="社交平台 / Social">
						<label htmlFor="social" className="mt-2 text-foreground/80 text-sm">
							请填写您的常用社交平台账号（bilibili、小红书、微博、个人主页等）
						</label>
						<textarea
							id="social"
							value={form.social}
							onChange={(e) => setForm((p) => ({ ...p, social: e.target.value }))}
							className="geo-input resize-none"
							rows={3}
						/>
					</FieldPanel>

					<FieldPanel index="05" label="作品集 / Portfolio">
						<p className="text-foreground/80 mb-2 text-sm mt-3">本项非必填。</p>
						<input
							ref={fileInputRef}
							type="file"
							className="hidden"
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) handleFile(file);
							}}
						/>
						<button
							type="button"
							className={`geo-file ${dragOver ? "drag-over" : ""} ${fileStatus === "validating" || fileStatus === "uploading" ? "pointer-events-none" : ""}`}
							onClick={() => fileInputRef.current?.click()}
							onDragOver={(e) => {
								e.preventDefault();
								setDragOver(true);
							}}
							onDragLeave={() => setDragOver(false)}
							onDrop={handleDrop}
						>
							{form.file ? (
								<span className="font-[Outfit] text-sm tracking-wide">{form.file.name}</span>
							) : (
								<>
									<span className="font-[Outfit] text-sm tracking-widest uppercase">点击或拖拽上传文件</span>
									<span className="text-xs text-foreground/50">简历 / 作品集 / 任意能代表你的文件</span>
								</>
							)}
						</button>
						{form.file && (
							<div className="mt-3 flex flex-col gap-2">
								<div className="flex items-center gap-3">
									<span className="text-xs text-foreground/60">{(form.file.size / 1024 / 1024).toFixed(2)} MB</span>
									{fileStatus === "validating" && (
										<span className="text-xs text-foreground/60">正在验证…</span>
									)}
									{fileStatus === "uploading" && (
										<span className="text-xs text-foreground/60">上传中 {uploadProgress}%</span>
									)}
									{fileStatus === "uploaded" && (
										<span className="text-xs text-green-500">已上传</span>
									)}
									{fileStatus === "error" && (
										<span className="text-xs text-red-500">上传失败</span>
									)}
									<button
										type="button"
										onClick={() => {
											setForm((p) => ({ ...p, file: null }));
											setFileStatus("idle");
											setUploadProgress(0);
											setPortfolioUrl("");
										}}
										className="text-xs underline underline-offset-4 text-foreground/70 hover:text-foreground"
									>
										移除
									</button>
								</div>
								{fileStatus === "uploading" && (
									<div className="h-1 w-full bg-foreground/10">
										<div
											className="h-full bg-foreground/40 transition-all duration-300"
											style={{ width: `${uploadProgress}%` }}
										/>
									</div>
								)}
							</div>
						)}
					</FieldPanel>

					{error && (
						<div className="text-sm text-foreground/90 border border-foreground/30 px-4 py-3 bg-background">
							{error}
						</div>
					)}

					<div className="pt-4">
						<button type="button" onClick={handleSubmit} className="geo-btn w-full md:w-auto" disabled={submitting}>
							{submitting ? (
								<span className="relative z-10">提交中...</span>
							) : (
								<>
									<span className="relative z-10">提交档案</span>
									<span className="relative z-10 font-[Outfit] text-[10px] tracking-[0.15em] opacity-70">
										SUBMIT RECORD
									</span>
								</>
							)}
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}
