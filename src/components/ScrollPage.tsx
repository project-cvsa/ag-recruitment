import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Landing } from "./Landing";
import { IntroScene } from "./IntroScene";
import { RecruitForm } from "./RecruitForm";

gsap.registerPlugin(ScrollTrigger);

const CHAPTERS = [
	{ id: "start", label: "START" },
	{ id: "identity", label: "IDENTITY" },
	{ id: "objective", label: "OBJECTIVE" },
	{ id: "enlist", label: "ENLIST" },
];

export function ScrollPage() {
	const mainRef = useRef<HTMLElement>(null);
	const [active, setActive] = useState(0);

	useEffect(() => {
		gsap.registerPlugin(ScrollTrigger);

		const triggers: ScrollTrigger[] = [];
		const sections = gsap.utils.toArray<HTMLElement>(".story-section");
		sections.forEach((section, i) => {
			const st = ScrollTrigger.create({
				trigger: section,
				start: "top center",
				end: "bottom center",
				onEnter: () => setActive(i),
				onEnterBack: () => setActive(i),
			});
			triggers.push(st);
		});

		// Refresh once all child ScrollTriggers have been created.
		const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 100);

		return () => {
			clearTimeout(refreshTimer);
			triggers.forEach((t) => {
				t.kill();
			});
		};
	}, []);

	const scrollTo = (i: number) => {
		const sections = document.querySelectorAll<HTMLElement>(".story-section");
		const target = sections[i];
		if (!target) return;

		if (i === 0) {
			window.scrollTo({ top: 0, behavior: "smooth" });
			return;
		}

		const pinned = ScrollTrigger.getAll().find(
			(st) => st.trigger === target && st.pin,
		);

		const windowHeight = window.innerHeight;

		if (pinned) {
			window.scrollTo({ top: pinned.start + windowHeight / 2, behavior: "smooth" });
		} else {
			target.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};

	return (
		<main ref={mainRef} className="relative">
			<nav className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-end gap-6">
				{CHAPTERS.map((chapter, i) => (
					<button
						key={chapter.id}
						type="button"
						onClick={() => scrollTo(i)}
						className={`group flex items-center gap-3 transition-opacity duration-300 ${active === i ? "opacity-100" : "opacity-40 hover:opacity-80"}`}
					>
						<span className="font-[Outfit] text-[10px] tracking-[0.2em] uppercase text-foreground">
							{chapter.label}
						</span>
						<span
							className={`w-2 h-2 rotate-45 border border-foreground transition-colors duration-300 ${active === i ? "bg-foreground" : "bg-transparent"}`}
						/>
					</button>
				))}
			</nav>

			<Landing className="story-section" />

			<IntroScene
				index={1}
				label="01 / IDENTITY"
				title="关于我们"
				subtitle="AESTAS GLOW"
				paragraphs={[
					"我们是一个充满活力的中V社团。",
					"系列歌曲、原创专辑、同人制品、原创虚拟歌姬……从视觉、音乐、文字到影像，我们用爱发电，在虚构与真实的交界处构建属于我们的世界。",
				]}
				variant="left"
				className="story-section"
			/>

			<IntroScene
				index={2}
				label="02 / OBJECTIVE"
				title="寻找同好"
				subtitle="WHO WE NEED"
				paragraphs={[
					"无论你的专长是绘画、作曲、视频、作词还是设计，都可以在这里找到位置。",
					"期待你带着想法与作品前来，与我们一起把夏光拉得更长。",
				]}
				highlights={[
					"插画绘制",
					"文案作词",
					"视频制作",
					"作曲编曲",
					"项目策划",
					"平面设计",
					"活动运营"
				]}
				variant="right"
				className="story-section"
			/>

			<RecruitForm className="story-section" />
		</main>
	);
}
