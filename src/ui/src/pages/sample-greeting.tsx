import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { sampleGreetingApi } from "@/api/client.ts";
import { Alert } from "@/components/ui/alert.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { PageHeader } from "@/components/ui/page-header.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { formatError } from "@/lib/format-error.ts";

export function SampleGreetingPage() {
	const [name, setName] = useState("Codex");
	const greeting = useQuery({
		queryKey: ["sample-greeting", name],
		queryFn: ({ signal }) => sampleGreetingApi.get(name, signal),
		enabled: name.trim().length > 0,
	});

	return (
		<div className="space-y-6">
			<PageHeader
				title="Sample greeting"
				description="A minimal end-to-end sample proving the domain, API, and UI layers work."
			/>
			<Card className="max-w-xl">
				<CardHeader>
					<CardTitle>Agent hello</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="sample-greeting-name">Name</Label>
						<Input
							id="sample-greeting-name"
							maxLength={40}
							value={name}
							onChange={(event) => setName(event.target.value)}
						/>
					</div>
					{greeting.isLoading ? <Spinner label="Loading greeting" /> : null}
					{greeting.isError ? (
						<Alert variant="danger" title="Greeting failed">
							{formatError(greeting.error)}
						</Alert>
					) : null}
					{greeting.data ? <p className="text-lg font-medium">{greeting.data.message}</p> : null}
				</CardContent>
			</Card>
		</div>
	);
}
