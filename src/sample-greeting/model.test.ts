import { describe, expect, test } from "bun:test";
import { ValidationError } from "../core/errors.ts";
import { parseSampleGreetingName } from "./model.ts";

describe("parseSampleGreetingName", () => {
	test("uses the sample default when the name is omitted", () => {
		expect(parseSampleGreetingName(undefined)).toBe("agent");
	});

	test("trims a supplied name", () => {
		expect(parseSampleGreetingName("  Codex  ")).toBe("Codex");
	});

	test("rejects invalid names", () => {
		expect(() => parseSampleGreetingName("  ")).toThrow(ValidationError);
		expect(() => parseSampleGreetingName("x".repeat(41))).toThrow(ValidationError);
		expect(() => parseSampleGreetingName(42)).toThrow(ValidationError);
	});
});
