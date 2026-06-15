import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Background } from "./Bg";
import { LeftTitle } from "./LeftTitle";
import { RightTitle } from "./RightTitle";

gsap.registerPlugin(ScrollTrigger);

function CornerBracket({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
	const map = {
		tl: "top-6 left-6 border-t-2 border-l-2",
		tr: "top-6 right-6 border-t-2 border-r-2",
		bl: "bottom-6 left-6 border-b-2 border-l-2",
		br: "bottom-6 right-6 border-b-2 border-r-2",
	};
	return <div className={`corner-bracket ${map[position]}`} />;
}

export function Landing({ className }: { className?: string }) {
	const sectionRef = useRef<HTMLElement>(null);

	useEffect(() => {
		const ctx = gsap.context(() => {
			// Entrance: corner brackets, status indicators, scroll cue
			const introTl = gsap.timeline({ delay: 0.6 });
			introTl
				.fromTo(
					".corner-bracket",
					{ scale: 0, opacity: 0 },
					{ scale: 1, opacity: 1, duration: 0.4, stagger: 0.06, ease: "back.out(1.6)" }
				)
				.fromTo(
					".hero-meta",
					{ y: -16, opacity: 0 },
					{ y: 0, opacity: 1, duration: 0.45, stagger: 0.12, ease: "power2.out" },
					"-=0.2"
				)
				.fromTo(
					".scroll-cue",
					{ y: 20, opacity: 0 },
					{ y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
					"-=0.25"
				);

			// Scroll-driven exit
			const exitTl = gsap.timeline({
				scrollTrigger: {
					trigger: sectionRef.current,
					start: "top top",
					end: "+=100%",
					pin: true,
					scrub: 0.6,
					invalidateOnRefresh: true,
				},
			});

			exitTl
				.addLabel("settle", 0)
				.to({}, { duration: 0.25 }, "settle")
				.addLabel("exit", 0.25)
				.to(
					".hero-title-left",
					{ x: "-55vw", opacity: 0, duration: 0.35, ease: "power2.in" },
					"exit"
				)
				.to(
					".hero-title-right",
					{ x: "55vw", opacity: 0, duration: 0.35, ease: "power2.in" },
					"exit"
				)
				.to(".hero-meta", { y: -24, opacity: 0, duration: 0.25, ease: "power2.in" }, "exit")
				.to(".scroll-cue", { opacity: 0, duration: 0.1, ease: "none" }, "exit")
				.to(".bg", { scale: 1.25, opacity: 0, duration: 0.4, ease: "power2.inOut" }, "exit")
				.to(
					".corner-bracket",
					{ scale: 0, opacity: 0, duration: 0.25, stagger: 0.03, ease: "back.in(1.5)" },
					"exit"
				);
		}, sectionRef);

		return () => ctx.revert();
	}, []);

	return (
		<section
			ref={sectionRef}
			className={`story-section relative w-full h-screen flex items-center justify-center overflow-hidden ${className ?? ""}`}
		>
			<div className="bg absolute inset-0 z-0">
				<Background />
			</div>

			{(["tl", "tr", "bl", "br"] as const).map((pos) => (
				<CornerBracket key={pos} position={pos} />
			))}
			
			<div className="hero-main relative z-10 w-full h-full m-4 pt-20 
			md:pt-0 flex flex-col md:flex-row items-start md:items-center justify-center md:justify-start gap-3 md:gap-0">
				<div className="hero-title-left md:ml-4">
					<LeftTitle />
				</div>
				<div className="hero-title-right w-full md:w-auto md:ml-auto">
					<RightTitle />
				</div>
			</div>

			<div className="scroll-cue absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-4 opacity-0">
				<span className="font-[Outfit] text-[10px] tracking-[0.25em] uppercase text-foreground/70">
					开启旅程
				</span>
				<div className="relative w-px h-16 overflow-hidden bg-foreground/20">
					<div className="absolute top-0 left-0 w-full h-1/3 bg-foreground animate-scroll-pulse" />
				</div>
			</div>
		</section>
	);
}
