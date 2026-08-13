import { describe, expect, test } from "bun:test";
import { createSampleGreeting } from "./service.ts";

describe("createSampleGreeting", () => {
	test("creates a greeting from validated input", () => {
		expect(createSampleGreeting("Codex")).toEqual({
			name: "Codex",
			message: "Hello, Codex!",
		});
	});
});
