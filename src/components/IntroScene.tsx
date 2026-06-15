import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface IntroSceneProps {
	index: number;
	label: string;
	title: string;
	subtitle: string;
	paragraphs: string[];
	highlights?: string[];
	variant?: "left" | "right";
	className?: string;
}

export function IntroScene({
	index,
	label,
	title,
	subtitle,
	paragraphs,
	highlights,
	variant = "left",
	className,
}: IntroSceneProps) {
	const sectionRef = useRef<HTMLElement>(null);

	useEffect(() => {
		const ctx = gsap.context(() => {
			const isRight = variant === "right";
			const xEnterTitle = isRight ? 80 : -80;
			const xEnterText = isRight ? -60 : 60;
			const xExitTitle = isRight ? -80 : 80;
			const xExitText = isRight ? 60 : -60;

			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: sectionRef.current,
					start: "top top",
					end: "+=110%",
					pin: true,
					scrub: 0.6,
					invalidateOnRefresh: true,
				},
			});

			tl.addLabel("enter", 0)
				.fromTo(
					".scene-label",
					{ x: -40, opacity: 0 },
					{ x: 0, opacity: 1, duration: 0.16, ease: "power2.out" },
					"enter"
				)
				.fromTo(
					".scene-watermark",
					{ scale: 0.8, opacity: 0, rotation: isRight ? 8 : -8 },
					{ scale: 1, opacity: 0.06, rotation: 0, duration: 0.28, ease: "power2.out" },
					"enter"
				)
				.fromTo(
					".scene-title-line",
					{ x: xEnterTitle, opacity: 0 },
					{ x: 0, opacity: 1, duration: 0.24, stagger: 0.03, ease: "power2.out" },
					"enter+=0.04"
				)
				.fromTo(
					".scene-divider",
					{ scaleX: 0 },
					{ scaleX: 1, duration: 0.24, ease: "power2.inOut" },
					"enter+=0.12"
				)
				.fromTo(
					".scene-para",
					{ x: xEnterText, opacity: 0 },
					{ x: 0, opacity: 1, duration: 0.2, stagger: 0.06, ease: "power2.out" },
					"enter+=0.12"
				)
				.fromTo(
					".scene-highlight",
					{ y: 30, opacity: 0 },
					{ y: 0, opacity: 1, duration: 0.18, stagger: 0.03, ease: "power2.out" },
					"enter+=0.2"
				)
				.fromTo(
					".scene-geo",
					{ scale: 0, rotation: isRight ? -45 : 45, opacity: 0 },
					{
						scale: 1,
						rotation: 0,
						opacity: 1,
						duration: 0.24,
						stagger: 0.04,
						ease: "back.out(1.2)",
					},
					"enter+=0.08"
				)
				.addLabel("settle", 0.32)
				.to({}, { duration: 0.18 }, "settle")
				.addLabel("exit", 0.5)
				.to(
					".scene-title-line",
					{ x: xExitTitle, opacity: 0, duration: 0.2, ease: "power2.in" },
					"exit"
				)
				.to(
					".scene-para",
					{ x: xExitText, opacity: 0, duration: 0.2, ease: "power2.in" },
					"exit"
				)
				.to(
					".scene-highlight",
					{ y: -20, opacity: 0, duration: 0.16, stagger: 0.02, ease: "power2.in" },
					"exit"
				)
				.to(".scene-divider", { scaleX: 0, duration: 0.16, ease: "power2.inOut" }, "exit")
				.to(
					".scene-geo",
					{
						scale: 1.3,
						rotation: isRight ? 45 : -45,
						opacity: 0,
						duration: 0.2,
						stagger: 0.03,
						ease: "power2.in",
					},
					"exit"
				)
				.to(".scene-label", { opacity: 0, duration: 0.12, ease: "power2.in" }, "exit")
				.to(
					".scene-watermark",
					{ opacity: 0, scale: 1.1, duration: 0.24, ease: "power2.in" },
					"exit"
				);
		}, sectionRef);

		return () => ctx.revert();
	}, [variant]);

	const isRight = variant === "right";

	return (
		<section
			ref={sectionRef}
			className={`story-section relative w-full h-screen overflow-hidden flex items-center ${className ?? ""}`}
		>
			{/* rotating geometric decorations */}
			<div
				className="scene-geo absolute z-0 pointer-events-none"
				style={{ top: "18%", left: isRight ? "12%" : "78%" }}
			>
				<div className="w-24 h-24 border border-foreground/40 rotate-45 animate-[spin_20s_linear_infinite]" />
			</div>
			<div
				className="scene-geo absolute z-0 pointer-events-none"
				style={{ bottom: "20%", left: isRight ? "78%" : "16%" }}
			>
				<div className="w-16 h-16 border border-foreground/30 rounded-full animate-[spin_30s_linear_infinite_reverse]" />
			</div>

			{/* watermark number */}
			<div
				className={`scene-watermark absolute z-0 font-[Outfit] font-black 
					text-[clamp(12rem,28vw,24rem)] leading-none text-stroke
					 pointer-events-none select-none ${isRight ? "right-[10%]" : "left-[5%]"}`}
			>
				{String(index).padStart(2, "0")}
			</div>

			<div className="relative z-10 w-full px-6 md:px-14 lg:px-36">
				<div className={"mx-3 scene-label mb-8 font-[Outfit] text-[11px] tracking-[0.25em] uppercase text-foreground/70 "
					+ (isRight ? "md:text-right relative md:right-[10%]" : "")
				}>
					{label}
				</div>

				<div
					className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 
						items-center ${isRight ? "lg:text-right" : ""}`}
				>
					<div className={`lg:col-span-6 ${isRight ? "lg:order-2" : ""} relative`}>
						<h2 className="scene-title-line text-[clamp(3.5rem,6vw,6rem)] 
						leading-[0.9] font-extralight tracking-tight text-foreground">
							{title}
						</h2>
						<div
							className={`scene-divider w-3/4 h-px bg-foreground/40 my-6 origin-left
								 ${isRight ? "lg:origin-right lg:ml-auto" : ""}`}
						/>
						<p className="scene-title-line font-[Outfit] text-lg md:text-xl tracking-widest uppercase text-foreground/80">
							{subtitle}
						</p>
					</div>

					<div className={`lg:col-span-5 text-left ${isRight ? "lg:order-1 n" : "lg:col-start-8"}`}>
						{paragraphs.map((p, i) => (
							<p
								key={i}
								className="scene-para text-base md:text-lg leading-relaxed text-foreground/90 mb-6 last:mb-0"
							>
								{p}
							</p>
						))}

						{highlights && highlights.length > 0 && (
							<div
								className="mt-8 flex flex-wrap gap-3"
							>
								{highlights.map((h) => (
									<span
										key={h}
										className="scene-highlight border border-foreground/50 px-3 py-1 font-[Outfit] text-[10px] tracking-[0.15em] uppercase text-foreground/80"
									>
										{h}
									</span>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
