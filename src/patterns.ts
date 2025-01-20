import type { Settings } from "./settings";

// NOTE: the toggleNotations function struggles to correctly display some of the more complex SVGs.
// 		 These (the motion inputs) have been encoded as base64 strings and are displayed as images instead.

export const imageMap = (): Map<RegExp, string | string[]> =>
	new Map<RegExp, string | string[]>([
		// Motion Inputs
		[
			/\bqcf\.|\b236(?![\d\.])/g, // QUARTER CIRCLE FORWARD
			`<img class="notationMotionIcons" src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+Cgk8cGF0aCBkPSJNMTU3IDkyLjA0NFY5MmgtMTNsMjAuMDM1LTI1TDE4NCA5MmgtMTJ2MC4wNDVjMCAzMS43OTctMTguNTkzIDU5LjMwMS00MC4wMDIgNjkuMjgxIC0xMy44OTcgOC4wMjMtMjguNyAxMS4zNDItNDIuOTkyIDEwLjc3NEg4NC41di0zMi45MTVoMTV2MTcuNTAxYzMwLjg2LTMuNjkgNTcuNS0yOS41NTIgNTcuNS02NC42NDJ6IiBmaWxsPSJ3aGl0ZSIvPgoJPGNpcmNsZSBjeD0iOTIiIGN5PSI5MiIgcj0iNTAiIGZpbGw9InJlZCIvPgo8L3N2Zz4=" alt="QCF">`,
		],
		[
			/\bqcb\.|\b214(?![\d\.])/g, // QUARTER CIRCLE BACK
			`<img class="notationMotionIcons" src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPHBhdGggZD0iTTM1Ni44MjUgNDE5LjU2N3YtLjA0NGgtMTNsMjAuMDM1LTI1IDE5Ljk2NSAyNWgtMTJ2LjA0NWE4MCA4MCAwIDAxLTQwLjAwMiA2OS4yODFjLTEzLjg5NyA4LjAyMy0yOC43IDExLjM0Mi00Mi45OTIgMTAuNzc0aC00LjUwNnYtMzIuOTE1aDE1djE3LjUwMWMzMC44Ni0zLjY5MSA1Ny40OTktMjkuNTUyIDU3LjUtNjQuNjQyeiIgZmlsbD0id2hpdGUiLz4KICAgIDxjaXJjbGUgY3g9Ii0yOTEuODI1IiBjeT0iLTQxOS40OTkiIHI9IjUwIiB0cmFuc2Zvcm09InJvdGF0ZSgxODApIiBmaWxsPSJyZWQiLz4KICA8L2c+Cjwvc3ZnPg==" alt="QCB">`,
		],
		[
			/\bdp\.|\b623(?![\d\.])/g, // DRAGON PUNCH
			`<img class="notationMotionIcons" src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTI1NC44MDMgNDI2Ljk3Nmw0Ny41NjggNTQuNzE2aC01OS44OXYxMi41bC0yNS0yMCAyNS0yMHYxMi41aDI2Ljk3NGwtNDcuNTY4LTU0LjcxNmg2OS45NjF2MTVoLTM3LjA0NXoiIGZpbGw9IndoaXRlIi8+CiAgPC9nPgo8L3N2Zz4=" alt="DP">`,
		],
		[
			/\brdp\.|\b421(?![\d\.])/g, // REVERSE DRAGON PUNCH
			`<img class="notationMotionIcons" src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTMyOC45MDIgNDI2Ljk3NWwtNDcuNTY4IDU0LjcxNmg1OS44OXYxMi41bDI1LTIwLTI1LTIwdjEyLjVIMzE0LjI1bDQ3LjU2OC01NC43MTZoLTY5Ljk2djE1aDM3LjA0NHoiIGZpbGw9IndoaXRlIi8+CiAgPC9nPgo8L3N2Zz4=" alt="RDP">`,
		],
		[
			/\bhcf\.|\b41236(?![\d\.])/g, // HALF CIRCLE FORWARD
			`<img class="notationMotionIcons" src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPHBhdGggZD0iTTMzOC45NjcgNDI2Ljk3NXYtMTVsMzIuOTE1LjAwMXY0LjUwNmE3OC4xODkgNzguMTg5IDAgMDEtMi43MDkgMjMuNzQ4Yy0xMi44OTEgNDguOTQ2LTcwLjMwNSA3NS42ODgtMTE3LjM0NyA0OC41M2E4MC4wMDIgODAuMDAyIDAgMDEtNDAuMDAyLTY5LjI4MnYtLjAwMmguMDAxdi0uMDQ0aC0xMmwxOS45NjUtMjUgMjAuMDM1IDI1aC0xM3YuMDQ0Yy4wMDEgMzUuMDkgMjYuNjQgNjAuOTUxIDU3LjUgNjQuNjQybC4wMDIuMDAzYzIuNDYyLjI5NCA0Ljk1MS40NDcgNy40NTUuNDUzdi0uMDk5aC4wNDRjNS45ODEgMCAxMS42OTQtLjc3NCAxNy4wNzUtMi4yMTEgNS4yMi0xLjQ0NiAxMC4zOTUtMy41OTIgMTUuNDI1LTYuNDk2YTY0Ljk0NCA2NC45NDQgMCAwMDI1LjA3OS0yNi4xMzIgNjQuOTY0IDY0Ljk2NCAwIDAwNi45ODYtMjIuNjYxeiIgZmlsbD0id2hpdGUiLz4KICAgIDxjaXJjbGUgY3g9Ii0yOTEuODI1IiBjeT0iLTQxOS40OTkiIHI9IjUwIiB0cmFuc2Zvcm09InJvdGF0ZSgxODApIiBmaWxsPSJyZWQiLz4KICA8L2c+Cjwvc3ZnPg==" alt="HCF">`,
		],
		[
			/\bhcb\.|\b63214(?![\d\.])/g, // HALF CIRCLE BACK
			`<img class="notationMotionIcons" src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPHBhdGggZD0iTTI0NC42ODIgNDI3LjAzdi0xNWwtMzIuOTE1LjAwMnY0LjUwNmE3OC4xODkgNzguMTg5IDAgMDAyLjcxIDIzLjc0OGMxMi44OSA0OC45NDYgNzAuMzA0IDc1LjY4OCAxMTcuMzQ2IDQ4LjUzYTgwLjAwMiA4MC4wMDIgMCAwMDQwLjAwMi02OS4yODJ2LS4wMDItLjA0NGgxMmwtMTkuOTY2LTI1LTIwLjAzNSAyNWgxM3YuMDQ0YzAgMzUuMDktMjYuNjQgNjAuOTUtNTcuNSA2NC42NDJsLS4wMDIuMDAzYTY0LjE2OCA2NC4xNjggMCAwMS03LjQ1NS40NTN2LS4xaC0uMDQ0Yy01Ljk4IDAtMTEuNjk0LS43NzMtMTcuMDc1LTIuMjEtNS4yMi0xLjQ0Ni0xMC4zOTUtMy41OTItMTUuNDI1LTYuNDk2YTY0Ljk0NCA2NC45NDQgMCAwMS0yNS4wNzktMjYuMTMyIDY0Ljk2NCA2NC45NjQgMCAwMS02Ljk4Ni0yMi42NjF6IiBmaWxsPSJ3aGl0ZSIvPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogIDwvZz4KPC9zdmc+" alt="HCB">`,
		],
		[
			/\b2qcf\.|\b236236(?![\d\.])/g, // DOUBLE QUARTER CIRCLE FORWARD
			`<img class="notationMotionIcons" src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+Cgk8cGF0aCBkPSJNMTU3IDkyLjA0NFY5MmgtMTNsMjAuMDM1LTI1TDE4NCA5MmgtMTJ2MC4wNDVjMCAzMS43OTctMTguNTkzIDU5LjMwMS00MC4wMDIgNjkuMjgxIC0xMy44OTcgOC4wMjMtMjguNyAxMS4zNDItNDIuOTkyIDEwLjc3NEg4NC41di0zMi45MTVoMTV2MTcuNTAxYzMwLjg2LTMuNjkgNTcuNS0yOS41NTIgNTcuNS02NC42NDJ6IiBmaWxsPSJ3aGl0ZSIvPgoJPGNpcmNsZSBjeD0iOTIiIGN5PSI5MiIgcj0iNTAiIGZpbGw9InJlZCIvPgo8L3N2Zz4=" alt="QCF"><img class="notationMotionIcons" src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+Cgk8cGF0aCBkPSJNMTU3IDkyLjA0NFY5MmgtMTNsMjAuMDM1LTI1TDE4NCA5MmgtMTJ2MC4wNDVjMCAzMS43OTctMTguNTkzIDU5LjMwMS00MC4wMDIgNjkuMjgxIC0xMy44OTcgOC4wMjMtMjguNyAxMS4zNDItNDIuOTkyIDEwLjc3NEg4NC41di0zMi45MTVoMTV2MTcuNTAxYzMwLjg2LTMuNjkgNTcuNS0yOS41NTIgNTcuNS02NC42NDJ6IiBmaWxsPSJ3aGl0ZSIvPgoJPGNpcmNsZSBjeD0iOTIiIGN5PSI5MiIgcj0iNTAiIGZpbGw9InJlZCIvPgo8L3N2Zz4=" alt="QCF">`,
		],
		[
			/\b2qcb\.|\b214214(?![\d\.])/g, // DOUBLE QUARTER CIRCLE BACK
			`<img class="notationMotionIcons" src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPHBhdGggZD0iTTM1Ni44MjUgNDE5LjU2N3YtLjA0NGgtMTNsMjAuMDM1LTI1IDE5Ljk2NSAyNWgtMTJ2LjA0NWE4MCA4MCAwIDAxLTQwLjAwMiA2OS4yODFjLTEzLjg5NyA4LjAyMy0yOC43IDExLjM0Mi00Mi45OTIgMTAuNzc0aC00LjUwNnYtMzIuOTE1aDE1djE3LjUwMWMzMC44Ni0zLjY5MSA1Ny40OTktMjkuNTUyIDU3LjUtNjQuNjQyeiIgZmlsbD0id2hpdGUiLz4KICAgIDxjaXJjbGUgY3g9Ii0yOTEuODI1IiBjeT0iLTQxOS40OTkiIHI9IjUwIiB0cmFuc2Zvcm09InJvdGF0ZSgxODApIiBmaWxsPSJyZWQiLz4KICA8L2c+Cjwvc3ZnPg==" alt="QCB"><img class="notationMotionIcons" src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPHBhdGggZD0iTTM1Ni44MjUgNDE5LjU2N3YtLjA0NGgtMTNsMjAuMDM1LTI1IDE5Ljk2NSAyNWgtMTJ2LjA0NWE4MCA4MCAwIDAxLTQwLjAwMiA2OS4yODFjLTEzLjg5NyA4LjAyMy0yOC43IDExLjM0Mi00Mi45OTIgMTAuNzc0aC00LjUwNnYtMzIuOTE1aDE1djE3LjUwMWMzMC44Ni0zLjY5MSA1Ny40OTktMjkuNTUyIDU3LjUtNjQuNjQyeiIgZmlsbD0id2hpdGUiLz4KICAgIDxjaXJjbGUgY3g9Ii0yOTEuODI1IiBjeT0iLTQxOS40OTkiIHI9IjUwIiB0cmFuc2Zvcm09InJvdGF0ZSgxODApIiBmaWxsPSJyZWQiLz4KICA8L2c+Cjwvc3ZnPg==" alt="QCB">`,
		],
		[
			/\bdd\.|\b22(?![\d\.])/g, // DOUBLE DOWN
			`<img class="notationMotionIcons" src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTI4NC4zMjQgNDE5LjQ1M3Y2Ny4wMjNoLTEyLjVsMjAgMjUgMjAtMjVoLTEyLjV2LTY3LjAyM2gtMTV6IiBmaWxsPSJ3aGl0ZSIvPgogIDwvZz4KPC9zdmc+Cg==" alt="Down"><img class="notationMotionIcons" src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTI4NC4zMjQgNDE5LjQ1M3Y2Ny4wMjNoLTEyLjVsMjAgMjUgMjAtMjVoLTEyLjV2LTY3LjAyM2gtMTV6IiBmaWxsPSJ3aGl0ZSIvPgogIDwvZz4KPC9zdmc+Cg==" alt="Down">`,
		],
		[
			/\bback\ ?dash|\b44(?![\d\.])/g, // BACK DASH
			`<img class="notationMotionIcons" src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTI5MS44MDEgNDI2Ljk3Nmg2Ny4wMjN2MTIuNWwyNS0yMC0yNS0yMHYxMi41aC02Ny4wMjN2MTV6IiBmaWxsPSJ3aGl0ZSIvPgogIDwvZz4KPC9zdmc+" alt="Back"><img class="notationMotionIcons" src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTI5MS44MDEgNDI2Ljk3Nmg2Ny4wMjN2MTIuNWwyNS0yMC0yNS0yMHYxMi41aC02Ny4wMjN2MTV6IiBmaWxsPSJ3aGl0ZSIvPgogIDwvZz4KPC9zdmc+" alt="Back">`,
		],
		[
			/\bdash|\b66(?![\d\.])/g, // DASH
			`<img class="notationMotionIcons" src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTI5MS44NDggNDExLjk3NmgtNjcuMDIzdi0xMi41bC0yNSAyMCAyNSAyMHYtMTIuNWg2Ny4wMjN2LTE1eiIgZmlsbD0id2hpdGUiLz4KICA8L2c+Cjwvc3ZnPg==" alt="Forward"><img class="notationMotionIcons" src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTI5MS44NDggNDExLjk3NmgtNjcuMDIzdi0xMi41bC0yNSAyMCAyNSAyMHYtMTIuNWg2Ny4wMjN2LTE1eiIgZmlsbD0id2hpdGUiLz4KICA8L2c+Cjwvc3ZnPg==" alt="Forward">`,
		],
		[
			/\buu\.|\b88(?![\d\.])/g, // DOUBLE JUMP
			`<img class="notationMotionIcons" src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTI5OS4zMjQgNDE5LjV2LTY3LjAyNGgxMi41bC0yMC0yNS0yMCAyNWgxMi41VjQxOS41aDE1eiIgZmlsbD0id2hpdGUiLz4KICA8L2c+Cjwvc3ZnPg==" alt="Up"><img class="notationMotionIcons" src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTI5OS4zMjQgNDE5LjV2LTY3LjAyNGgxMi41bC0yMC0yNS0yMCAyNWgxMi41VjQxOS41aDE1eiIgZmlsbD0id2hpdGUiLz4KICA8L2c+Cjwvc3ZnPg==" alt="Up">`,
		],

		// Directional and Modifier Inputs
		[
			/\bdb\.|\b1(?![\d\.\)a-z])/g, // DOWN BACK
			`<img class="notationMotionIcons" src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTI4Ni41MDUgNDI0Ljc2M2w0Ny4zOTIgNDcuMzkzLTguODM5IDguODM4IDMxLjgyIDMuNTM2LTMuNTM1LTMxLjgyLTguODQgOC44MzktNDcuMzkyLTQ3LjM5My0xMC42MDYgMTAuNjA3eiIgZmlsbD0id2hpdGUiLz4KICA8L2c+Cjwvc3ZnPgo=">`,
		],
		[
			/\bcr\.|\b2(?![\d\.\)a-z])/g, // CROUCH
			`<img class="notationMotionIcons" src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTI4NC4zMjQgNDE5LjQ1M3Y2Ny4wMjNoLTEyLjVsMjAgMjUgMjAtMjVoLTEyLjV2LTY3LjAyM2gtMTV6IiBmaWxsPSJ3aGl0ZSIvPgogIDwvZz4KPC9zdmc+Cg==" alt="Down">`,
		],
		[
			/\bdf\.|\b3(?![\d\.\)a-z])/g, // DOWN FORWARD
			`<img class="notationMotionIcons" src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTI4Ni41MzggNDE0LjE1NmwtNDcuMzkzIDQ3LjM5My04LjgzOC04Ljg0LTMuNTM2IDMxLjgyIDMxLjgyLTMuNTM1LTguODM5LTguODM5IDQ3LjM5Mi00Ny4zOTItMTAuNjA2LTEwLjYwN3oiIGZpbGw9IndoaXRlIi8+CiAgPC9nPgo8L3N2Zz4=" alt="Down Forward">`,
		],
		[
			/\bb\.|\b4(?![\d\.\)a-z])/g, // BACK
			`<img class="notationMotionIcons" src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTI5MS44MDEgNDI2Ljk3Nmg2Ny4wMjN2MTIuNWwyNS0yMC0yNS0yMHYxMi41aC02Ny4wMjN2MTV6IiBmaWxsPSJ3aGl0ZSIvPgogIDwvZz4KPC9zdmc+" alt="Back">`,
		],
		[/\bst\.|\b5(?![\d\.\)a-z])/g, ""], //NEUTRAL
		[
			/\bf\.|\b6(?![\d\.\)a-z])/g, // FORWARD
			`<img class="notationMotionIcons" src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTI5MS44NDggNDExLjk3NmgtNjcuMDIzdi0xMi41bC0yNSAyMCAyNSAyMHYtMTIuNWg2Ny4wMjN2LTE1eiIgZmlsbD0id2hpdGUiLz4KICA8L2c+Cjwvc3ZnPg==" alt="Forward">`,
		],
		[
			/\bub\.|\b7(?![\d\.\)a-z])/g, // JUMP BACK
			`<img class="notationMotionIcons" src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTI5Ny4xMTEgNDI0Ljc5Nmw0Ny4zOTItNDcuMzkzIDguODQgOC44NCAzLjUzNS0zMS44Mi0zMS44MiAzLjUzNSA4LjgzOSA4LjgzOS00Ny4zOTMgNDcuMzkyIDEwLjYwNyAxMC42MDd6IiBmaWxsPSJ3aGl0ZSIvPgogIDwvZz4KPC9zdmc+" alt="Up Back">`,
		],
		[
			/\bu\.|\b8(?![\d\.\)a-z])/g, //JUMP
			`<img class="notationMotionIcons" src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTI5OS4zMjQgNDE5LjV2LTY3LjAyNGgxMi41bC0yMC0yNS0yMCAyNWgxMi41VjQxOS41aDE1eiIgZmlsbD0id2hpdGUiLz4KICA8L2c+Cjwvc3ZnPg==" alt="Up">`,
		],
		[
			/\buf\.|\b9(?![\d\.\)a-z])/g, // JUMP FORWARD
			`<img class="notationMotionIcons" src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg0IDE4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjbGFzcz0ibm90YXRpb25Nb3Rpb25JY29ucyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzgzLjgyNSAtMzI3LjQ3NikiPgogICAgPGNpcmNsZSBjeD0iLTI5MS44MjUiIGN5PSItNDE5LjQ5OSIgcj0iNTAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiIGZpbGw9InJlZCIvPgogICAgPHBhdGggZD0iTTI5Ny4xNDQgNDE0LjE5bC00Ny4zOTMtNDcuMzkzIDguODQtOC44MzktMzEuODItMy41MzUgMy41MzUgMzEuODIgOC44MzktOC44NCA0Ny4zOTIgNDcuMzkzIDEwLjYwNy0xMC42MDd6IiBmaWxsPSJ3aGl0ZSIvPgogIDwvZz4KPC9zdmc+" alt="Up Forward">`,
		],
		// Movement modifiers

		// [/\bDC(?!:)\b/g, ""],
		// [/\bj\./g, ""],
		// [/\bjc\./g, ""],
		// [/\bdj\./g, ""],
		// [/\bdl\./g, ""],
		// [/\bsj\./g, ""],
		// [/\bcl\./g, "c"],
		// [/\bSD\b/g, "S"],
		// [/\bADF\b/g, ""],
		// [/\bADD\b/g, ""],
		// [/\bADDF\b/g, ""],

		// Button Inputs
		[
			/\bA(?!:)\b/g, // A Button
			`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
			<path fill="#DE1616" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
			<text x="50%" y="45%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="80" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
				A
			</text>
		</svg>`,
		],
		[
			/\bB(?!:)\b/g, // B Button
			`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
			<path fill="#1F8CCC" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
			<text x="53%" y="50%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="80" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
				B
			</text>
		</svg>`,
		],
		[
			/\bC(?!:)\b/g, // C Button
			`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
			<path fill="#009E4E" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
			<text x="50%" y="50%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="80" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
				C
			</text>
		</svg>`,
		],
		[
			/\bD(?!:)\b/g, // D Button
			`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
			<path fill="#E8982C" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
			<text x="53%" y="50%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="80" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
				D
			</text>
		</svg>`,
		],
		[
			/\bE(?!:)\b/g, // E Button
			`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
			<path fill="#892CE8" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
			<text x="50%" y="45%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="80" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
				E
			</text>
		</svg>`,
		],
		[
			/\bK(?!:)\b/g, // K Button
			`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
			<path fill="#1F8CCC" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
			<text x="50%" y="50%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="75" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
				K
			</text>
		</svg>`,
		],
		[
			/\bP(?!:)\b/g, // P Button
			`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
			<path fill="#FF87D1" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
			<text x="50%" y="50%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="80" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
				P
			</text>
		</svg>`,
		],
		[
			/\bS(?!:)\b/g, // S Button
			`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
			<path fill="#009E4E" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
			<text x="53%" y="50%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="80" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
				S
			</text>
		</svg>`,
		],
		[
			/\bHS(?!:)\b/g, // HS Button
			`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
			<path fill="#DE1616" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
			<text x="50%" y="50%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="60" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
				HS
			</text>
		</svg>`,
		],
		[
			/\bMS(?!:)\b/g, // MS Button
			`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
			<path fill="#E8982C" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
			<text x="50%" y="50%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="60" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
				MS
			</text>
		</svg>`,
		],

		// ASW specific buttons

		// [/\bOD(?!:)\b/g, ""],
		// [/\bRC(?!:)\b/g, ""],
		// [/\bDRC(?!:)\b/g, ""],
		// [/\bYRC(?!:)\b/g, ""],
		// [/\bBRC(?!:)\b/g, ""],
		// [/\bPRC(?!:)\b/g, ""],

		[
			/\bL(?!:)\b/g, // L Button
			`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
			<path fill="#1F8CCC" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
			<text x="50%" y="50%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="80" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
				L
			</text>
		</svg>`,
		],
		[
			/\bM(?!:)\b/g, // M Button
			`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
			<path fill="#E8982C" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
			<text x="50%" y="50%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="75" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
				M
			</text>
		</svg>`,
		],
		[
			/\bH(?!:)\b/g, // H Button
			`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
			<path fill="#DE1616" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
			<text x="50%" y="48%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="75" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
				H
			</text>
		</svg>`,
		],
		[
			/\bX(?!:)\b/g, // X Button
			`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
			<path fill="#1F8CCC" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
			<text x="50%" y="50%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="80" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
				X
			</text>
		</svg>`,
		],
		[
			/\bY(?!:)\b/g, // Y Button
			`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
			<path fill="#E8982C" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
			<text x="50%" y="55%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="80" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
				Y
			</text>
		</svg>`,
		],
		[
			/\bU(?!:)\b/g, // U Button
			`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
			<path fill="#FF87D1" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
			<text x="50%" y="55%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="80" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
				U
			</text>
		</svg>`,
		],
		[
			/\bAA1(?!:)\b/g, // A1 Button
			`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
			<path fill="#892CE8" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
			<text x="50%" y="50%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="80" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
				A1
			</text>
		</svg>`,
		],
		[
			/\bA2(?!:)\b/g, // A2 Button
			`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
			<path fill="#892CE8" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
			<text x="50%" y="55%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="80" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
				A2
			</text>
		</svg>`,
		],
		[
			/\bLP(?!:)\b/g, // LP Button
			`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
			<path fill="#1F8CCC" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
			<text x="50%" y="50%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="65" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
				LP
			</text>
		</svg>`,
		],
		[
			/\bMP(?!:)\b/g, // MP Button
			`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
			<path fill="#E8982C" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
			<text x="50%" y="55%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="60" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
				MP
			</text>
		</svg>`,
		],
		[
			/\bHP(?!:)\b/g, // HP Button
			`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
			<path fill="#DE1616" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
			<text x="50%" y="55%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="60" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
				HP
			</text>
		</svg>`,
		],
		[
			/\bLK(?!:)\b/g, // LK Button
			`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
			<path fill="#1F8CCC" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
			<text x="50%" y="50%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="65" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
				LK
			</text>
		</svg>`,
		],
		[
			/\bMK(?!:)\b/g, // MK Button
			`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
			<path fill="#E8982C" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
			<text x="50%" y="55%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="60" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
				MK
			</text>
		</svg>`,
		],
		[
			/\bHK(?!:)\b/g, // HK Button
			`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="notationButtonIcons">
			<path fill="#DE1616" d="M91.667 50A41.667 41.667 0 0 1 50 91.667 41.667 41.667 0 0 1 8.333 50a41.667 41.667 0 0 1 83.333 0"/>
			<text x="50%" y="55%" text-anchor="middle" fill="#FFF" font-family="Arial Black, Arial, sans-serif" font-size="60" font-weight="bold" dy=".35em" stroke="#000" stroke-width="2.85">
				HK
			</text>
		</svg>`,
		],
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
		[/\bA1\b/g, settings.alt_A1], // A1
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
