import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";

function MarqueeRow({
    children,
    direction = "left",
    speed = 30,
}: {
    children: ReactNode;
    direction?: "left" | "right";
    speed?: number;
}) {
    const rowRef = useRef<HTMLDivElement>(null);
    const tweenRef = useRef<gsap.core.Tween | null>(null);

    useLayoutEffect(() => {
        const setup = () => {
            const row = rowRef.current;
            if (!row) return;

            const totalWidth = row.scrollWidth / 2;
            if (totalWidth === 0) return;

            if (tweenRef.current) {
                tweenRef.current.kill();
            }

            const fromX = direction === "left" ? 0 : -totalWidth;
            const toX = direction === "left" ? -totalWidth : 0;

            tweenRef.current = gsap.fromTo(
                row,
                { x: fromX },
                {
                    x: toX,
                    ease: "none",
                    duration: (1 / speed) * 500,
                    repeat: -1,
                },
            );
        };

        if (document.fonts?.ready) {
            document.fonts.ready.then(setup);
        } else {
            setup();
        }

        window.addEventListener("resize", setup);

        return () => {
            tweenRef.current?.kill();
            tweenRef.current = null;
            window.removeEventListener("resize", setup);
        };
    }, [direction, speed, children]);

    return (
        <div className="overflow-hidden whitespace-nowrap py-2">
            <div
                ref={rowRef}
                className="inline-block will-change-transform"
            >
                {children} {children}
            </div>
        </div>
    );
}

export function Background() {
    const stageRef = useRef<HTMLDivElement>(null);
    const [currentScene, setCurrentScene] = useState<1 | 2 | 3>(1);

    useEffect(() => {
        let timer: number;

        const runSequence = () => {
            timer = setTimeout(() => {
                setCurrentScene(2);

                timer = setTimeout(() => {
                    setCurrentScene(3);

                    timer = setTimeout(() => {
                        setCurrentScene(1);
                        runSequence();
                    }, 4000);
                }, 2500);
            }, 3500);
        };

        runSequence();

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!stageRef.current) return;

        const scaleMap = { 1: 1.1, 2: 1.6, 3: 1.2 };
        
        gsap.to(stageRef.current, {
            scale: scaleMap[currentScene],
            duration: 0.4,
            ease: "power2.out"
        });
    }, [currentScene]);

    return (
        <div
            ref={stageRef}
            className="absolute inset-0 z-0 overflow-hidden bg-background opacity-4
            skew-y-6 -skew-x-14 pointer-events-none select-none font-[Outfit] font-black uppercase tracking-tighter"
        >
            {currentScene === 1 && (
                <div className="scene-1 text-[8rem] leading-[1.1] text-foreground">
                    <MarqueeRow direction="left" speed={16}>AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦</MarqueeRow>
                    <MarqueeRow direction="left" speed={13}>AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦</MarqueeRow>
                    <MarqueeRow direction="left" speed={15}>AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦</MarqueeRow>
                    <MarqueeRow direction="left" speed={18}>AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦</MarqueeRow>
                    <MarqueeRow direction="left" speed={9}>AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦</MarqueeRow>
                    <MarqueeRow direction="left" speed={11}>AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦</MarqueeRow>
                </div>
            )}

            {currentScene === 2 && (
                <div className="scene-2 text-[9rem] leading-none text-foreground">
                    <MarqueeRow direction="left" speed={7}>AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦</MarqueeRow>
                    <MarqueeRow direction="left" speed={9}>AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦</MarqueeRow>
                    <MarqueeRow direction="left" speed={11}>AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦</MarqueeRow>
                    <MarqueeRow direction="left" speed={6}>AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦</MarqueeRow>
                    <MarqueeRow direction="left" speed={5}>AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦</MarqueeRow>
                    <MarqueeRow direction="left" speed={8}>AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦</MarqueeRow>
                </div>
            )}

            {currentScene === 3 && (
                <div className="scene-3 text-[6.5rem] leading-[1.2] text-foreground">
                    <MarqueeRow direction="left" speed={12}>AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦</MarqueeRow>
                    <MarqueeRow direction="left" speed={14}>AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦</MarqueeRow>
                    <MarqueeRow direction="left" speed={13}>AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦</MarqueeRow>
                    <MarqueeRow direction="left" speed={15}>AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦</MarqueeRow>
                    <MarqueeRow direction="left" speed={11}>AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦</MarqueeRow>
                    <MarqueeRow direction="left" speed={11}>AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦</MarqueeRow>
                    <MarqueeRow direction="left" speed={11}>AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦ AESTAS GLOW ✦</MarqueeRow>
                </div>
            )}
        </div>
    );
}