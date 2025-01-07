import type { Settings } from "./settings";

// ╔══════════════════════════════════════════════════════════════════════════════════════╗
// ║ INPUT IMAGE MAPPINGS                                                                 ║
// ╚══════════════════════════════════════════════════════════════════════════════════════╝

export const imageMap: Map<RegExp, string | string[]> = new Map<
	RegExp,
	string | string[]
>([
	// Motion Inputs
	[/\bqcf\.|\b236(?![\d\.])/g, "236.png"],
	[/\bqcb\.|\b214(?![\d\.])/g, "214.png"],
	[/\bdp\.|\b623(?![\d\.])/g, "623.png"],
	[/\brdp\.|\b421(?![\d\.])/g, "421.png"],
	[/\bhcf\.|\b41236(?![\d\.])/g, "41236.png"],
	[/\bhcfb\.|\b412364(?![\d\.])/g, "41236.png"],
	[/\bhcb\.|\b63214(?![\d\.])/g, "63214.png"],
	[/\bhcbf\.|\b632146(?![\d\.])/g, "63214.png"],
	[/\b2qcf\.|\b236236(?![\d\.])/g, ["236.png", "236.png"]],
	[/\b2qcb\.|\b214214(?![\d\.])/g, ["214.png", "214.png"]],
	[/\bdd\.|\b22(?![\d\.])/g, ["2.png", "2.png"]],
	[/\bback\ ?dash|\b44(?![\d\.])/g, ["4.png", "4.png"]],
	[/\bdash|\b66(?![\d\.])/g, ["6.png", "6.png"]],
	[/\buu\.|\b88(?![\d\.])/g, ["8.png", "8.png"]],

	// Directional and Modifier Inputs
	[/\bdb\.|\b1(?![\d\.\)a-z])/g, "1.png"],
	[/\bcr\.|\b2(?![\d\.\)a-z])/g, "2.png"],
	[/\bdf\.|\b3(?![\d\.\)a-z])/g, "3.png"],
	[/\bb\.|\b4(?![\d\.\)a-z])/g, "4.png"],
	[/\bst\.|\b5(?![\d\.\)a-z])/g, "5.png"],
	[/\bf\.|\b6(?![\d\.\)a-z])/g, "6.png"],
	[/\bub\.|\b7(?![\d\.\)a-z])/g, "7.png"],
	[/\bu\.|\b8(?![\d\.\)a-z])/g, "8.png"],
	[/\buf\.|\b9(?![\d\.\)a-z])/g, "9.png"],
	[/\bDC(?!:)\b/g, "DC.png"],
	[/\bj\./g, "J.png"],
	[/\bjc\./g, "jc.png"],
	[/\bdj\./g, "dj.png"],
	[/\bdl\./g, "dl.png"],
	[/\bsj\./g, "sj.png"],
	[/\bcl\./g, "cl.png"],
	[/\bSD\b/g, "SD.png"],
	[/\bADF\b/g, "ADF.png"],
	[/\bADD\b/g, "ADD.png"],
	[/\bADDF\b/g, "ADDF.png"],

	// Button Inputs
	[/\bA(?!:)\b/g, "A.png"],
	[/\bB(?!:)\b/g, "B.png"],
	[/\bC(?!:)\b/g, "C.png"],
	[/\bD(?!:)\b/g, "D.png"],
	[/\bL(?!:)\b/g, "L.png"],
	[/\bM(?!:)\b/g, "M.png"],
	[/\bH(?!:)\b/g, "H.png"],
	[/\bLP(?!:)\b/g, "LP.png"],
	[/\bLK(?!:)\b/g, "LK.png"],
	[/\bMP(?!:)\b/g, "MP.png"],
	[/\bMK(?!:)\b/g, "MK.png"],
	[/\bHP(?!:)\b/g, "HP.png"],
	[/\bHK(?!:)\b/g, "HK.png"],
	[/\bP(?!:)\b/g, "P.png"],
	[/\bK(?!:)\b/g, "K.png"],
	[/\bS(?!:)\b/g, "S.png"],
	[/\bX(?!:)\b/g, "X.png"],
	[/\bY(?!:)\b/g, "Y.png"],
	[/\bHS(?!:)\b/g, "HS.png"],
	[/\bMS(?!:)\b/g, "MS.png"],
	[/\bA1(?!:)\b/g, "A1.png"],
	[/\bA2(?!:)\b/g, "A2.png"],
	[/\bAS(?!:)\b/g, "AS.png"],
	[/\bRC(?!:)\b/g, "RC.png"],
	[/\bBRC(?!:)\b/g, "BRC.png"],
	[/\bPRC(?!:)\b/g, "PRC.png"],
	[/\bYRC(?!:)\b/g, "YRC.png"],
	[/\bDRC(?!:)\b/g, "DRC.png"],
	[/\bDR(?!:)\b/g, "DR.png"],
	[/\bDI(?!:)\b/g, "DI.png"],
]);

// ╔══════════════════════════════════════════════════════════════════════════════════════╗
// ║ INPUT COLOR REGEX PATTERNS                                                                 ║
// ╚══════════════════════════════════════════════════════════════════════════════════════╝

export const regPatterns = (settings: Settings) => ({
	asw: new Map([
		[
			/(?:\d*[a-z]*\.\d*|\d+[a-z]*|(?<=\+|~)|(?<=\b|\W))(?:\[A\]|A)(?:\(\d+\))?(?=\s|\b|$|~|,)/g,
			settings.asw_A, // A
		],
		[
			/(?:\d*[a-z]*\.\d*|\d+[a-z]*|(?<=\+|~)|(?<=\b|\W))(?:\[B\]|B)(?:\(\d+\))?(?=\s|\b|$|~|,)/g,
			settings.asw_B, // B
		],
		[
			/(?:\d*[a-z]*\.\d*|\d+[a-z]*|(?<=\+|~)|(?<=\b|\W))(?:\[C\]|C)(?:\(\d+\))?(?=\s|\b|$|~|,)/g,
			settings.asw_C, // C
		],
		[
			/(?:\d*[a-z]*\.\d*|\d+[a-z]*|(?<=\+|~)|(?<=\b|\W))(?:\[D\]|D)(?:\(\d+\))?(?=\s|\b|$|~|,)/g,
			settings.asw_D, // D
		],
		[
			/(?:\d*[a-z]*\.\d*|\d+[a-z]*|(?<=\+|~)|(?<=\b|\W))(?:\[E\]|E)(?:\(\d+\))?(?=\s|\b|$|~|,)/g,
			settings.asw_E, // E
		],
		[
			/(?:\d*[a-z]*\.\d*|\d+[a-z]*|(?<=\+|~)|(?<=\b|\W))(?:\[K\]|K)(?:\(\d+\))?(?=\s|\b|$|~|,)/g,
			settings.asw_K, // K
		],
		[
			/(?:\d*[a-z]*\.\d*|\d+[a-z]*|(?<=\+|~)|(?<=\b|\W))(?:\[P\]|P)(?:\(\d+\))?(?=\s|\b|$|~|,)/g,
			settings.asw_P, // P
		],
		[
			/(?:\d*[a-z]*\.\d*|\d+[a-z]*|(?<=\+|~)|(?<=\b|\W))(?:\[S\]|S)(?:\(\d+\))?(?=\s|\b|$|~|,)/g,
			settings.asw_S, // S
		],
		[
			/(?:\d*[a-z]*\.\d*|\d+[a-z]*|(?<=\+|~)|(?<=\b|\W))(?:\[HS\]|HS)(?:\(\d+\))?(?=\s|\b|$|~|,)/g,
			settings.asw_HS, // HS
		],
		[
			/(?:\d*[a-z]*\.\d*|\d+[a-z]*|(?<=\+|~)|(?<=\b|\W))(?:\[MS\]|MS)(?:\(\d+\))?(?=\s|\b|$|~|,)/g,
			settings.asw_MS, // MS
		],
		[/\bOD\b/g, settings.asw_OD], // OD
		[/\bRC\b/g, settings.asw_RC], // RC
		[/\bDRC\b/g, settings.asw_DRC], // DRC
		[/\bYRC\b/g, settings.asw_YRC], // YRC
		[/\bBRC\b/g, settings.asw_BRC], // BRC
		[/\bPRC\b/g, settings.asw_BRC], // PRC
	]),
	alt: new Map([
		[
			/(?:\d*[a-z]*\.\d*|\d+[a-z]*|(?<=\+|~)|(?<=\b|\W))(?:\[A\]|A)(?:\(\d+\))?(?=\s|\b|$|~|,)/g,
			settings.alt_A, // A
		],
		[
			/(?:\d*[a-z]*\.\d*|\d+[a-z]*|(?<=\+|~)|(?<=\b|\W))(?:\[B\]|B)(?:\(\d+\))?(?=\s|\b|$|~|,)/g,
			settings.alt_B, // B
		],
		[
			/(?:\d*[a-z]*\.\d*|\d+[a-z]*|(?<=\+|~)|(?<=\b|\W))(?:\[X\]|X)(?:\(\d+\))?(?=\s|\b|$|~|,)/g,
			settings.alt_X, // X
		],
		[
			/(?:\d*[a-z]*\.\d*|\d+[a-z]*|(?<=\+|~)|(?<=\b|\W))(?:\[Y\]|Y)(?:\(\d+\))?(?=\s|\b|$|~|,)/g,
			settings.alt_Y, // Y
		],
		[
			/(?:\d*[a-z]*\.\d*|\d+[a-z]*|(?<=\+|~)|(?<=\b|\W))(?:\[L\]|L)(?:\(\d+\))?(?=\s|\b|$|~|,)/g,
			settings.alt_L, // L
		],
		[
			/(?:\d*[a-z]*\.\d*|\d+[a-z]*|(?<=\+|~)|(?<=\b|\W))(?:\[M\]|M)(?:\(\d+\))?(?=\s|\b|$|~|,)/g,
			settings.alt_M, // M
		],
		[
			/(?:\d*[a-z]*\.\d*|\d+[a-z]*|(?<=\+|~)|(?<=\b|\W))(?:\[H\]|H)(?:\(\d+\))?(?=\s|\b|$|~|,)/g,
			settings.alt_H, // H
		],
		[
			/(?:\d*[a-z]*\.\d*|\d+[a-z]*|(?<=\+|~)|(?<=\b|\W))(?:\[S\]|S)(?:\(\d+\))?(?=\s|\b|$|~|,)/g,
			settings.alt_S, // S
		],
		[
			/(?:\d*[a-z]*\.\d*|\d+[a-z]*|(?<=\+|~)|(?<=\b|\W))(?:\[U\]|U)(?:\(\d+\))?(?=\s|\b|$|~|,)/g,
			settings.alt_U, // U
		],
		[/\bA1\b/g, settings.alt_A1], // A2
		[/\bA2\b/g, settings.alt_A2], // A2
	]),
	trd: new Map([
		[
			/(?:\d*[a-z]*\.\d*|\d+[a-z]*|(?<=\+|~)|(?<=\b|\W))(?:\[P\]|P)(?:\(\d+\))?(?=\s|\b|$|~|,)/g,
			settings.trd_P, // P
		],
		[
			/(?:\d*[a-z]*\.\d*|\d+[a-z]*|(?<=\+|~)|(?<=\b|\W))(?:\[K\]|K)(?:\(\d+\))?(?=\s|\b|$|~|,)/g,
			settings.trd_K, // K
		],
		[
			/(?:\d*[a-z]*\.\d*|\d+[a-z]*|(?<=\+|~)|(?<=\b|\W))(?:\[LP\]|LP)(?:\(\d+\))?(?=\s|\b|$|~|,)/g,
			settings.trd_LP, // LP
		],
		[
			/(?:\d*[a-z]*\.\d*|\d+[a-z]*|(?<=\+|~)|(?<=\b|\W))(?:\[MP\]|MP)(?:\(\d+\))?(?=\s|\b|$|~|,)/g,
			settings.trd_MP, // MP
		],
		[
			/(?:\d*[a-z]*\.\d*|\d+[a-z]*|(?<=\+|~)|(?<=\b|\W))(?:\[HP\]|HP)(?:\(\d+\))?(?=\s|\b|$|~|,)/g,
			settings.trd_HP, // HP
		],
		[
			/(?:\d*[a-z]*\.\d*|\d+[a-z]*|(?<=\+|~)|(?<=\b|\W))(?:\[LK\]|LK)(?:\(\d+\))?(?=\s|\b|$|~|,)/g,
			settings.trd_LK, // LK
		],
		[
			/(?:\d*[a-z]*\.\d*|\d+[a-z]*|(?<=\+|~)|(?<=\b|\W))(?:\[MK\]|MK)(?:\(\d+\))?(?=\s|\b|$|~|,)/g,
			settings.trd_MK, // MK
		],
		[
			/(?:\d*[a-z]*\.\d*|\d+[a-z]*|(?<=\+|~)|(?<=\b|\W))(?:\[HK\]|HK)(?:\(\d+\))?(?=\s|\b|$|~|,)/g,
			settings.trd_HK, // HK
		],
		[/\bDI\b/g, settings.trd_DI], // DI
		[/\bDR\b/g, settings.trd_DR], // DR
	]),
});
