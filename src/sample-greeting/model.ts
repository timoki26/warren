import { ValidationError } from "../core/errors.ts";

export interface SampleGreeting {
	message: string;
	name: string;
}

const DEFAULT_NAME = "agent";
const MAX_NAME_LENGTH = 40;

export function parseSampleGreetingName(value: unknown): string {
	if (value === undefined || value === null) return DEFAULT_NAME;
	if (typeof value !== "string") {
		throw new ValidationError("sample greeting name must be a string");
	}

	const name = value.trim();
	if (name.length === 0) {
		throw new ValidationError("sample greeting name must not be empty");
	}
	if (name.length > MAX_NAME_LENGTH) {
		throw new ValidationError(`sample greeting name must be at most ${MAX_NAME_LENGTH} characters`);
	}
	return name;
}
