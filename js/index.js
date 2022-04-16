gsap.registerPlugin(ScrollTrigger);

smoothScroll("#content");

const horizontalSections = gsap.utils.toArray(".horizontal");

horizontalSections.forEach(function (sec, i) {
	var thisPinWrap = sec.querySelector(".pin-wrap");
	var thisAnimWrap = thisPinWrap.querySelector(".animation-wrap");

	var getToValue = () => -(thisAnimWrap.scrollWidth - window.innerWidth);

	gsap.fromTo(
		thisAnimWrap,
		{
			x: () => (thisAnimWrap.classList.contains("to-right") ? 0 : getToValue())
		},
		{
			x: () => (thisAnimWrap.classList.contains("to-right") ? getToValue() : 0),
			ease: "none",
			scrollTrigger: {
				trigger: sec,
				start: "top top",
				end: () => "+=" + (thisAnimWrap.scrollWidth - window.innerWidth),
				pin: thisPinWrap,
				invalidateOnRefresh: true,
				//anticipatePin: 1,
				scrub: true
				//markers: true,
			}
		}
	);
});

function smoothScroll(content, viewport, smoothness) {
	content = gsap.utils.toArray(content)[0];
	smoothness = smoothness || 1;

	gsap.set(viewport || content.parentNode, {
		overflow: "hidden",
		position: "fixed",
		height: "100%",
		width: "100%",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0
	});
	gsap.set(content, { overflow: "visible", width: "100%" });

	let getProp = gsap.getProperty(content),
		setProp = gsap.quickSetter(content, "y", "px"),
		setScroll = ScrollTrigger.getScrollFunc(window),
		removeScroll = () => (content.style.overflow = "visible"),
		killScrub = (trigger) => {
			let scrub = trigger.getTween ? trigger.getTween() : gsap.getTweensOf(trigger.animation)[0]; // getTween() was added in 3.6.2
			scrub && scrub.kill();
			trigger.animation.progress(trigger.progress);
		},
		height,
		isProxyScrolling;

	function refreshHeight() {
		height = content.clientHeight;
		content.style.overflow = "visible";
		document.body.style.height = height + "px";
		return height - document.documentElement.clientHeight;
	}

	ScrollTrigger.addEventListener("refresh", () => {
		removeScroll();
		requestAnimationFrame(removeScroll);
	});
	ScrollTrigger.defaults({ scroller: content });
	ScrollTrigger.prototype.update = (p) => p; // works around an issue in ScrollTrigger 3.6.1 and earlier (fixed in 3.6.2, so this line could be deleted if you're using 3.6.2 or later)

	ScrollTrigger.scrollerProxy(content, {
		scrollTop(value) {
			if (arguments.length) {
				isProxyScrolling = true; // otherwise, if snapping was applied (or anything that attempted to SET the scroll proxy's scroll position), we'd set the scroll here which would then (on the next tick) update the content tween/ScrollTrigger which would try to smoothly animate to that new value, thus the scrub tween would impede the progress. So we use this flag to respond accordingly in the ScrollTrigger's onUpdate and effectively force the scrub to its end immediately.
				setProp(-value);
				setScroll(value);
				return;
			}
			return -getProp("y");
		},
		getBoundingClientRect() {
			return {
				top: 0,
				left: 0,
				width: window.innerWidth,
				height: window.innerHeight
			};
		}
	});

	return ScrollTrigger.create({
		animation: gsap.fromTo(
			content,
			{ y: 0 },
			{
				y: () => document.documentElement.clientHeight - height,
				ease: "none",
				onUpdate: ScrollTrigger.update
			}
		),
		scroller: window,
		invalidateOnRefresh: true,
		start: 0,
		end: refreshHeight,
		refreshPriority: -999,
		scrub: smoothness,
		onUpdate: (self) => {
			if (isProxyScrolling) {
				killScrub(self);
				isProxyScrolling = false;
			}
		},
		onRefresh: killScrub // when the screen resizes, we just want the animation to immediately go to the appropriate spot rather than animating there, so basically kill the scrub.
	});
}
// ====================================================================================================================

const meTl = gsap.timeline({
	onComplete: addMouseEvent,
	delay: 1
});

gsap.set(".bg", { transformOrigin: "50% 50%" });
gsap.set(".ear-right", { transformOrigin: "0% 50%" });
gsap.set(".ear-left", { transformOrigin: "100% 50%" });
gsap.set(".me", { opacity: 1 });

meTl.from(
	".me",
	{
		duration: 1,
		yPercent: 100,
		ease: "elastic.out(0.5, 0.4)"
	},
	0
)
	.from(
		".head , .hair , .shadow",
		{
			duration: 0.9,
			yPercent: 20,
			ease: "elastic.out(0.58, 0.25)"
		},
		0.6
	)
	.from(
		".ear-right",
		{
			duration: 1,
			rotate: 40,
			yPercent: 10,
			ease: "elastic.out(0.5, 0.2)"
		},
		0.7
	)
	.from(
		".ear-left",
		{
			duration: 1,
			rotate: -40,
			yPercent: 10,
			ease: "elastic.out(0.5, 0.2)"
		},
		0.7
	)
	.to(
		".glasses",
		{
			duration: 1,
			keyframes: [{ yPercent: -10 }, { yPercent: -0 }],
			ease: "elastic.out(0.5, 0.2)"
		},
		0.75
	)
	.from(
		".eyebrow-right , .eyebrow-left",
		{
			duration: 1,
			yPercent: 300,
			ease: "elastic.out(0.5, 0.2)"
		},
		0.7
	)
	.to(
		".eye-right , .eye-left",
		{
			duration: 0.01,
			opacity: 1
		},
		0.85
	)
	.to(
		".eye-right-2 , .eye-left-2",
		{
			duration: 0.01,
			opacity: 0
		},
		0.85
	);

const blink = gsap.timeline({
	repeat: -1,
	repeatDelay: 5,
	paused: true
});

blink
	.to(
		".eye-right, .eye-left",
		{
			duration: 0.01,
			opacity: 0
		},
		0
	)
	.to(
		".eye-right-2, .eye-left-2",
		{
			duration: 0.01,
			opacity: 1
		},
		0
	)
	.to(
		".eye-right, .eye-left",
		{
			duration: 0.01,
			opacity: 1
		},
		0.15
	)
	.to(
		".eye-right-2 , .eye-left-2",
		{
			duration: 0.01,
			opacity: 0
		},
		0.15
	);

const dizzy = gsap.timeline({
	paused: true,
	onComplete: () => {
		dizzyIsPlaying = false;
	}
});

dizzy
	.to(
		".eyes",
		{
			duration: 0.01,
			opacity: 0
		},
		0
	)
	.to(
		".dizzy",
		{
			duration: 0.01,
			opacity: 0.3
		},
		0
	)
	.to(
		".mouth",
		{
			duration: 0.01,
			opacity: 0
		},
		0
	)
	.to(
		".oh",
		{
			duration: 0.01,
			opacity: 0.85
		},
		0
	)
	.to(
		".head, .hair-back, .shadow",
		{
			duration: 6,
			rotate: 2,
			transformOrigin: "50% 50%",
			ease: "ease-out"
		},
		0
	)
	.to(
		".me",
		{
			duration: 6,
			rotate: -2,
			transformOrigin: "50% 100%",
			ease: "ease-out"
		},
		0
	)
	.to(
		".me",
		{
			duration: 4,
			scale: 0.99,
			transformOrigin: "50% 100%",
			ease: "ease-in-out"
		},
		0
	)
	.to(
		".dizzy-1",
		{
			rotate: -360,
			duration: 1,
			repeat: 5,
			transformOrigin: "50% 50%",
			ease: "none"
		},
		0.01
	)
	.to(
		".dizzy-2",
		{
			rotate: 360,
			duration: 1,
			repeat: 5,
			transformOrigin: "50% 50%",
			ease: "none"
		},
		0.01
	)
	.to(
		".eyes",
		{
			duration: 0.01,
			opacity: 1
		},
		4
	)
	.to(
		".dizzy",
		{
			duration: 0.01,
			opacity: 0
		},
		4
	)
	.to(
		".oh",
		{
			duration: 0.01,
			opacity: 0
		},
		4
	)
	.to(
		".mouth",
		{
			duration: 0.01,
			opacity: 1
		},
		4
	);

// end animation

// mouse coords stuff

let xPosition;
let yPosition;

let height;
let width;

function percentage(partialValue, totalValue) {
	return (100 * partialValue) / totalValue;
}

let dizzyIsPlaying;
function updateScreenCoords(event) {
	if (!dizzyIsPlaying) {
		xPosition = event.clientX;
		yPosition = event.clientY;
	}
	if (!dizzyIsPlaying && Math.abs(event.movementX) > 500) {
		dizzyIsPlaying = true;
		dizzy.restart();
	}
}

let storedXPosition = 0;
let storedYPosition = 0;

// gsap can use queryselector in the quick setter but this is better for performance as it touches the DOM less
const dom = {
	face: document.querySelector(".face"),
	eye: document.querySelectorAll(".eye"),
	innerFace: document.querySelector(".inner-face"),
	hairFront: document.querySelector(".hair-front"),
	hairBack: document.querySelector(".hair-back"),
	shadow: document.querySelectorAll(".shadow"),
	ear: document.querySelectorAll(".ear"),
	eyebrowLeft: document.querySelector(".eyebrow-left"),
	eyebrowRight: document.querySelector(".eyebrow-right")
};

function animateFace() {
	if (!xPosition) return;
	// important, only recalculating if the value changes
	if (storedXPosition === xPosition && storedYPosition === yPosition) return;

	// range from -50 to 50
	x = percentage(xPosition, width) - 50;
	y = percentage(yPosition, height) - 50;

	// range from -20 to 80
	yHigh = percentage(yPosition, height) - 20;
	// range from -80 to 20
	yLow = percentage(yPosition, height) - 80;

	gsap.to(dom.face, {
		yPercent: yLow / 30,
		xPercent: x / 30
	});
	gsap.to(dom.eye, {
		yPercent: yHigh / 3,
		xPercent: x / 2
	});
	gsap.to(dom.innerFace, {
		yPercent: y / 6,
		xPercent: x / 8
	});
	gsap.to(dom.hairFront, {
		yPercent: yHigh / 15,
		xPercent: x / 22
	});
	gsap.to([dom.hairBack, dom.shadow], {
		yPercent: (yLow / 20) * -1,
		xPercent: (x / 20) * -1
	});
	gsap.to(dom.ear, {
		yPercent: (y / 1.5) * -1,
		xPercent: (x / 10) * -1
	});
	gsap.to([dom.eyebrowLeft, dom.eyebrowRight], {
		yPercent: y * 2.5
	});

	storedXPosition = xPosition;
	storedYPosition = yPosition;
}

// function being called at the end of main timeline
function addMouseEvent() {
	const safeToAnimate = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

	if (safeToAnimate) {
		window.addEventListener("mousemove", updateScreenCoords);

		// gsap's RAF, falls back to set timeout
		gsap.ticker.add(animateFace);

		blink.play();
	}
}

// update if browser resizes
function updateWindowSize() {
	height = window.innerHeight;
	width = window.innerWidth;
}
updateWindowSize();
window.addEventListener("resize", updateWindowSize);

gsap.to(".hero-title-1", {
	xPercent: -10,
	ease: "none",
	scrollTrigger: {
		trigger: ".hero",
		start: "top bottom",
		end: "bottom top",
		scrub: 0
	}
});

gsap.to(".hero-title-2", {
	xPercent: 10,
	ease: "none",
	scrollTrigger: {
		trigger: ".hero",
		start: "top bottom",
		end: "bottom top",
		scrub: 0
	}
});

gsap.to(".hero-subtitle", {
	yPercent: 700,
	scale: 2,
	ease: "linear",
	opacity: 0,
	scrollTrigger: {
		trigger: ".hero",
		start: "top bottom",
		end: "bottom top",
		scrub: 0
	}
});

// ===========================================================

// =======================================================================================================================================

const headerToggle = document.querySelector(".header__nav-toggle");
const headerNav = document.querySelector(".header__nav");
headerToggle.addEventListener("click", () => {
	if (headerNav.classList.contains("open")) {
		headerNav.classList.remove("open");
	} else {
		headerNav.classList.add("open");
	}
});

// if(headerToggle.length) {
// }
