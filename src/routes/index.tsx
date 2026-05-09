import { createFileRoute, Link } from "@tanstack/react-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createPixelReveal } from "landing-effects";
import Lenis from "lenis";
import { lazy, Suspense, useEffect, useRef } from "react";
import { redirectIfAuth } from "#/lib/auth-guards";
import CardNav from "@/components/bits/CardNav";

const MagicBento = lazy(() => import("@/components/bits/MagicBento"));

gsap.registerPlugin(ScrollTrigger);

export const Route = createFileRoute("/")({
	component: LandingPage,
	beforeLoad: redirectIfAuth,
});

function LandingPage() {
	const heroRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const blobsRef = useRef<HTMLDivElement>(null);
	const featuresHeaderRef = useRef<HTMLDivElement>(null);
	const ctaRef = useRef<HTMLDivElement>(null);
	const footerRef = useRef<HTMLElement>(null);

	/* ── Cursor spotlight for hero ── */
	useEffect(() => {
		const hero = heroRef.current;
		if (!hero) return;
		const handleMouseMove = (e: MouseEvent) => {
			hero.style.setProperty("--mx", `${e.clientX}px`);
			hero.style.setProperty("--my", `${e.clientY}px`);
		};
		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, []);

	/* ── Pixel reveal canvas ── */
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const cleanup = createPixelReveal({
			canvas,
			imageSrc: "/landing.png",
			glitchRegion: 1 / 3,
		});
		return cleanup;
	}, []);

	/* ── Lenis smooth scroll + GSAP ScrollTrigger ── */
	useEffect(() => {
		const lenis = new Lenis({
			duration: 1.2,
			easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
			smoothWheel: true,
			lerp: 0.1,
		});

		/* Sync Lenis with GSAP ticker */
		lenis.on("scroll", ScrollTrigger.update);
		gsap.ticker.add((time) => {
			lenis.raf(time * 1000);
		});
		gsap.ticker.lagSmoothing(0);

		/* ── Hero image parallax ── */
		const heroImage = canvasRef.current;
		if (heroImage) {
			gsap.to(heroImage, {
				yPercent: -8,
				ease: "none",
				scrollTrigger: {
					trigger: heroRef.current,
					start: "top top",
					end: "bottom top",
					scrub: 1,
				},
			});
		}

		/* ── Background blobs parallax ── */
		const blobs = blobsRef.current;
		if (blobs) {
			const blobEls = blobs.querySelectorAll(".ambient-blob");
			blobEls.forEach((blob, i) => {
				gsap.to(blob, {
					yPercent: (i + 1) * -12,
					ease: "none",
					scrollTrigger: {
						trigger: contentRef.current,
						start: "top bottom",
						end: "bottom top",
						scrub: 1.5,
					},
				});
			});
		}

		/* ── Features header reveal ── */
		const featHeader = featuresHeaderRef.current;
		if (featHeader) {
			const children = featHeader.children;
			gsap.from(children, {
				y: 60,
				opacity: 0,
				duration: 1,
				ease: "power3.out",
				stagger: 0.12,
				scrollTrigger: {
					trigger: featHeader,
					start: "top 80%",
					end: "top 50%",
					toggleActions: "play none none reverse",
				},
			});
		}

		/* ── CTA reveal ── */
		const ctaSection = ctaRef.current;
		if (ctaSection) {
			const children = ctaSection.children[0].children;
			gsap.from(children, {
				y: 50,
				opacity: 0,
				duration: 0.9,
				ease: "power3.out",
				stagger: 0.1,
				scrollTrigger: {
					trigger: ctaSection,
					start: "top 78%",
					toggleActions: "play none none reverse",
				},
			});
		}

		/* ── Footer reveal ── */
		const footer = footerRef.current;
		if (footer) {
			gsap.from(footer, {
				y: 30,
				opacity: 0,
				duration: 0.8,
				ease: "power3.out",
				scrollTrigger: {
					trigger: footer,
					start: "top 92%",
					toggleActions: "play none none reverse",
				},
			});
		}

		return () => {
			lenis.destroy();
			ScrollTrigger.getAll().forEach((t) => t.kill());
		};
	}, []);

	return (
		<div className="min-h-screen text-[#f5f0eb] relative overflow-x-hidden leading-normal bg-background">
			{/* Warm top glow */}
			<div
				className="fixed inset-0 pointer-events-none z-0"
				style={{
					background:
						"radial-gradient(ellipse 80% 60% at 50% -10%, oklch(24% 0.03 55 / 0.18), transparent)",
				}}
			/>

			{/* Ambient blobs */}
			<div
				ref={blobsRef}
				className="fixed inset-0 pointer-events-none overflow-hidden z-0"
			>
				<div
					className="ambient-blob absolute rounded-full blur-[120px] will-change-transform opacity-60"
					style={{
						width: "600px",
						height: "600px",
						background:
							"radial-gradient(circle, oklch(58% 0.16 35 / 0.08) 0%, transparent 60%)",
						top: "-5%",
						left: "10%",
						animation: "blobDrift1 22s ease-in-out infinite alternate",
					}}
				/>
				<div
					className="ambient-blob absolute rounded-full blur-[100px] will-change-transform opacity-50"
					style={{
						width: "500px",
						height: "500px",
						background:
							"radial-gradient(circle, oklch(55% 0.14 45 / 0.06) 0%, transparent 55%)",
						bottom: "15%",
						right: "-5%",
						animation: "blobDrift2 28s ease-in-out infinite alternate",
					}}
				/>
			</div>

			{/* Grain */}
			<div
				className="fixed inset-0 pointer-events-none z-1 opacity-40"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
					backgroundRepeat: "repeat",
					backgroundSize: "200px 200px",
				}}
			/>

			{/* Top Navigation — CardNav */}
			<CardNav />

			{/* Content */}
			<div ref={contentRef} className="relative z-2">
				{/* Hero */}
				<section
					ref={heroRef}
					className="relative flex items-center"
					style={{ "--mx": "50%", "--my": "50%" } as React.CSSProperties}
				>
					{/* Cursor spotlight */}
					<div
						className="absolute inset-0 pointer-events-none z-1 opacity-0 transition-opacity duration-500"
						style={{
							background:
								"radial-gradient(500px circle at var(--mx) var(--my), oklch(62% 0.16 35 / 0.07), transparent 45%)",
						}}
					/>

					<div className="grid grid-cols-[1fr_1.25fr] gap-10 max-w-7xl mx-auto px-10 pt-24 pb-20 items-center min-h-dvh max-lg:grid-cols-1 max-lg:gap-14 max-lg:px-8 max-lg:pt-24 max-lg:pb-16 max-lg:min-h-0 max-sm:px-6 max-sm:pt-20 max-sm:pb-12">
						<div className="relative z-2">
							{/* Eyebrow */}
							<div className="flex items-center gap-3 mb-7 animate-reveal-up">
								<span className="inline-block w-1.5 h-1.5 rounded-full bg-[#d97757] animate-pulse" />
								<span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#d97757]">
									Analytics for writers
								</span>
							</div>

							{/* Headline */}
							<h1
								className="font-display font-semibold leading-[0.98] tracking-[-0.035em] mb-7"
								style={{ fontSize: "clamp(52px, 6.5vw, 96px)" }}
							>
								<span className="block overflow-hidden">
									<span className="block animate-reveal-line">Know your</span>
								</span>
								<span className="block overflow-hidden">
									<span
										className="block animate-reveal-line"
										style={{ animationDelay: "0.12s" }}
									>
										audience.
									</span>
								</span>
							</h1>

							{/* Description */}
							<p className="text-[17px] text-[#a8a29e] leading-[1.65] max-w-105 mb-8 font-light animate-fade-in">
								Privacy-first analytics for blogs and publishers. No cookies, no
								trackers, no data leaks. Just insights that respect your
								readers.
							</p>

							{/* CTA + stats row */}
							<div className="flex flex-col gap-6 animate-fade-in-delay">
								<Link
									to="/register"
									className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-[10px] text-[14px] font-semibold bg-[#d97757] text-[#0c0a09] transition-all hover:-translate-y-0.5 hover:brightness-110 w-fit"
									style={{
										boxShadow: "0 10px 28px oklch(62% 0.16 35 / 0.22)",
									}}
								>
									Start free
									<svg
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2.5"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="transition-transform group-hover:translate-x-0.5"
									>
										<path d="M5 12h14" />
										<path d="m12 5 7 7-7 7" />
									</svg>
								</Link>

								{/* Mini stats */}
								<div className="flex items-center gap-5 text-[13px] text-[#a8a29e]">
									<div className="flex items-center gap-2">
										<span className="font-display text-[15px] font-semibold text-[#f5f0eb]">
											2,400
										</span>
										<span className="opacity-70">GitHub stars</span>
									</div>
									<span className="w-px h-3 bg-[#292524]" />
									<div className="flex items-center gap-2">
										<span className="font-display text-[15px] font-semibold text-[#f5f0eb]">
											1,200+
										</span>
										<span className="opacity-70">sites tracking</span>
									</div>
								</div>
							</div>
						</div>

						{/* Dashboard mockup */}
						<div className="relative max-lg:order-first max-lg:max-w-140 max-lg:mx-auto animate-fade-in max-w-96 ml-auto">
							<canvas
								ref={canvasRef}
								width={843}
								height={1264}
								className="w-full h-auto rounded-2xl"
							/>
						</div>
					</div>
				</section>

				{/* Features — MagicBento */}
				<section className="px-12 py-28 max-w-330 mx-auto max-lg:px-8 max-lg:py-20 max-sm:px-6 max-sm:py-16">
					<div ref={featuresHeaderRef} className="mb-16 text-center">
						<p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#a8a29e] mb-4">
							Why Tanilytics
						</p>
						<h2
							className="font-display font-semibold tracking-[-0.02em] leading-[1.08] mb-5 mx-auto"
							style={{ fontSize: "clamp(32px, 4vw, 56px)" }}
						>
							Built for publishers,
							<br />
							not ad networks.
						</h2>
						<p className="text-lg text-[#a8a29e] leading-[1.7] max-w-120 mx-auto">
							Every feature is designed around one idea: understand your readers
							without violating their privacy.
						</p>
					</div>

					<Suspense fallback={<div className="h-96" />}>
						<MagicBento
							textAutoHide={true}
							enableStars
							enableSpotlight
							enableBorderGlow={true}
							enableTilt={false}
							enableMagnetism={false}
							clickEffect
							spotlightRadius={400}
							particleCount={12}
							glowColor="217, 119, 87"
							disableAnimations={false}
						/>
					</Suspense>
				</section>

				{/* CTA */}
				<section
					ref={ctaRef}
					className="px-12 py-32 max-lg:px-8 max-lg:py-24 max-sm:px-6 max-sm:py-20"
				>
					<div className="max-w-180 mx-auto text-center">
						<h2
							className="font-display font-semibold tracking-[-0.02em] leading-[1.05] mb-6"
							style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
						>
							Own your data. Know your audience.
						</h2>
						<p className="text-lg text-[#a8a29e] leading-[1.7] mb-10 max-w-110 mx-auto">
							Free for personal blogs. Set up in five minutes with a single
							script tag.
						</p>
						<Link
							to="/register"
							className="group inline-flex items-center gap-3 px-8 py-4 rounded-[10px] text-[15px] font-semibold bg-[#d97757] text-[#0c0a09] transition-all hover:-translate-y-0.5 hover:brightness-110"
							style={{ boxShadow: "0 12px 32px oklch(62% 0.16 35 / 0.25)" }}
						>
							Start tracking free
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="transition-transform group-hover:translate-x-0.5"
							>
								<path d="M5 12h14" />
								<path d="m12 5 7 7-7 7" />
							</svg>
						</Link>

						<div className="flex items-center justify-center gap-6 mt-12 text-[13px] text-[#a8a29e]">
							{["GDPR Ready", "No Cookies", "Self-hosted", "Open Source"].map(
								(badge, i) => (
									<span key={badge} className="flex items-center gap-6">
										<span className="flex items-center gap-2">
											<span className="w-1 h-1 rounded-full bg-[#d97757]" />
											{badge}
										</span>
										{i < 3 && <span className="w-px h-3 bg-[#292524]" />}
									</span>
								),
							)}
						</div>
					</div>
				</section>

				{/* Footer */}
				<footer
					ref={footerRef}
					className="max-w-330 mx-auto px-12 py-12 flex justify-between items-center flex-wrap gap-6 text-[13px] text-[#a8a29e] border-t border-[#292524] max-sm:px-6 max-sm:flex-col max-sm:items-start"
				>
					<div className="flex gap-8 flex-wrap">
						<a href="#" className="hover:text-[#f5f0eb] transition-colors">
							Docs
						</a>
						<a href="#" className="hover:text-[#f5f0eb] transition-colors">
							GitHub
						</a>
						<a href="#" className="hover:text-[#f5f0eb] transition-colors">
							Privacy
						</a>
					</div>
					<p>&copy; 2026 Tanilytics</p>
				</footer>
			</div>

			<style>{`
        @keyframes blobDrift1 { from { transform: translate(0,0) scale(1); } to { transform: translate(60px,40px) scale(1.15); } }
        @keyframes blobDrift2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-40px,60px) scale(1.1); } }

        @keyframes revealUp {
          from { opacity: 0; transform: translateY(110%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-reveal-line {
          animation: revealUp 0.9s cubic-bezier(.16,1,.3,1) forwards;
          opacity: 0;
        }
        .animate-reveal-up {
          animation: revealUp 0.8s cubic-bezier(.16,1,.3,1) 0.2s forwards;
          opacity: 0;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out 0.5s forwards;
          opacity: 0;
        }
        .animate-fade-in-delay {
          animation: fadeIn 1s ease-out 0.7s forwards;
          opacity: 0;
        }
      `}</style>
		</div>
	);
}
