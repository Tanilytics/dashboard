import { Link } from "@tanstack/react-router";
import { gsap } from "gsap";
import { useLayoutEffect, useRef, useState } from "react";

import "./CardNav.css";

export type CardNavLink = {
	label: string;
	href?: string;
	ariaLabel?: string;
};

export type CardNavItem = {
	label: string;
	bgColor: string;
	textColor: string;
	links: CardNavLink[];
};

export interface CardNavProps {
	className?: string;
	ease?: string;
	baseColor?: string;
	menuColor?: string;
	buttonBgColor?: string;
	buttonTextColor?: string;
}

const items: CardNavItem[] = [
	{
		label: "Product",
		bgColor: "#1e1c1a",
		textColor: "#f5f0eb",
		links: [
			{
				label: "Overview",
				href: "/dashboard",
				ariaLabel: "Dashboard Overview",
			},
			{
				label: "Realtime",
				href: "/dashboard/realtime",
				ariaLabel: "Realtime Analytics",
			},
			{ label: "Pages", href: "/dashboard/pages", ariaLabel: "Page Analytics" },
			{
				label: "Media",
				href: "/dashboard/media",
				ariaLabel: "Media Analytics",
			},
		],
	},
	{
		label: "Resources",
		bgColor: "#242220",
		textColor: "#f5f0eb",
		links: [
			{ label: "Docs", href: "#", ariaLabel: "Documentation" },
			{ label: "GitHub", href: "#", ariaLabel: "GitHub Repository" },
			{ label: "Changelog", href: "#", ariaLabel: "Changelog" },
		],
	},
	{
		label: "Company",
		bgColor: "#242220",
		textColor: "#f5f0eb",
		links: [
			{ label: "About", href: "#", ariaLabel: "About Tanilytics" },
			{ label: "Blog", href: "#", ariaLabel: "Blog" },
			{ label: "Contact", href: "#", ariaLabel: "Contact" },
		],
	},
];

function ArrowUpRight({ className = "" }: { className?: string }) {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			aria-hidden="true"
		>
			<path d="M7 17L17 7" />
			<path d="M7 7h10v10" />
		</svg>
	);
}

function CardNav({
	className = "",
	ease = "power3.out",
	baseColor = "#141210",
	menuColor = "#f5f0eb",
	buttonBgColor = "#1a1816",
	buttonTextColor = "#f5f0eb",
}: CardNavProps) {
	const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const navRef = useRef<HTMLDivElement | null>(null);
	const cardsRef = useRef<HTMLDivElement[]>([]);
	const tlRef = useRef<gsap.core.Timeline | null>(null);

	const calculateHeight = () => {
		const navEl = navRef.current;
		if (!navEl) return 260;

		const isMobile = window.matchMedia("(max-width: 768px)").matches;
		if (isMobile) {
			const contentEl = navEl.querySelector(".card-nav-content") as HTMLElement;
			if (contentEl) {
				const wasVisible = contentEl.style.visibility;
				const wasPointerEvents = contentEl.style.pointerEvents;
				const wasPosition = contentEl.style.position;
				const wasHeight = contentEl.style.height;

				contentEl.style.visibility = "visible";
				contentEl.style.pointerEvents = "auto";
				contentEl.style.position = "static";
				contentEl.style.height = "auto";

				contentEl.offsetHeight;

				const topBar = 60;
				const padding = 16;
				const contentHeight = contentEl.scrollHeight;

				contentEl.style.visibility = wasVisible;
				contentEl.style.pointerEvents = wasPointerEvents;
				contentEl.style.position = wasPosition;
				contentEl.style.height = wasHeight;

				return topBar + contentHeight + padding;
			}
		}
		return 260;
	};

	const createTimeline = () => {
		const navEl = navRef.current;
		if (!navEl) return null;

		gsap.set(navEl, { height: 60, overflow: "hidden" });
		gsap.set(cardsRef.current, { y: 50, opacity: 0 });

		const tl = gsap.timeline({ paused: true });

		tl.to(navEl, {
			height: calculateHeight,
			duration: 0.4,
			ease,
		});

		tl.to(
			cardsRef.current,
			{ y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 },
			"-=0.1",
		);

		return tl;
	};

	useLayoutEffect(() => {
		const tl = createTimeline();
		tlRef.current = tl;

		return () => {
			tl?.kill();
			tlRef.current = null;
		};
	}, [ease, items]);

	useLayoutEffect(() => {
		const handleResize = () => {
			if (!tlRef.current) return;

			if (isExpanded) {
				const newHeight = calculateHeight();
				gsap.set(navRef.current, { height: newHeight });

				tlRef.current.kill();
				const newTl = createTimeline();
				if (newTl) {
					newTl.progress(1);
					tlRef.current = newTl;
				}
			} else {
				tlRef.current.kill();
				const newTl = createTimeline();
				if (newTl) {
					tlRef.current = newTl;
				}
			}
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [isExpanded]);

	const toggleMenu = () => {
		const tl = tlRef.current;
		if (!tl) return;
		if (!isExpanded) {
			setIsHamburgerOpen(true);
			setIsExpanded(true);
			tl.play(0);
		} else {
			setIsHamburgerOpen(false);
			tl.eventCallback("onReverseComplete", () => setIsExpanded(false));
			tl.reverse();
		}
	};

	const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
		if (el) cardsRef.current[i] = el;
	};

	return (
		<div className={`cardnav-wrapper ${className}`}>
			<nav
				ref={navRef}
				className={`cardnav-nav ${isExpanded ? "open" : ""}`}
				style={{ backgroundColor: baseColor }}
			>
				{/* Top bar */}
				<div className="cardnav-top">
					{/* Hamburger */}
					<div
						className={`cardnav-hamburger ${isHamburgerOpen ? "open" : ""}`}
						onClick={toggleMenu}
						role="button"
						aria-label={isExpanded ? "Close menu" : "Open menu"}
						tabIndex={0}
						style={{ color: menuColor }}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") toggleMenu();
						}}
					>
						<span className="cardnav-hamburger-line" />
						<span className="cardnav-hamburger-line" />
					</div>

					{/* Logo — centered on desktop */}
					<Link to="/" className="cardnav-logo">
						<svg width="28" height="28" viewBox="0 0 28 28" fill="none">
							<circle
								cx="14"
								cy="14"
								r="12"
								stroke="#d97757"
								strokeWidth="2.5"
							/>
							<circle cx="14" cy="14" r="5" fill="#d97757" />
						</svg>
						<span>Tanilytics</span>
					</Link>

					{/* CTA */}
					<Link
						to="/register"
						className="cardnav-cta"
						style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
					>
						Get started
					</Link>
				</div>

				{/* Expandable content */}
				<div
					className={`cardnav-content ${isExpanded ? "expanded" : ""}`}
					aria-hidden={!isExpanded}
				>
					{(items || []).slice(0, 3).map((item, idx) => (
						<div
							key={`${item.label}-${idx}`}
							className="cardnav-card"
							ref={setCardRef(idx)}
							style={{
								backgroundColor: item.bgColor,
								color: item.textColor,
							}}
						>
							<div className="cardnav-card-label">{item.label}</div>
							<div className="cardnav-card-links">
								{item.links?.map((lnk, i) => (
									<Link
										key={`${lnk.label}-${i}`}
										className="cardnav-card-link"
										to={lnk.href || "#"}
										aria-label={lnk.ariaLabel}
										onClick={() => {
											if (isExpanded) toggleMenu();
										}}
									>
										<ArrowUpRight className="cardnav-link-arrow" />
										{lnk.label}
									</Link>
								))}
							</div>
						</div>
					))}
				</div>
			</nav>
		</div>
	);
}

export default CardNav;
