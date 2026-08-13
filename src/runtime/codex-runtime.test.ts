import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { type Burrow, codexRuntime, type Run } from "@os-eco/burrow-cli";

const BURROW: Burrow = {
	id: "bur_codex",
	parentId: null,
	kind: "project",
	name: null,
	projectRoot: "/repo",
	workspacePath: "/repo/workspace",
	branch: "codex/run",
	provider: "local",
	providerStateJson: null,
	profileJson: {},
	state: "active",
	createdAt: new Date(0),
	updatedAt: new Date(0),
	destroyedAt: null,
};

const RUN: Run = {
	id: "run_codex",
	burrowId: BURROW.id,
	agentId: "codex",
	prompt: "fix it",
	resumeOfRunId: null,
	state: "running",
	exitCode: null,
	errorMessage: null,
	metadataJson: null,
	queuedAt: new Date(0),
	startedAt: new Date(0),
	completedAt: null,
};

describe("patched Codex runtime", () => {
	test("uses current JSONL stdin automation contract and honors model override", () => {
		const command = codexRuntime.buildSpawnCommand({
			burrow: BURROW,
			run: RUN,
			prompt: "fix it",
			pendingMessages: [],
			envResolved: {},
			workspacePath: "/repo/workspace",
			frontmatter: { model: "gpt-codex-test" },
		});

		expect(command.argv).toContain("--json");
		expect(command.argv).toContain("danger-full-access");
		expect(command.argv).toContain("gpt-codex-test");
		expect(command.argv.at(-1)).toBe("-");
		expect(command.stdin).toBe("fix it");
		expect(command.env?.CODEX_HOME).toBe(
			process.platform === "linux"
				? "/workspace/.warren/codex-home"
				: "/repo/workspace/.warren/codex-home",
		);
	});

	test("maps Codex terminal JSONL into the trusted system-event carrier", () => {
		const [event] = codexRuntime.parseEvents(
			JSON.stringify({ type: "turn.completed", usage: { input_tokens: 10 } }),
			{ burrow: BURROW, run: RUN },
		);
		expect(event?.kind).toBe("state_change");
		expect(event?.stream).toBe("system");
		expect(event?.payload).toEqual({ type: "turn.completed", usage: { input_tokens: 10 } });
	});
});

describe("Codex subscription credential lifecycle", () => {
	let root: string;
	let workspace: string;
	let originalCodexHome: string | undefined;

	beforeEach(async () => {
		root = await mkdtemp(join(tmpdir(), "warren-codex-runtime-"));
		workspace = join(root, "workspace");
		const hostCodexHome = join(root, "host-codex");
		await mkdir(workspace, { recursive: true });
		await mkdir(hostCodexHome, { recursive: true });
		await writeFile(join(hostCodexHome, "auth.json"), '{"version":1}\n', { mode: 0o600 });
		originalCodexHome = process.env.CODEX_HOME;
		process.env.CODEX_HOME = hostCodexHome;
	});

	afterEach(async () => {
		if (originalCodexHome === undefined) delete process.env.CODEX_HOME;
		else process.env.CODEX_HOME = originalCodexHome;
		await rm(root, { recursive: true, force: true });
	});

	test("copies auth into an ignored runtime home and persists refreshes", async () => {
		await codexRuntime.prepareWorkspace?.({ burrow: BURROW, run: RUN, workspacePath: workspace });
		const runtimeHome = join(workspace, ".warren", "codex-home");
		expect(await readFile(join(runtimeHome, "auth.json"), "utf8")).toBe('{"version":1}\n');
		expect(await readFile(join(runtimeHome, ".gitignore"), "utf8")).toBe("*\n");

		await rm(join(runtimeHome, "auth.json"));
		await writeFile(join(runtimeHome, "refreshed-auth.json"), '{"version":2}\n', {
			mode: 0o600,
		});
		await codexRuntime.extractMetadata?.({ burrow: BURROW, run: RUN, workspacePath: workspace });

		expect(await readFile(join(process.env.CODEX_HOME ?? "", "auth.json"), "utf8")).toBe(
			'{"version":2}\n',
		);
		expect(existsSync(runtimeHome)).toBe(false);
	});
});
