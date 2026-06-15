import { useEffect, useRef } from "react";
import gsap from "gsap";

export function LeftTitle() {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".animate-inner",
                {
                    x: -150,
                    opacity: 0,
                },
                {
                    x: 0,
                    opacity: 1,
                    stagger: 0.15,
                    duration: 1,
                    ease: "power3.out",
                }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={containerRef}
            className="select-none relative 2xl:left-30 h-auto md:h-80 mx-auto 
            md:mx-0 flex flex-col gap-0 text-[clamp(3rem,7vw,6.4rem)] 
            leading-[0.95em] font-extralight font-[Outfit] mb-14"
        >
            <div className="block text-center md:text-left">
                <span className="animate-inner opacity-0 block">Fingere</span>
            </div>

            <div className="block translate-x-4 md:translate-x-12 text-center md:text-left">
                <span className="animate-inner opacity-0 block">ut nitor</span>
            </div>

            <div className="block translate-x-8 md:translate-x-24 text-center md:text-left">
                <span className="animate-inner opacity-0 block">aestātis</span>
            </div>
        </div>
    );
}