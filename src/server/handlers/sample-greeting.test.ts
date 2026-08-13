import { describe, expect, test } from "bun:test";
import type { RouteContext } from "../types.ts";
import { sampleGreetingHandler } from "./sample-greeting.ts";

describe("sampleGreetingHandler", () => {
	test("returns the sample greeting as JSON", async () => {
		const ctx = {
			url: new URL("http://warren.test/api/sample-greeting?name=Codex"),
		} as RouteContext;
		const response = await sampleGreetingHandler()(ctx);

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ name: "Codex", message: "Hello, Codex!" });
	});
});
