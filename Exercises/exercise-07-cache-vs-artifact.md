# Exercise 7 — Cache vs. Artifact

## Goal

Add dependency caching to the workflow you built through Exercise 6, then compare the role of a cache with the role of a workflow artifact.

By the end of this exercise, you should be able to explain:

- what a cache is used for
- what an artifact is used for
- why a cache can make later runs faster
- why an artifact is still needed even when caching is enabled

This exercise continues directly from the workflow you completed in Exercise 6.

---

# Starting Point

Your workflow should already contain a pipeline similar to:

```text
test → build → deploy-demo
```

It should also already use:

- `needs`
- the `web-dist` artifact
- repository variables and secrets
- explicit permissions
- `workflow_dispatch`
- concurrency
- a local composite action

Your `test` job should already contain steps similar to:

```yaml
steps:
  - uses: actions/checkout@v4

  - uses: actions/setup-node@v4
    with:
      node-version: 22

  - name: Install dependencies
    run: npm ci

  - name: Run tests
    run: npm test
```

In this exercise, you will add one new capability:

```text
dependency cache
```

---

# Part 1 — Add an npm Cache

Find the `test` job that runs:

```yaml
- name: Install dependencies
  run: npm ci
```

Immediately before that step, add:

```yaml
- name: Cache npm downloads
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: npm-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
```

Your relevant steps should now look like:

```yaml
steps:
  - uses: actions/checkout@v4

  - uses: actions/setup-node@v4
    with:
      node-version: 22

  - name: Cache npm downloads
    uses: actions/cache@v4
    with:
      path: ~/.npm
      key: npm-${{ runner.os }}-${{ hashFiles('package-lock.json') }}

  - name: Install dependencies
    run: npm ci

  - name: Run tests
    run: npm test
```

Commit and push the change.

---

# Part 2 — Run the Workflow

Open:

```text
Repository → Actions → CI
```

Run the workflow and open the `test` job.

Look for output from:

```text
Cache npm downloads
```

On the first run, GitHub may not find an existing cache with that key.

That is expected.

The `npm ci` step still runs normally.

---

# Part 3 — Run It Again

Run the same workflow again without changing:

```text
package-lock.json
```

Inspect the cache step again.

This time, GitHub should be able to reuse the previously saved npm cache.

The key idea is:

> The cache can reduce repeated dependency-download work across workflow runs.

The cache does **not** replace:

```yaml
npm ci
```

It gives `npm ci` a local cache of package downloads that it may be able to reuse.

---

# Part 4 — Keep the Artifact

Do **not** remove the existing artifact steps.

Your `build` job should still upload:

```text
web-dist
```

For example:

```yaml
- name: Upload build output
  uses: actions/upload-artifact@v4
  with:
    name: web-dist
    path: dist/
```

A later job should still download it:

```yaml
- name: Download build output
  uses: actions/download-artifact@v5
  with:
    name: web-dist
    path: ./dist
```

The cache and artifact solve different problems.

---

# Compare the Two

## Cache

```text
~/.npm
```

Purpose:

```text
speed
```

The cache helps later workflow runs avoid downloading the same dependency data again.

## Artifact

```text
dist/
```

Purpose:

```text
output handoff
```

The artifact preserves the build output so another job can use exactly what the build job produced.

---

# Questions

1. Which job contains the cache?
2. What directory is being cached?
3. What causes the cache key to change?
4. Why is `${{ runner.os }}` included in the key?
5. Does the cache replace `npm ci`?
6. Why do we still need the `web-dist` artifact?
7. Which one would you use for a test report: cache or artifact?
8. Which one would you use for downloaded package data that can safely be recreated?

---

# Key Takeaway

A useful mental model is:

```text
Cache = speed up later work
Artifact = preserve or pass workflow output
```

The cache does **not** replace the dependency-install step.

The artifact does **not** exist primarily to make later runs faster.

Use each mechanism for the problem it is designed to solve.

---

# Optional Experiment

Make a small dependency change that updates:

```text
package-lock.json
```

Run the workflow again.

Then inspect the cache step.

### Question

Why might GitHub create or use a different cache after the lockfile changes?
