# Exercise 3 — Build a Multi-Job Pipeline

## Goal

Expand the workflow from Exercise 2 into a simple multi-job pipeline and observe how job dependencies affect execution.

By the end of this exercise, you should be able to recognize and explain:

- multiple jobs in one workflow
- `needs`
- job dependency order
- failure propagation
- why later jobs should depend on earlier validation steps

---

## Starting Point

Continue using the same repository and the same workflow file:

```text
.github/workflows/ci.yml
```

Your workflow from Exercise 2 should already include:

- `workflow_dispatch`
- a `push` trigger
- `actions/checkout@v7`
- a step that displays `${{ github.event_name }}`

For this exercise, you will replace the single `hello` job with three jobs:

```text
test → build → deploy-demo
```

---

## Part 1 — Create the `test` Job

Replace the existing `jobs:` section with:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v7

      - name: Show trigger
        run: echo "Triggered by ${{ github.event_name }}"

      - name: Run tests
        run: echo "Tests passed"
```

Commit and push the change.

Open the **Actions** tab and inspect the workflow run.

### Question

How many jobs ran?

---

## Part 2 — Add a `build` Job

Add a second job:

```yaml
  build:
    needs: test
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v7

      - name: Build application
        run: |
          mkdir -p dist
          cp src/index.html dist/index.html
```

Your workflow now contains:

```text
test → build
```

Commit and push the change.

Open the workflow run and inspect the job graph.

### Questions

1. Which job ran first?
2. Why did `build` wait for `test`?
3. What does `needs: test` mean?

---

## Part 3 — Add a `deploy-demo` Job

Add a third job:

```yaml
  deploy-demo:
    needs: build
    runs-on: ubuntu-latest

    steps:
      - name: Deploy
        run: echo "Deploying application"
```

The job dependency chain is now:

```text
test → build → deploy-demo
```

Commit and push the change.

Open the workflow run and inspect the job graph.

### Questions

1. Which job depends on `test`?
2. Which job depends on `build`?
3. Could `deploy-demo` begin before `build` finishes?
4. Why is this ordering useful in a CI/CD pipeline?

---

## Part 4 — Examine the Complete Workflow

Your workflow should now look similar to:

```yaml
name: CI

on:
  workflow_dispatch:

  push:
    branches:
      - main
    paths:
      - 'src/**'

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v7

      - name: Show trigger
        run: echo "Triggered by ${{ github.event_name }}"

      - name: Run tests
        run: echo "Tests passed"

  build:
    needs: test
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v7

      - name: Build application
        run: |
          mkdir -p dist
          cp src/index.html dist/index.html

  deploy-demo:
    needs: build
    runs-on: ubuntu-latest

    steps:
      - name: Deploy
        run: echo "Deploying application"
```

> If your trigger configuration differs slightly from the example above, that is fine. Keep the trigger behavior from Exercise 2 unless instructed otherwise.

---

## Part 5 — Break the Test Job

Before changing anything, predict what should happen if the test job fails.

Change:

```yaml
- name: Run tests
  run: echo "Tests passed"
```

to:

```yaml
- name: Run tests
  run: exit 1
```

Commit and push the change.

Open the workflow run.

### Observe

Check the status of:

- `test`
- `build`
- `deploy-demo`

### Questions

1. Which job failed?
2. Did `build` run?
3. Did `deploy-demo` run?
4. Why were the later jobs skipped?

---

## Part 6 — Restore the Test

Change the test step back to:

```yaml
- name: Run tests
  run: echo "Tests passed"
```

Commit and push again.

Confirm that all three jobs complete successfully.

---

## Key Takeaway

The `needs` keyword creates explicit job dependencies.

For example:

```yaml
build:
  needs: test
```

means that `build` waits for `test` to complete successfully.

Similarly:

```yaml
deploy-demo:
  needs: build
```

means that deployment waits for the build.

This gives us a simple pipeline:

```text
test → build → deploy-demo
```

If an earlier required job fails, dependent jobs do not normally run.

A useful CI/CD principle is:

> **Do not build or deploy code that has already failed validation.**

---

## Important Distinction

`needs` controls job order and dependency.

It does **not** move files between jobs.

The `build` job creates:

```text
dist/index.html
```

but that file does not automatically appear in `deploy-demo`.

In the next exercise, you will solve that problem with artifacts.

---

## Challenge

Add a second validation job named:

```text
lint
```

Have it run:

```yaml
run: echo "Lint passed"
```

Then make `build` depend on both `test` and `lint`:

```yaml
needs:
  - test
  - lint
```

Run the workflow and inspect the graph.

What happens if either validation job fails?
