# Codex subscription authentication (local runtime)

Warren can run the built-in `codex` agent against the ChatGPT-managed login
used by Codex CLI. This is the local, single-operator path; it does not require
`OPENAI_API_KEY` and uses the limits or credits attached to the signed-in
ChatGPT workspace.

## 1. Sign in on the Docker host

Install Codex CLI, sign in with the ChatGPT account whose subscription you want
to use, and verify the saved session:

```bash
codex login
codex login status
test -f "$HOME/.codex/auth.json"
```

Treat `auth.json` like a password. Do not copy it into the repository, paste it
into `.env`, or expose this Warren instance to untrusted users.

## 2. Build and start the local checkout

The Codex override builds this checkout, installs the pinned Codex CLI, and
bind-mounts only `auth.json` at `/data/codex/auth.json`:

```bash
cp .env.example .env
$EDITOR .env
docker compose \
  -f docker-compose.yml \
  -f docker-compose.codex.yml \
  up -d --build
```

The default source is `$HOME/.codex/auth.json`. For a different location, set
an absolute path before starting Compose:

```bash
export WARREN_CODEX_AUTH_FILE=/absolute/path/to/.codex/auth.json
```

The mount is read-write because Codex refreshes its saved session. Warren never
mounts the rest of the host's `.codex` directory into an agent sandbox. For
each run, Burrow copies the auth file into a git-ignored runtime directory,
runs `codex exec --json --ephemeral`, persists a successful refresh back to the
mounted file, and removes the workspace copy before reap and push.

## 3. Dispatch

Open `http://localhost:8080`, select the `codex` agent, and dispatch normally.
The CLI equivalent is:

```bash
warren run codex <project-id> -p "Implement the requested change and run the quality gates"
```

An optional per-run model override becomes Codex's `--model` value. With no
override, Codex uses the subscription/workspace default. Codex does not inherit
the project's generic `defaultProvider` or `defaultModel`, because those may
target a different runtime and an unsupported provider model identifier.

## Limits

- This integration targets `WARREN_RUNTIME=local`. Kubernetes needs a separate
  secret-volume and refresh strategy before subscription auth is safe there.
- Codex is one-shot in Warren. Mid-run steering cannot enter the active Codex
  process; use a continuation run for follow-up instructions.
- The Codex process disables its inner sandbox because Burrow's bwrap sandbox
  is already the outer enforcement boundary.
- For shared CI or multi-user service operation, use service credentials rather
  than a personal ChatGPT-managed login.
