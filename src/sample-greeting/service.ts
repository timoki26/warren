import type { SampleGreeting } from "./model.ts";
import { parseSampleGreetingName } from "./model.ts";

export function createSampleGreeting(nameValue: unknown): SampleGreeting {
	const name = parseSampleGreetingName(nameValue);
	return { name, message: `Hello, ${name}!` };
}
