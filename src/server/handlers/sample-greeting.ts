import { createSampleGreeting } from "../../sample-greeting/service.ts";
import { jsonResponse } from "../response.ts";
import type { RouteHandler } from "../types.ts";

export function sampleGreetingHandler(): RouteHandler {
	return (ctx) => jsonResponse(200, createSampleGreeting(ctx.url.searchParams.get("name")));
}
