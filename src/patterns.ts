import type { CustomProfile } from "./settings";

interface MotionConfig {
	source: string;
	class: string;
	alt: string;
	repeat?: number;
}

interface ButtonConfig {
	source: string;
	class: string;
	alt: string;
}

type MotionMap = Map<RegExp, MotionConfig>;
type ButtonMap = Map<RegExp, ButtonConfig>;
type ColorMap = Map<RegExp, string>;

// Base motion inputs with SVG data
export const motionMap = (): MotionMap =>
	new Map([
		[
			/(?:j\.|)\bqcf\.|\b236(?![\d\.])/g,
			{
				source: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 184 184"><path d="M157 92.044V92h-13l20.035-25L184 92h-12v.045c0 31.797-18.593 59.301-40.002 69.281-13.897 8.023-28.7 11.342-42.992 10.774H84.5v-32.915h15v17.501c30.86-3.69 57.5-29.552 57.5-64.642" fill="#fff"/><circle cx="92" cy="92" r="50" fill="red"/></svg>`,
				class: "motionIcon",
				alt: "QCF",
			},
		],
		[
			/(?:j\.|)\bqcb\.|\b214(?![\d\.])/g,
			{
				source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><path d="M356.825 419.567v-.044h-13l20.035-25 19.965 25h-12v.045a80 80 0 01-40.002 69.281c-13.897 8.023-28.7 11.342-42.992 10.774h-4.506v-32.915h15v17.501c30.86-3.691 57.499-29.552 57.5-64.642z" fill="white"/><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/></g></svg>`,
				class: "motionIcon",
				alt: "QCB",
			},
		],
		[
			/\bdp\.|\b623(?![\d\.])/g,
			{
				source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/><path d="M254.803 426.976l47.568 54.716h-59.89v12.5l-25-20 25-20v12.5h26.974l-47.568-54.716h69.961v15h-37.045z" fill="white"/></g></svg>`,
				class: "motionIcon",
				alt: "DP",
			},
		],
		[
			/\brdp\.|\b421(?![\d\.])/g,
			{
				source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/><path d="M328.902 426.975l-47.568 54.716h59.89v12.5l25-20-25-20v12.5H314.25l47.568-54.716h-69.96v15h37.044z" fill="white"/></g></svg>`,
				class: "motionIcon",
				alt: "RDP",
			},
		],
		[
			/\bhcfb\.|\b41236(?=4)/g,
			{
				source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><path d="M338.967 426.975v-15l32.915.001v4.506a78.189 78.189 0 01-2.709 23.748c-12.891 48.946-70.305 75.688-117.347 48.53a80.002 80.002 0 01-40.002-69.282v-.002h.001v-.044h-12l19.965-25 20.035 25h-13v.044c.001 35.09 26.64 60.951 57.5 64.642l.002.003c2.462.294 4.951.447 7.455.453v-.099h.044c5.981 0 11.694-.774 17.075-2.211 5.22-1.446 10.395-3.592 15.425-6.496a64.944 64.944 0 0025.079-26.132 64.964 64.964 0 006.986-22.661z" fill="white"/><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/></g></svg>`,
				class: "motionIcon",
				alt: "HCF",
			},
		],
		[
			/\bhcf\.|\b41236(?![\d\.])/g,
			{
				source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><path d="M338.967 426.975v-15l32.915.001v4.506a78.189 78.189 0 01-2.709 23.748c-12.891 48.946-70.305 75.688-117.347 48.53a80.002 80.002 0 01-40.002-69.282v-.002h.001v-.044h-12l19.965-25 20.035 25h-13v.044c.001 35.09 26.64 60.951 57.5 64.642l.002.003c2.462.294 4.951.447 7.455.453v-.099h.044c5.981 0 11.694-.774 17.075-2.211 5.22-1.446 10.395-3.592 15.425-6.496a64.944 64.944 0 0025.079-26.132 64.964 64.964 0 006.986-22.661z" fill="white"/><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/></g></svg>`,
				class: "motionIcon",
				alt: "HCF",
			},
		],
		[
			/\bhcbf\.|\b63214(?=6)/g,
			{
				source: `<svg viewBox="0 0 184 184.046" xmlns="http://www.w3.org/2000/svg" xmlns:bx="https://boxy-svg.com"><g transform="matrix(-1 0 0 1 383.825 -327.476)">
        		<path d="M244.682 427.03v-15l-32.915.002v4.506a78.189 78.189 0 0 0 2.71 23.748c12.89 48.946 70.304 75.688 117.346 48.53a80.002 80.002 0 0 0 40.002-69.282v-.046h12l-19.966-25-20.035 25h13v.044c0 35.09-26.64 60.95-57.5 64.642l-.002.003a64.168 64.168 0 0 1-7.455.453v-.1h-.044c-5.98 0-11.694-.773-17.075-2.21-5.22-1.446-10.395-3.592-15.425-6.496a64.944 64.944 0 0 1-25.079-26.132 64.964 64.964 0 0 1-6.986-22.661z" bx:origin="0.534512 0.762394" fill="white"/><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red" pointer-events="none"/></g></svg>`,
				class: "motionIcon",
				alt: "HCBF",
			},
		],
		[
			/\bhcb\.|\b63214(?![\d\.])/g,
			{
				source: `<svg viewBox="0 0 184 184.046" xmlns="http://www.w3.org/2000/svg" xmlns:bx="https://boxy-svg.com"><g transform="matrix(-1 0 0 1 383.825 -327.476)">
        		<path d="M244.682 427.03v-15l-32.915.002v4.506a78.189 78.189 0 0 0 2.71 23.748c12.89 48.946 70.304 75.688 117.346 48.53a80.002 80.002 0 0 0 40.002-69.282v-.046h12l-19.966-25-20.035 25h13v.044c0 35.09-26.64 60.95-57.5 64.642l-.002.003a64.168 64.168 0 0 1-7.455.453v-.1h-.044c-5.98 0-11.694-.773-17.075-2.21-5.22-1.446-10.395-3.592-15.425-6.496a64.944 64.944 0 0 1-25.079-26.132 64.964 64.964 0 0 1-6.986-22.661z" bx:origin="0.534512 0.762394" fill="white"/><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red" pointer-events="none"/></g></svg>`,
				class: "motionIcon",
				alt: "HCB",
			},
		],
		[
			/\b2qcf\.|\b236236(?![\d\.])/g,
			{
				source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><path d="M157 92.044V92h-13l20.035-25L184 92h-12v.045c0 31.797-18.593 59.301-40.002 69.281-13.897 8.023-28.7 11.342-42.992 10.774H84.5v-32.915h15v17.501c30.86-3.69 57.5-29.552 57.5-64.642" fill="white"/><circle cx="92" cy="92" r="50" fill="red"/></svg>`,
				class: "motionIcon",
				alt: "QCF",
				repeat: 2,
			},
		],
		[
			/\b2qcb\.|\b214214(?![\d\.])/g,
			{
				source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><path d="M356.825 419.567v-.044h-13l20.035-25 19.965 25h-12v.045a80 80 0 01-40.002 69.281c-13.897 8.023-28.7 11.342-42.992 10.774h-4.506v-32.915h15v17.501c30.86-3.691 57.499-29.552 57.5-64.642z" fill="white"/><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/></g></svg>`,
				class: "motionIcon",
				alt: "QCB",
				repeat: 2,
			},
		],
		[
			/\bdd\.|\b22(?![\d\.])/g,
			{
				source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/><path d="M284.324 419.453v67.023h-12.5l20 25 20-25h-12.5v-67.023h-15z" fill="white"/></g></svg>`,
				class: "motionIcon",
				alt: "Down",
				repeat: 2,
			},
		],
		[
			/\bback\ ?dash|\b44(?![\d\.])/g,
			{
				source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/><path d="M291.801 426.976h67.023v12.5l25-20-25-20v12.5h-67.023v15z" fill="white"/></g></svg>`,
				class: "motionIcon",
				alt: "Back",
				repeat: 2,
			},
		],
		[
			/\bdash|\b66(?![\d\.])/g,
			{
				source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/><path d="M291.848 411.976h-67.023v-12.5l-25 20 25 20v-12.5h67.023v-15z" fill="white"/></g></svg>`,
				class: "motionIcon",
				alt: "Forward",
				repeat: 2,
			},
		],
		[
			/\buu\.|\b88(?![\d\.])/g,
			{
				source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/><path d="M299.324 419.5v-67.024h12.5l-20-25-20 25h12.5V419.5h15z" fill="white"/></g></svg>`,
				class: "motionIcon",
				alt: "Up",
				repeat: 2,
			},
		],
		[
			/\bdb\.|\b1(?![\d\.\)a-z]|x\d+)/g,
			{
				source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/><path d="M286.505 424.763l47.392 47.393-8.839 8.838 31.82 3.536-3.535-31.82-8.84 8.839-47.392-47.393-10.606 10.607z" fill="white"/></g></svg>`,
				class: "motionIcon",
				alt: "DownBack",
			},
		],
		[
			/\bcr\.|\b2(?![\d\.\)a-z]|x\d+)/g,
			{
				source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/><path d="M284.324 419.453v67.023h-12.5l20 25 20-25h-12.5v-67.023h-15z" fill="white"/></g></svg>`,
				class: "motionIcon",
				alt: "Down",
			},
		],
		[
			/\bdf\.|\b3(?![\d\.\)a-z])/g,
			{
				source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/><path d="M286.538 414.156l-47.393 47.393-8.838-8.84-3.536 31.82 31.82-3.535-8.839-8.839 47.392-47.392-10.606-10.607z" fill="white"/></g></svg>`,
				class: "motionIcon",
				alt: "DownForward",
			},
		],
		[
			/\bb\.|\b4(?![\d\.\)a-z]|x\d+)/g,
			{
				source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/><path d="M291.801 426.976h67.023v12.5l25-20-25-20v12.5h-67.023v15z" fill="white"/></g></svg>`,
				class: "motionIcon",
				alt: "Back",
			},
		],
		[
			/\bst\.|\b5(?![\d\.\)a-z]|x\d+)/g,
			{ source: "", class: "hidden", alt: "" },
		],
		[
			/\bf\.|\b6(?![\d\.\)a-z]|x\d+)/g,
			{
				source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/><path d="M291.848 411.976h-67.023v-12.5l-25 20 25 20v-12.5h67.023v-15z" fill="white"/></g></svg>`,
				class: "motionIcon",
				alt: "Forward",
			},
		],
		[
			/\bub\.|\b7(?![\d\.\)a-z]|x\d+)/g,
			{
				source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/><path d="M297.111 424.796l47.392-47.393 8.84 8.84 3.535-31.82-31.82 3.535 8.839 8.839-47.393 47.393 10.607 10.607z" fill="white"/></g></svg>`,
				class: "motionIcon",
				alt: "UpBack",
			},
		],
		[
			/\bu\.|\b8(?![\d\.\)a-z]|x\d+)/g,
			{
				source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/><path d="M299.324 419.5v-67.024h12.5l-20-25-20 25h12.5V419.5h15z" fill="white"/></g></svg>`,
				class: "motionIcon",
				alt: "Up",
			},
		],
		[
			/\buf\.|\b9(?![\d\.\)a-z]|x\d+)/g,
			{
				source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/><path d="M297.144 414.19l-47.393-47.393 8.84-8.839-31.82-3.535 3.535 31.82 8.839-8.84 47.392 47.393 10.607-10.607z" fill="white"/></g></svg>`,
				class: "motionIcon",
				alt: "UpForward",
			},
		],
	]);

// Generate button inputs based on profile
export const generateButtonMap = (profile: CustomProfile): ButtonMap => {
	const buttonMap = new Map();

	const calculateFontSize = (input: string): number => {
		const length = input.length;
		if (length <= 1) return 80;
		if (length === 2) return 60;
		if (length === 3) return 50;
		return Math.max(30, 80 - length * 10);
	};

	for (const [input] of Object.entries(profile.colors)) {
		const fontSize = calculateFontSize(input);
		const svgText = `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
				<circle cx="50" cy="50" r="45" fill="white"/>
				<text
					x="50"
					y="50"
					text-anchor="middle"
					dominant-baseline="central"
					font-family="Arial"
					font-weight="bold"
					font-size="${fontSize}"
					fill="black"
				>${input}</text>
			</svg>`;

		buttonMap.set(new RegExp(`\\b${input}(?!:)\\b`, "g"), {
			source: svgText,
			class: "buttonIcon",
			alt: input,
		});
	}

	return buttonMap;
};

// Combine motion and button inputs for image processing
export const imageMap = (profile: CustomProfile): MotionMap => {
	const combinedMap = new Map([...motionMap()]);
	for (const [pattern, config] of generateButtonMap(profile)) {
		combinedMap.set(pattern, config);
	}
	return combinedMap;
};

// Generate color patterns for text processing
export const colorPatterns = (profile: CustomProfile): ColorMap => {
	const patterns = new Map();
	for (const [input] of Object.entries(profile.colors)) {
		const pattern = `(?:\\d*[a-z]*\\.\\d*|\\d+[a-z]*|[+~]|(?:\\b|\\W))(?:\\[${input}\\]|${input})(?:\\(\\d+\\))?(?=\\s|\\b|$|~|,)`;
		patterns.set(new RegExp(pattern, "g"), input);
	}
	return patterns;
};
