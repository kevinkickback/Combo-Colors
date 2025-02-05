import type { Settings, CustomProfile } from "./settings";

// NOTE: the convertTextToImages method struggles to correctly display some of the more complex SVGs (motion inputs).
// 		 They have been encoded as base64 strings and are displayed with image tags instead.

export const imageMap = (): Map<
	RegExp,
	{
		source: string;
		class: string;
		alt: string;
		type: "svg" | "img";
		repeat?: number;
	}
> =>
	new Map<
		RegExp,
		{
			source: string;
			class: string;
			alt: string;
			type: "svg" | "img";
			repeat?: number;
		}
	>([
		[
			/\bqcf\.|\b236(?![\d\.])/g, // Quarter Circle Forward
			{
				source:
					"data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+Cgk8cGF0aCBkPSJNMTU3IDkyLjA0NFY5MmgtMTNsMjAuMDM1LTI1TDE4NCA5MmgtMTJ2MC4wNDVjMCAzMS43OTctMTguNTkzIDU5LjMwMS00MC4wMDIgNjkuMjgxIC0xMy44OTcgOC4wMjMtMjguNyAxMS4zNDItNDIuOTkyIDEwLjc3NEg4NC41di0zMi45MTVoMTV2MTcuNTAxYzMwLjg2LTMuNjkgNTcuNS0yOS41NTIgNTcuNS02NC42NDJ6IiBmaWxsPSJ3aGl0ZSIvPgoJPGNpcmNsZSBjeD0iOTIiIGN5PSI5MiIgcj0iNTAiIGZpbGw9InJlZCIvPgo8L3N2Zz4=",
				class: "motionIcon",
				alt: "QCF",
				type: "img",
			},
		],
		[
			/\bqcb\.|\b214(?![\d\.])/g, // Quarter Circle Back
			{
				source:
					"data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPHBhdGggZD0iTTM1Ni44MjUgNDE5LjU2N3YtLjA0NGgtMTNsMjAuMDM1LTI1IDE5Ljk2NSAyNWgtMTJ2LjA0NWE4MCA4MCAwIDAxLTQwLjAwMiA2OS4yODFjLTEzLjg5NyA4LjAyMy0yOC43IDExLjM0Mi00Mi45OTIgMTAuNzc0aC00LjUwNnYtMzIuOTE1aDE1djE3LjUwMWMzMC44Ni0zLjY5MSA1Ny40OTktMjkuNTUyIDU3LjUtNjQuNjQyeiIgZmlsbD0id2hpdGUiLz4KICAgIDxjaXJjbGUgY3g9Ii0yOTEuODI1IiBjeT0iLTQxOS40OTkiIHI9IjUwIiB0cmFuc2Zvcm09InJvdGF0ZSgxODApIiBmaWxsPSJyZWQiLz4KICA8L2c+Cjwvc3ZnPg==",
				class: "motionIcon",
				alt: "QCB",
				type: "img",
			},
		],
		[
			/\bdp\.|\b623(?![\d\.])/g, // Dragon Punch
			{
				source:
					"data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTI1NC44MDMgNDI2Ljk3Nmw0Ny41NjggNTQuNzE2aC01OS44OXYxMi41bC0yNS0yMCAyNS0yMHYxMi41aDI2Ljk3NGwtNDcuNTY4LTU0LjcxNmg2OS45NjF2MTVoLTM3LjA0NXoiIGZpbGw9IndoaXRlIi8+CiAgPC9nPgo8L3N2Zz4=",
				class: "motionIcon",
				alt: "DP",
				type: "img",
			},
		],
		[
			/\brdp\.|\b421(?![\d\.])/g, // Reverse Dragon Punch
			{
				source:
					"data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTMyOC45MDIgNDI2Ljk3NWwtNDcuNTY4IDU0LjcxNmg1OS44OXYxMi41bDI1LTIwLTI1LTIwdjEyLjVIMzE0LjI1bDQ3LjU2OC01NC43MTZoLTY5Ljk2djE1aDM3LjA0NHoiIGZpbGw9IndoaXRlIi8+CiAgPC9nPgo8L3N2Zz4=",
				class: "motionIcon",
				alt: "RDP",
				type: "img",
			},
		],
		[
			/\bhcf\.|\b41236(?![\d\.])/g, // Half Circle Forward
			{
				source:
					"data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPHBhdGggZD0iTTMzOC45NjcgNDI2Ljk3NXYtMTVsMzIuOTE1LjAwMXY0LjUwNmE3OC4xODkgNzguMTg5IDAgMDEtMi43MDkgMjMuNzQ4Yy0xMi44OTEgNDguOTQ2LTcwLjMwNSA3NS42ODgtMTE3LjM0NyA0OC41M2E4MC4wMDIgODAuMDAyIDAgMDEtNDAuMDAyLTY5LjI4MnYtLjAwMmguMDAxdi0uMDQ0aC0xMmwxOS45NjUtMjUgMjAuMDM1IDI1aC0xM3YuMDQ0Yy4wMDEgMzUuMDkgMjYuNjQgNjAuOTUxIDU3LjUgNjQuNjQybC4wMDIuMDAzYzIuNDYyLjI5NCA0Ljk1MS40NDcgNy40NTUuNDUzdi0uMDk5aC4wNDRjNS45ODEgMCAxMS42OTQtLjc3NCAxNy4wNzUtMi4yMTEgNS4yMi0xLjQ0NiAxMC4zOTUtMy41OTIgMTUuNDI1LTYuNDk2YTY0Ljk0NCA2NC45NDQgMCAwMDI1LjA3OS0yNi4xMzIgNjQuOTY0IDY0Ljk2NCAwIDAwNi45ODYtMjIuNjYxeiIgZmlsbD0id2hpdGUiLz4KICAgIDxjaXJjbGUgY3g9Ii0yOTEuODI1IiBjeT0iLTQxOS40OTkiIHI9IjUwIiB0cmFuc2Zvcm09InJvdGF0ZSgxODApIiBmaWxsPSJyZWQiLz4KICA8L2c+Cjwvc3ZnPg==",
				class: "motionIcon",
				alt: "HCF",
				type: "img",
			},
		],
		[
			/\bhcb\.|\b63214(?![\d\.])/g, // Half Circle Back
			{
				source:
					"data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPHBhdGggZD0iTTI0NC42ODIgNDI3LjAzdi0xNWwtMzIuOTE1LjAwMnY0LjUwNmE3OC4xODkgNzguMTg5IDAgMDAyLjcxIDIzLjc0OGMxMi44OSA0OC45NDYgNzAuMzA0IDc1LjY4OCAxMTcuMzQ2IDQ4LjUzYTgwLjAwMiA4MC4wMDIgMCAwMDQwLjAwMi02OS4yODJ2LS4wMDItLjA0NGgxMmwtMTkuOTY2LTI1LTIwLjAzNSAyNWgxM3YuMDQ0YzAgMzUuMDktMjYuNjQgNjAuOTUtNTcuNSA2NC42NDJsLS4wMDIuMDAzYTY0LjE2OCA2NC4xNjggMCAwMS03LjQ1NS40NTN2LS4xaC0uMDQ0Yy01Ljk4IDAtMTEuNjk0LS43NzMtMTcuMDc1LTIuMjEtNS4yMi0xLjQ0Ni0xMC4zOTUtMy41OTItMTUuNDI1LTYuNDk2YTY0Ljk0NCA2NC45NDQgMCAwMS0yNS4wNzktMjYuMTMyIDY0Ljk2NCA2NC45NjQgMCAwMS02Ljk4Ni0yMi42NjF6IiBmaWxsPSJ3aGl0ZSIvPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogIDwvZz4KPC9zdmc+",
				class: "motionIcon",
				alt: "HCB",
				type: "img",
			},
		],
		[
			/\b2qcf\.|\b236236(?![\d\.])/g, // Double Quarter Circle Forward
			{
				source:
					"data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+Cgk8cGF0aCBkPSJNMTU3IDkyLjA0NFY5MmgtMTNsMjAuMDM1LTI1TDE4NCA5MmgtMTJ2MC4wNDVjMCAzMS43OTctMTguNTkzIDU5LjMwMS00MC4wMDIgNjkuMjgxIC0xMy44OTcgOC4wMjMtMjguNyAxMS4zNDItNDIuOTkyIDEwLjc3NEg4NC41di0zMi45MTVoMTV2MTcuNTAxYzMwLjg2LTMuNjkgNTcuNS0yOS41NTIgNTcuNS02NC42NDJ6IiBmaWxsPSJ3aGl0ZSIvPgoJPGNpcmNsZSBjeD0iOTIiIGN5PSI5MiIgcj0iNTAiIGZpbGw9InJlZCIvPgo8L3N2Zz4=",
				class: "motionIcon",
				alt: "QCF",
				type: "img",
				repeat: 2,
			},
		],
		[
			/\b2qcb\.|\b214214(?![\d\.])/g, // Double Quarter Circle Back
			{
				source:
					"data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPHBhdGggZD0iTTM1Ni44MjUgNDE5LjU2N3YtLjA0NGgtMTNsMjAuMDM1LTI1IDE5Ljk2NSAyNWgtMTJ2LjA0NWE4MCA4MCAwIDAxLTQwLjAwMiA2OS4yODFjLTEzLjg5NyA4LjAyMy0yOC43IDExLjM0Mi00Mi45OTIgMTAuNzc0aC00LjUwNnYtMzIuOTE1aDE1djE3LjUwMWMzMC44Ni0zLjY5MSA1Ny40OTktMjkuNTUyIDU3LjUtNjQuNjQyeiIgZmlsbD0id2hpdGUiLz4KICAgIDxjaXJjbGUgY3g9Ii0yOTEuODI1IiBjeT0iLTQxOS40OTkiIHI9IjUwIiB0cmFuc2Zvcm09InJvdGF0ZSgxODApIiBmaWxsPSJyZWQiLz4KICA8L2c+Cjwvc3ZnPg==",
				class: "motionIcon",
				alt: "QCB",
				type: "img",
				repeat: 2,
			},
		],
		[
			/\bdd\.|\b22(?![\d\.])/g, // Double Down
			{
				source:
					"data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTI4NC4zMjQgNDE5LjQ1M3Y2Ny4wMjNoLTEyLjVsMjAgMjUgMjAtMjVoLTEyLjV2LTY3LjAyM2gtMTV6IiBmaWxsPSJ3aGl0ZSIvPgogIDwvZz4KPC9zdmc+Cg==",
				class: "motionIcon",
				alt: "Down",
				type: "img",
				repeat: 2,
			},
		],
		[
			/\bback\ ?dash|\b44(?![\d\.])/g, // Back Dash
			{
				source:
					"data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTI5MS44MDEgNDI2Ljk3Nmg2Ny4wMjN2MTIuNWwyNS0yMC0yNS0yMHYxMi41aC02Ny4wMjN2MTV6IiBmaWxsPSJ3aGl0ZSIvPgogIDwvZz4KPC9zdmc+",
				class: "motionIcon",
				alt: "Back",
				type: "img",
				repeat: 2,
			},
		],
		[
			/\bdash|\b66(?![\d\.])/g, // Dash
			{
				source:
					"data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTI5MS44NDggNDExLjk3NmgtNjcuMDIzdi0xMi41bC0yNSAyMCAyNSAyMHYtMTIuNWg2Ny4wMjN2LTE1eiIgZmlsbD0id2hpdGUiLz4KICA8L2c+Cjwvc3ZnPg==",
				class: "motionIcon",
				alt: "Forward",
				type: "img",
				repeat: 2,
			},
		],
		[
			/\buu\.|\b88(?![\d\.])/g, // Double Jump
			{
				source:
					"data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTI5OS4zMjQgNDE5LjV2LTY3LjAyNGgxMi41bC0yMC0yNS0yMCAyNWgxMi41VjQxOS41aDE1eiIgZmlsbD0id2hpdGUiLz4KICA8L2c+Cjwvc3ZnPg==",
				class: "motionIcon",
				alt: "Up",
				type: "img",
				repeat: 2,
			},
		],
		[
			/\bdb\.|\b1(?![\d\.\)a-z])/g, // Down Back
			{
				source:
					"data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTI4Ni41MDUgNDI0Ljc2M2w0Ny4zOTIgNDcuMzkzLTguODM5IDguODM4IDMxLjgyIDMuNTM2LTMuNTM1LTMxLjgyLTguODQgOC44MzktNDcuMzkyLTQ3LjM5My0xMC42MDYgMTAuNjA3eiIgZmlsbD0id2hpdGUiLz4KICA8L2c+Cjwvc3ZnPgo=",
				class: "motionIcon",
				alt: "DownBack",
				type: "img",
			},
		],
		[
			/\bcr\.|\b2(?![\d\.\)a-z])/g, // Crouch
			{
				source:
					"data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTI4NC4zMjQgNDE5LjQ1M3Y2Ny4wMjNoLTEyLjVsMjAgMjUgMjAtMjVoLTEyLjV2LTY3LjAyM2gtMTV6IiBmaWxsPSJ3aGl0ZSIvPgogIDwvZz4KPC9zdmc+Cg==",
				class: "motionIcon",
				alt: "Down",
				type: "img",
			},
		],
		[
			/\bdf\.|\b3(?![\d\.\)a-z])/g, // Down Forward
			{
				source:
					"data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTI4Ni41MzggNDE0LjE1NmwtNDcuMzkzIDQ3LjM5My04LjgzOC04Ljg0LTMuNTM2IDMxLjgyIDMxLjgyLTMuNTM1LTguODM5LTguODM5IDQ3LjM5Mi00Ny4zOTItMTAuNjA2LTEwLjYwN3oiIGZpbGw9IndoaXRlIi8+CiAgPC9nPgo8L3N2Zz4=",
				class: "motionIcon",
				alt: "DownForward",
				type: "img",
			},
		],
		[
			/\bb\.|\b4(?![\d\.\)a-z])/g, // Back
			{
				source:
					"data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTI5MS44MDEgNDI2Ljk3Nmg2Ny4wMjN2MTIuNWwyNS0yMC0yNS0yMHYxMi41aC02Ny4wMjN2MTV6IiBmaWxsPSJ3aGl0ZSIvPgogIDwvZz4KPC9zdmc+",
				class: "motionIcon",
				alt: "Back",
				type: "img",
			},
		],
		[
			/\bst\.|\b5(?![\d\.\)a-z])/g, // Neutral
			{ source: "", class: "hidden", alt: "", type: "img" },
		],
		[
			/\bf\.|\b6(?![\d\.\)a-z])/g, // Forward
			{
				source:
					"data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTI5MS44NDggNDExLjk3NmgtNjcuMDIzdi0xMi41bC0yNSAyMCAyNSAyMHYtMTIuNWg2Ny4wMjN2LTE1eiIgZmlsbD0id2hpdGUiLz4KICA8L2c+Cjwvc3ZnPg==",
				class: "motionIcon",
				alt: "Forward",
				type: "img",
			},
		],
		[
			/\bub\.|\b7(?![\d\.\)a-z])/g, // Up Back
			{
				source:
					"data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTI5Ny4xMTEgNDI0Ljc5Nmw0Ny4zOTItNDcuMzkzIDguODQgOC44NCAzLjUzNS0zMS44Mi0zMS44MiAzLjUzNSA4LjgzOSA4LjgzOS00Ny4zOTMgNDcuMzkzIDEwLjYwNyAxMC42MDd6IiBmaWxsPSJ3aGl0ZSIvPgogIDwvZz4KPC9zdmc+",
				class: "motionIcon",
				alt: "UpBack",
				type: "img",
			},
		],
		[
			/\bu\.|\b8(?![\d\.\)a-z])/g, // Jump
			{
				source:
					"data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTI5OS4zMjQgNDE5LjV2LTY3LjAyNGgxMi41bC0yMC0yNS0yMCAyNWgxMi41VjQxOS41aDE1eiIgZmlsbD0id2hpdGUiLz4KICA8L2c+Cjwvc3ZnPg==",
				class: "motionIcon",
				alt: "Up",
				type: "img",
			},
		],
		[
			/\buf\.|\b9(?![\d\.\)a-z])/g, // Up Forward
			{
				source:
					"data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTI5Ny4xNDQgNDE0LjE5bC00Ny4zOTMtNDcuMzkzIDguODQtOC44MzktMzEuODItMy41MzUgMy41MzUgMzEuODIgOC44MzktOC44NCA0Ny4zOTIgNDcuMzkzIDEwLjYwNy0xMC42MDd6IiBmaWxsPSJ3aGl0ZSIvPgogIDwvZz4KPC9zdmc+",
				class: "motionIcon",
				alt: "UpForward",
				type: "img",
			},
		],
		[
			/\bA(?!:)\b/g, // A Button
			{
				source: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
					<path fill="#DE1616" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
					<text x="50%" y="45%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="80" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
						A
					</text>
				</svg>`,
				class: "buttonIcon",
				alt: "A",
				type: "svg",
			},
		],
		[
			/\bB(?!:)\b/g, // B Button
			{
				source: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
					<path fill="#1F8CCC" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
					<text x="53%" y="50%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="80" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
						B
					</text>
				</svg>`,
				class: "buttonIcon",
				alt: "B",
				type: "svg",
			},
		],
		[
			/\bC(?!:)\b/g, // C Button
			{
				source: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
					<path fill="#009E4E" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
					<text x="50%" y="50%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="80" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
						C
					</text>
				</svg>`,
				class: "buttonIcon",
				alt: "C",
				type: "svg",
			},
		],
		[
			/\bD(?!:)\b/g, // D Button
			{
				source: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
					<path fill="#E8982C" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
					<text x="53%" y="50%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="80" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
						D
					</text>
				</svg>`,
				class: "buttonIcon",
				alt: "D",
				type: "svg",
			},
		],
		[
			/\bE(?!:)\b/g, // E Button
			{
				source: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
					<path fill="#892CE8" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
					<text x="50%" y="45%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="80" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
						E
					</text>
				</svg>`,
				class: "buttonIcon",
				alt: "E",
				type: "svg",
			},
		],
		[
			/\bK(?!:)\b/g, // K Button
			{
				source: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
					<path fill="#1F8CCC" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
					<text x="50%" y="50%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="75" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
						K
					</text>
				</svg>`,
				class: "buttonIcon",
				alt: "K",
				type: "svg",
			},
		],
		[
			/\bP(?!:)\b/g, // P Button
			{
				source: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
					<path fill="#FF87D1" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
					<text x="50%" y="50%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="80" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
						P
					</text>
				</svg>`,
				class: "buttonIcon",
				alt: "P",
				type: "svg",
			},
		],
		[
			/\bS(?!:)\b/g, // S Button
			{
				source: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
					<path fill="#009E4E" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
					<text x="53%" y="50%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="80" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
						S
					</text>
				</svg>`,
				class: "buttonIcon",
				alt: "S",
				type: "svg",
			},
		],
		[
			/\bHS(?!:)\b/g, // HS Button
			{
				source: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
					<path fill="#DE1616" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
					<text x="50%" y="50%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="60" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
						HS
					</text>
				</svg>`,
				class: "buttonIcon",
				alt: "HS",
				type: "svg",
			},
		],
		[
			/\bMS(?!:)\b/g, // MS Button
			{
				source: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
					<path fill="#E8982C" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
					<text x="50%" y="50%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="60" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
						MS
					</text>
				</svg>`,
				class: "buttonIcon",
				alt: "MS",
				type: "svg",
			},
		],
		[
			/\bL(?!:)\b/g, // L Button
			{
				source: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
					<path fill="#1F8CCC" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
					<text x="50%" y="50%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="80" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
						L
					</text>
				</svg>`,
				class: "buttonIcon",
				alt: "L",
				type: "svg",
			},
		],
		[
			/\bM(?!:)\b/g, // M Button
			{
				source: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
					<path fill="#E8982C" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
					<text x="50%" y="50%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="75" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
						M
					</text>
				</svg>`,
				class: "buttonIcon",
				alt: "M",
				type: "svg",
			},
		],
		[
			/\bH(?!:)\b/g, // H Button
			{
				source: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
					<path fill="#DE1616" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
					<text x="50%" y="48%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="75" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
						H
					</text>
				</svg>`,
				class: "buttonIcon",
				alt: "H",
				type: "svg",
			},
		],
		[
			/\bX(?!:)\b/g, // X Button
			{
				source: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
					<path fill="#1F8CCC" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
					<text x="50%" y="50%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="80" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
						X
					</text>
				</svg>`,
				class: "buttonIcon",
				alt: "X",
				type: "svg",
			},
		],
		[
			/\bY(?!:)\b/g, // Y Button
			{
				source: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
					<path fill="#E8982C" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
					<text x="50%" y="55%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="80" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
						Y
					</text>
				</svg>`,
				class: "buttonIcon",
				alt: "Y",
				type: "svg",
			},
		],
		[
			/\bU(?!:)\b/g, // U Button
			{
				source: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
					<path fill="#FF87D1" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
					<text x="50%" y="55%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="80" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
						U
					</text>
				</svg>`,
				class: "buttonIcon",
				alt: "U",
				type: "svg",
			},
		],
		[
			/\bAA1(?!:)\b/g, // A1 Button
			{
				source: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
					<path fill="#892CE8" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
					<text x="50%" y="50%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="80" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
						A1
					</text>
				</svg>`,
				class: "buttonIcon",
				alt: "A1",
				type: "svg",
			},
		],
		[
			/\bA2(?!:)\b/g, // A2 Button
			{
				source: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
					<path fill="#892CE8" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
					<text x="50%" y="55%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="80" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
						A2
					</text>
				</svg>`,
				class: "buttonIcon",
				alt: "A2",
				type: "svg",
			},
		],
		[
			/\bLP(?!:)\b/g, // LP Button
			{
				source: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
					<path fill="#1F8CCC" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
					<text x="50%" y="50%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="65" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
						LP
					</text>
				</svg>`,
				class: "buttonIcon",
				alt: "LP",
				type: "svg",
			},
		],
		[
			/\bMP(?!:)\b/g, // MP Button
			{
				source: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
					<path fill="#E8982C" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
					<text x="50%" y="55%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="60" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
						MP
					</text>
				</svg>`,
				class: "buttonIcon",
				alt: "MP",
				type: "svg",
			},
		],
		[
			/\bHP(?!:)\b/g, // HP Button
			{
				source: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
					<path fill="#DE1616" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
					<text x="50%" y="55%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="60" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
						HP
					</text>
				</svg>`,
				class: "buttonIcon",
				alt: "HP",
				type: "svg",
			},
		],
		[
			/\bLK(?!:)\b/g, // LK Button
			{
				source: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
					<path fill="#1F8CCC" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
					<text x="50%" y="50%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="65" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
						LK
					</text>
				</svg>`,
				class: "buttonIcon",
				alt: "LK",
				type: "svg",
			},
		],
		[
			/\bMK(?!:)\b/g, // MK Button
			{
				source: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
					<path fill="#E8982C" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
					<text x="50%" y="55%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="60" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
						MK
					</text>
				</svg>`,
				class: "buttonIcon",
				alt: "MK",
				type: "svg",
			},
		],
		[
			/\bHK(?!:)\b/g, // HK Button
			{
				source: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
					<path fill="#DE1616" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
					<text x="50%" y="55%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="60" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
						HK
					</text>
				</svg>`,
				class: "buttonIcon",
				alt: "HK",
				type: "svg",
			},
		],
	]);

export function regPatterns(profile: CustomProfile): Map<RegExp, string> {
	const patterns = new Map<RegExp, string>();

	// Add patterns for each input in the profile
	for (const input of Object.keys(profile.colors)) {
		try {
			const pattern = `(?:\\d*[a-z]*\\.\\d*|\\d+[a-z]*|[+~]|(?:\\b|\\W))(?:\\[${input}\\]|${input})(?:\\(\\d+\\))?(?=\\s|\\b|$|~|,)`;
			const regex = new RegExp(pattern, "g");
			patterns.set(regex, input);
		} catch (e) {
			console.error(`Error creating regex pattern for input ${input}:`, e);
		}
	}

	return patterns;
}
