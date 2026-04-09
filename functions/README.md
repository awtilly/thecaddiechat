# The Caddie Chat — Firebase Admin Function

## What this does

`publishDraft` is an HTTPS Firebase Cloud Function that:

1. Receives `{ password, action, slug }` from the `/admin/` page
2. Verifies `password` against a bcrypt hash stored in env
3. Calls GitHub's `workflow_dispatch` API to trigger `.github/workflows/publish-draft.yml`
4. That workflow flips `draft: true → false` (publish) or deletes the file (discard),
   commits, and pushes — which triggers the existing `deploy.yml` and rebuilds the site

---

## One-time setup

### 1. Install Firebase CLI (if not already)

```bash
npm install -g firebase-tools
firebase login
```

### 2. Install function dependencies

```bash
cd functions
npm install
```

### 3. Create a GitHub fine-grained PAT

Go to: https://github.com/settings/tokens?type=beta

- **Repository access:** `awtilly/thecaddiechat` only
- **Permissions:**
  - Contents: **Read and write**
  - Actions: **Read and write**

Copy the token — you'll use it in two places (Firebase env + GitHub repo secret).

### 4. Generate a bcrypt hash for your admin password

Choose a strong password, then run:

```bash
# Using node (bcryptjs must be installed in functions/ first: npm install)
node -e "const b=require('./functions/node_modules/bcryptjs'); b.hash('YOUR_PASSWORD', 12).then(h => console.log(h))"
```

Or with Python (if you have passlib):

```bash
python3 -c "from passlib.hash import bcrypt; print(bcrypt.hash('YOUR_PASSWORD', rounds=12))"
```

Copy the `$2b$...` hash string.

### 5. Set environment variables on the Firebase function

```bash
firebase functions:config:set \
  admin.password_hash='$2b$12$YOUR_HASH_HERE' \
  admin.github_token='github_pat_YOUR_TOKEN_HERE' \
  --project thecaddiechat-178de
```

Then update `functions/index.js` to read from Firebase config, **OR** use the
newer `.env` file approach (recommended for firebase-functions v6):

Create `functions/.env` (this file is gitignored — never commit it):

```
ADMIN_PASSWORD_HASH=$2b$12$YOUR_HASH_HERE
GITHUB_TOKEN=github_pat_YOUR_TOKEN_HERE
```

The function already reads `process.env.ADMIN_PASSWORD_HASH` and
`process.env.GITHUB_TOKEN`, so the `.env` file works directly.

### 6. Set PUBLISH_PAT as a GitHub repo secret

In GitHub → `awtilly/thecaddiechat` → Settings → Secrets and variables → Actions:

- Name: `PUBLISH_PAT`
- Value: the same PAT from step 3

This is needed so the `publish-draft.yml` workflow can push to main in a way
that triggers the `deploy.yml` build. (Pushes using the default `GITHUB_TOKEN`
do not re-trigger other workflows — using a PAT does.)

### 7. Deploy the function

```bash
# From the repo root
firebase deploy --only functions:publishDraft --project thecaddiechat-178de
```

The function URL will be printed after deploy:

```
Function URL (publishDraft): https://us-central1-thecaddiechat-178de.cloudfunctions.net/publishDraft
```

This URL is already set in `src/pages/admin/index.astro`. If your region differs
from `us-central1`, update the `FUNCTION_URL` constant at the top of that file's
`<script>` block.

---

## Testing locally

You can test the function without deploying using the Firebase emulator:

```bash
cd functions && npm install
firebase emulators:start --only functions --project thecaddiechat-178de
```

The emulator URL will be something like:
`http://localhost:5001/thecaddiechat-178de/us-central1/publishDraft`

Temporarily swap `FUNCTION_URL` in `src/pages/admin/index.astro` while testing,
then restore before committing.

---

## Updating the password

Generate a new bcrypt hash and re-set the env var, then redeploy.
