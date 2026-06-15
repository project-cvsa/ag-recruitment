import { useEffect, useRef } from "react";
import gsap from "gsap";

export function RightTitle() {
	const containerRef = useRef(null);

	useEffect(() => {
		const ctx = gsap.context(() => {
			const rows = gsap.utils.toArray(".reveal-row");

			rows.forEach((row: any, index) => {
				const mask = row.querySelector(".reveal-mask");
				const text = row.querySelector(".reveal-text");

				const tl = gsap.timeline({
					delay: 0.4 + index * 0.2,
					defaults: { ease: "power2.inOut", duration: 0.4 },
				});

				tl.set(mask, { scaleX: 0, transformOrigin: "right" }) // 1. mask width=0, anchor=right, text invisible
					.set(text, { opacity: 0 })
					.to(mask, { scaleX: 1 }) // 2. mask width=full, anchor=right
					.set(text, { opacity: 1 }) // 3. text visible
					.set(mask, { transformOrigin: "left" }) //    anchor left
					.to(mask, { scaleX: 0 }); // 4. mask width=0, anchor=left
			});
		}, containerRef);

		return () => ctx.revert();
	}, []);

	return (
		<div
			ref={containerRef}
			className="h-auto md:h-55 relative mx-auto ml-auto ms-auto right-0 
			md:right-8 lg:right-40 flex flex-col justify-end gap-1 md:gap-4 text-right"
		>
			<div className="reveal-row relative overflow-hidden self-end md:self-end flex items-center justify-end">
				<span className="reveal-text block text-[clamp(1rem,3.5vw,3rem)] leading-[1em] font-[240] select-none opacity-0">
					欢迎加入
				</span>
				<div className="reveal-mask scale-x-0 absolute inset-0 bg-foreground pointer-events-none" />
			</div>

			<div className="reveal-row relative overflow-hidden self-end md:self-end flex items-center justify-end">
				<span className="reveal-text block text-[clamp(2.75rem,16vw,6rem)] leading-[1em] font-[210] select-none opacity-0">
					夏光社
				</span>
				<div className="reveal-mask scale-x-0 absolute inset-0 bg-foreground pointer-events-none" />
			</div>
		</div>
	);
}
