### `husky` + `lint‑staged` Guide

---

#### 1. Why do we use them?

| Tool            | What it does for us                                                                                       | When it runs                                                                                    |
| --------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **husky**       | Manages Git **hooks** inside the repo (no global setup needed).                                           | Every `git commit`, `git push`, etc.—whatever hooks we define.                                  |
| **lint‑staged** | Filters the commit’s _staged_ files and runs the right commands (ESLint, Prettier, tests, TypeScript, …). | Triggered **by husky’s `pre‑commit` hook** so only code about to be committed is checked/fixed. |

Result: Consistent code style across all team members

---

#### 2. What happens on every commit?

```txt
git commit
└── husky pre‑commit
    └── lint‑staged
        ├─ ESLint  → auto‑fixes            (*.js, *.ts, …)
        ├─ Prettier → formats              (*.js, *.ts, *.json, *.md, …)
        └─ tsc --noEmit → type‑checks      (*.ts, *.tsx)
```

If any step **fails** (errors or un‑fixed warnings), the commit is aborted so you can fix issues immediately.

---

#### 3. Getting started (for new contributors)

1. **Install dependencies**

   ```bash
   yarn install
   ```

   Husky automatically sets up Git hooks during this step (see `.husky/` folder).

2. **Verify it works**

   ```bash
   echo "const Foo = 1" > test.js   # intentionally bad style
   git add test.js
   git commit -m "chore: demo"      # watch Prettier + ESLint fix it
   ```

3. **If hooks don’t fire…**

   - Make sure `.husky/*` scripts are **executable** (`chmod +x .husky/*`).
   - Confirm `core.hooksPath` is set by Husky:

     ```bash
     git config --get core.hooksPath   # should print "./frontend/.husky/_"
     ```

---

#### 4. Skipping hooks (rare emergencies)

```bash
git commit --no-verify -m "hotfix: broken prod build"
```

---

#### 5. Troubleshooting cheat‑sheet

| Symptom                                   | Fix                                                                            |
| ----------------------------------------- | ------------------------------------------------------------------------------ |
| _“husky > Cannot find module…”_           | Re‑run `yarn install`. Husky scripts are generated post‑install.               |
| Hooks run, but staged files list is empty | Check `lint‑staged` globs—Windows vs Unix path separators can bite.            |
| Commit aborted even after auto‑fix        | Some ESLint rules are **non‑fixable**; inspect the error list in the terminal. |
