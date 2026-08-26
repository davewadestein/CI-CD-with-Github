# Exercise 2 — Trigger Workflows Automatically

## Goal

Modify the workflow from Exercise 1 so that it runs automatically when relevant repository changes occur.

By the end of this exercise, you should be able to recognize and explain:

- `push`
- branch filters
- path filters
- `workflow_dispatch`
- `github.event_name`
- the difference between `src/*` and `src/**`
- why workflows should run only when they are relevant

---

## Starting Point

Continue using the same repository and the same workflow file from Exercise 1:

```text
.github/workflows/ci.yml
```

Your workflow should already contain a job similar to this:

```yaml
name: CI

on:
  workflow_dispatch:

jobs:
  hello:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v7

      - name: Show environment
        run: |
          echo "Hello from GitHub Actions"
          uname -a
          pwd

      - name: List files
        run: ls -la
```

> `actions/checkout@v7` is the current major version used in these exercises.

---

## Part 1 — Add an Automatic `push` Trigger

Change the `on:` section so the workflow can run either manually or automatically when code is pushed to `main`:

```yaml
on:
  workflow_dispatch:

  push:
    branches:
      - main
```

Also add this step so you can see what event triggered the workflow:

```yaml
      - name: Show trigger
        run: echo "Triggered by ${{ github.event_name }}"
```

Your `steps` section should now include:

```yaml
steps:
  - uses: actions/checkout@v7

  - name: Show trigger
    run: echo "Triggered by ${{ github.event_name }}"

  - name: Show environment
    run: |
      echo "Hello from GitHub Actions"
      uname -a
      pwd

  - name: List files
    run: ls -la
```

Commit and push the change.

Because you changed the workflow file itself, this push should trigger the workflow automatically.

Open the **Actions** tab and inspect the new workflow run.

Expand the **Show trigger** step.

You should see:

```text
Triggered by push
```

---

## Questions

Be prepared to answer:

1. What caused this workflow run?
2. Which branch triggered it?
3. What does `${{ github.event_name }}` tell you?
4. Can the workflow still be run manually?
5. Why might it be useful to keep `workflow_dispatch` even when `push` is configured?

---

## Part 2 — Compare Automatic and Manual Runs

Run the same workflow manually:

1. Open the **Actions** tab
2. Select the **CI** workflow
3. Click **Run workflow**
4. Open the new run
5. Expand the **Show trigger** step

This time you should see:

```text
Triggered by workflow_dispatch
```

### Key Observation

The same workflow can run for different reasons.

The value of:

```yaml
${{ github.event_name }}
```

tells you which event caused the current run.

---

## Part 3 — Trigger the Workflow with a Repository Change

Make a small change to:

```text
README.md
```

For example, add a line such as:

```text
Testing the automatic GitHub Actions workflow
```

Commit and push the change.

Then:

1. Open the **Actions** tab
2. Find the workflow run created by your push
3. Open the run
4. Confirm that the `hello` job completed successfully
5. Confirm that **Show trigger** reports:

```text
Triggered by push
```

At this point, every push to `main` can start this workflow.

---

## Part 4 — Limit the Workflow to Relevant Files

Suppose this workflow only needs to run when application files under `src/` change.

Add a `paths` filter:

```yaml
on:
  workflow_dispatch:

  push:
    branches:
      - main
    paths:
      - 'src/**'
```

Commit and push the change.

---

## Part 5 — Test the Path Filter

You will now make two separate changes.

### Test A — Change `README.md`

Modify only:

```text
README.md
```

Commit and push the change.

Check the **Actions** tab.

### Question

Did the workflow run?

---

### Test B — Change `src/index.html`

Modify:

```text
src/index.html
```

For example, change some text in the page.

Commit and push the change.

Check the **Actions** tab again.

### Questions

- Did the workflow run this time?
- What does the **Show trigger** step report?

---

## Part 6 — Understand `*` vs. `**`

GitHub path filters support wildcard patterns.

Consider these two patterns:

```yaml
paths:
  - 'src/*'
```

and:

```yaml
paths:
  - 'src/**'
```

The difference is important:

- `src/*` matches files directly inside `src/`
- `src/**` also matches files in directories below `src/`

For example:

```text
src/index.html
src/css/site.css
src/js/app.js
```

With:

```yaml
'src/*'
```

`src/index.html` matches, but files inside `src/css/` or `src/js/` do not.

With:

```yaml
'src/**'
```

all of the files above can match.

---

## Questions

Be prepared to discuss:

1. Why might a team avoid running every workflow on every push?
2. What kinds of workflows might use path filters?
3. Why would `src/**` often be safer than `src/*` for an application source directory?
4. What is the benefit of keeping the manual `workflow_dispatch` trigger?
5. How can you tell whether a workflow was started by a push or manually?

---

## Key Takeaway

Workflow triggers answer:

> **When should this automation run?**

A broad trigger such as:

```yaml
push:
```

may run more often than necessary.

Branch and path filters let you make the trigger more specific:

```yaml
push:
  branches:
    - main
  paths:
    - 'src/**'
```

And this expression:

```yaml
${{ github.event_name }}
```

lets the workflow inspect which event triggered the current run.

This helps make workflow behavior easier to understand and verify.

---

## Challenge

Add another file under a nested directory, for example:

```text
src/css/site.css
```

Commit and push it.

Confirm that:

```yaml
'src/**'
```

causes the workflow to run.

Then temporarily change the filter to:

```yaml
'src/*'
```

Modify only `src/css/site.css`, commit, and push again.

What happens?
