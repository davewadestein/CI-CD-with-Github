# Exercise 7 — Cache vs. Artifact

## Goal

Add a simple workflow cache, run the workflow twice, and compare the purpose of a cache with the purpose of a workflow artifact.

By the end of this exercise, you should be able to explain:

- what a cache is used for
- what an artifact is used for
- how a cache can speed up later workflow runs
- why a cache and an artifact solve different problems

This exercise continues from the workflow you completed in Exercise 6.

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

In this exercise, you will add one new capability:

```text
workflow cache
```

---

# Part 1 — Add a Demo Cache

In the `test` job, after `actions/checkout`, add:

```yaml
- name: Restore demo cache
  id: demo-cache
  uses: actions/cache@v4
  with:
    path: .demo-cache
    key: demo-cache-${{ runner.os }}-${{ hashFiles('src/**') }}
```

This tells GitHub Actions to save and restore the directory:

```text
.demo-cache
```

The cache key includes:

```text
runner operating system
+
hash of the files under src/
```

If the source files change, the key changes too.

---

# Part 2 — Simulate Expensive Setup

Immediately after the cache step, add:

```yaml
- name: Simulate expensive setup
  if: steps.demo-cache.outputs.cache-hit != 'true'
  run: |
    echo "Cache miss — doing expensive setup"
    mkdir -p .demo-cache
    sleep 5
    echo "prepared" > .demo-cache/result.txt
```

Then add:

```yaml
- name: Use cached setup
  run: cat .demo-cache/result.txt
```

Your relevant `test` job should now look similar to:

```yaml
test:
  runs-on: ubuntu-latest

  steps:
    - uses: actions/checkout@v4

    - name: Restore demo cache
      id: demo-cache
      uses: actions/cache@v4
      with:
        path: .demo-cache
        key: demo-cache-${{ runner.os }}-${{ hashFiles('src/**') }}

    - name: Simulate expensive setup
      if: steps.demo-cache.outputs.cache-hit != 'true'
      run: |
        echo "Cache miss — doing expensive setup"
        mkdir -p .demo-cache
        sleep 5
        echo "prepared" > .demo-cache/result.txt

    - name: Use cached setup
      run: cat .demo-cache/result.txt
```

Commit and push the change.

---

# Part 3 — Run the Workflow

Open:

```text
Repository → Actions → CI
```

Run the workflow and open the `test` job.

On the first run, GitHub should not find a matching cache.

You should see the simulated setup step run:

```text
Cache miss — doing expensive setup
```

At the end of the job, GitHub Actions can save:

```text
.demo-cache
```

for a later run.

---

# Part 4 — Run It Again

Run the workflow again without changing anything under:

```text
src/
```

Inspect the `test` job.

This time, GitHub should restore the cache.

Because the cache was found, this condition:

```yaml
if: steps.demo-cache.outputs.cache-hit != 'true'
```

should prevent the simulated expensive setup step from running.

The workflow can immediately use:

```text
.demo-cache/result.txt
```

---

# Part 5 — Keep the Artifact

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
.demo-cache/
```

Purpose:

```text
speed
```

The cache lets later workflow runs reuse data that can safely be recreated.

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

1. What directory is being cached?
2. What causes the cache key to change?
3. Why is `${{ runner.os }}` included in the key?
4. What happens on the first run?
5. What happens on the second run?
6. Why is the simulated setup step skipped after a cache hit?
7. Why do we still need the `web-dist` artifact?
8. Which one would you use for a test report: cache or artifact?
9. Which one would you use for data that can safely be recreated but is expensive to generate?

---

# Key Takeaway

A useful mental model is:

```text
Cache = speed up later work
Artifact = preserve or pass workflow output
```

A cache is useful for data that can be recreated but is expensive to recreate.

An artifact is useful when the output itself matters and must be preserved or passed to another job.

---

# Optional Experiment

Make a small change to a file under:

```text
src/
```

Commit and push the change.

Then inspect the cache step again.

### Question

Why does changing a file under `src/` cause GitHub to use a different cache key?
