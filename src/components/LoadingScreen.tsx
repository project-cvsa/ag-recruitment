import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface LoadingScreenProps {
	onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const barRef = useRef<HTMLDivElement>(null);
	const [exiting, setExiting] = useState(false);

	useEffect(() => {
		let cancelled = false;

		const run = async () => {
			if (document.fonts?.ready) {
				await document.fonts.ready;
			}
			await new Promise((r) => setTimeout(r, 600));
			if (cancelled) return;
			setExiting(true);
		};

		run();

		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		if (!exiting || !containerRef.current) return;

		const tl = gsap.timeline({
			onComplete: () => onComplete(),
		});

		tl.to(barRef.current, {
			scaleX: 0,
			duration: 0.3,
			ease: "power2.in",
		})
			.to(
				".load-text",
				{ y: -20, opacity: 0, duration: 0.35, ease: "power2.in" },
				"-=0.2",
			)
			.to(
				containerRef.current,
				{ opacity: 0, duration: 0.5, ease: "power3.inOut" },
				"-=0.25",
			);

		return () => {
			tl.kill();
		};
	}, [exiting, onComplete]);

	return (
		<div
			ref={containerRef}
			className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-8 bg-background"
		>
			<div className="load-text flex flex-col items-center gap-2">
				<span className="font-[Outfit] tracking-[0.3em] uppercase text-foreground/50">
					AESTAS GLOW
				</span>
				<span className="font-[Outfit] tracking-[0.25em] uppercase text-foreground/30">
					加载中……
				</span>
			</div>

			<div className="w-24 h-px bg-foreground/15 overflow-hidden">
				<div
					ref={barRef}
					className="h-full w-full bg-foreground/60 origin-right"
				/>
			</div>
		</div>
	);
}
