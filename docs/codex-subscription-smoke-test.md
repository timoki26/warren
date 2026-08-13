# Codex subscription smoke test

After following [the setup guide](codex-subscription.md), verify the local
integration with a disposable project:

1. Start Warren with both Compose files and confirm `warren doctor` reports the
   `codex` runtime as installed.
2. Dispatch the built-in `codex` agent with a prompt that creates a small file,
   commits it, and reports the final commit.
3. Confirm the event stream contains a trusted `turn.completed` system event
   and the Warren run reaches `succeeded`.
4. Confirm the pushed branch contains the commit and no `.warren/codex-home`
   directory or `auth.json` file.
5. Run `codex login status` on the host again to confirm the refreshed mounted
   credential remains usable.
