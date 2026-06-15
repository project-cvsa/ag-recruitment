import { useEffect, useRef } from "react";
import gsap from "gsap";

export function LeftTitle() {
	const containerRef = useRef(null);

	useEffect(() => {
		const ctx = gsap.context(() => {
			gsap.from(".animate-line", {
				x: "-=150",
				opacity: 0,
				stagger: 0.15,
				duration: 1,
				ease: "power3.out",
			});
		}, containerRef);

		return () => ctx.revert();
	}, []);

	return (
		<div
			ref={containerRef}
			className="select-none relative 2xl:left-30 h-auto md:h-80 mx-auto 
			md:mx-0 flex flex-col gap-0 text-[clamp(1.75rem,7vw,6.4rem)] 
			leading-[0.95em] font-extralight font-[Outfit]"
		>
			<span className="animate-line block text-center md:text-left">Fingere</span>
			<span className="animate-line block md:translate-x-12 text-center md:text-left">ut nitor</span>
			<span className="animate-line block md:translate-x-24 text-center md:text-left">aestātis</span>
		</div>
	);
}
