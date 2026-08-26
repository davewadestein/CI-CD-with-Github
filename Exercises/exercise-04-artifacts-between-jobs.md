# Exercise 4 — Pass Build Output Between Jobs

## Goal

Use GitHub Actions artifacts to move build output from one job to another.

By the end of this exercise, you should be able to recognize and explain:

- why jobs do not automatically share files
- `actions/upload-artifact`
- `actions/download-artifact`
- artifact names and paths
- the difference between `needs` and artifacts
- why deployment should use the exact output that was already built

---

## Starting Point

Continue using the same repository and the same workflow file:

```text
.github/workflows/ci.yml
```

Your workflow from Exercise 3 should already contain:

```text
test → build → deploy-demo
```

The `build` job should create:

```text
dist/index.html
```

using commands similar to:

```yaml
- name: Build application
  run: |
    mkdir -p dist
    cp src/index.html dist/index.html
```

The `deploy-demo` job currently runs after `build`, but it does not yet receive the files created by `build`.

---

## Part 1 — Prove That Jobs Do Not Share Files Automatically

In the `deploy-demo` job, add a step that lists the files available on that runner:

```yaml
  deploy-demo:
    needs: build
    runs-on: ubuntu-latest

    steps:
      - name: Inspect files
        run: ls -R .

      - name: Deploy
        run: echo "Deploying application"
```

Commit and push the change.

Open the workflow run and inspect the output from:

```text
Inspect files
```

### Question

Do you see:

```text
dist/index.html
```

in the `deploy-demo` job?

You should not.

---

## Why?

Each job normally runs in its own fresh runner environment.

The `build` job created:

```text
dist/index.html
```

on the runner used by `build`.

The `deploy-demo` job may run on a completely different runner.

This:

```yaml
needs: build
```

makes `deploy-demo` wait for `build`, but it does not copy files from one runner to another.

---

## Part 2 — Upload the Build Output

Add an artifact upload step to the `build` job:

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

      - name: Upload build output
        uses: actions/upload-artifact@v7
        with:
          name: web-dist
          path: dist/
```

The important pieces are:

```yaml
name: web-dist
```

This is the name GitHub gives the stored artifact.

```yaml
path: dist/
```

This is the local directory on the build runner that should be uploaded.

Commit and push the change.

Open the workflow run and inspect the `build` job.

---

## Part 3 — Find the Stored Artifact

After the workflow run completes, open the run summary page.

Look for the artifact named:

```text
web-dist
```

The artifact is now stored by GitHub and associated with this workflow run.

### Questions

1. What files were uploaded?
2. What is the artifact called?
3. Where did those files originally exist?

---

## Part 4 — Download the Artifact in `deploy-demo`

Now modify `deploy-demo` so it downloads the artifact:

```yaml
  deploy-demo:
    needs: build
    runs-on: ubuntu-latest

    steps:
      - name: Download build output
        uses: actions/download-artifact@v7
        with:
          name: web-dist
          path: ./dist

      - name: Inspect build output
        run: |
          ls -R dist
          cat dist/index.html

      - name: Deploy
        run: echo "Deploying application"
```

Commit and push the change.

Open the workflow run and inspect:

```text
Inspect build output
```

You should now see:

```text
dist/index.html
```

and the contents of the file.

---

## Part 5 — Examine the Complete Build and Deploy Jobs

Your workflow should now contain jobs similar to:

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

    - name: Upload build output
      uses: actions/upload-artifact@v7
      with:
        name: web-dist
        path: dist/

deploy-demo:
  needs: build
  runs-on: ubuntu-latest

  steps:
    - name: Download build output
      uses: actions/download-artifact@v7
      with:
        name: web-dist
        path: ./dist

    - name: Inspect build output
      run: |
        ls -R dist
        cat dist/index.html

    - name: Deploy
      run: echo "Deploying application"
```

---

## Questions

Be prepared to answer:

1. What does `needs: build` do?
2. What does `actions/upload-artifact@v7` do?
3. What does `actions/download-artifact@v7` do?
4. Why does `deploy-demo` need to download the artifact?
5. Why not simply run the build command again in `deploy-demo`?

---

## Key Takeaway

A useful distinction is:

> **`needs` controls execution order**

while:

> **artifacts move files between jobs**

The `build` job creates a known output:

```text
dist/index.html
```

That output is uploaded as:

```text
web-dist
```

The downstream job downloads that same artifact and works with the exact files that were already built.

This supports an important CI/CD principle:

> **Build once, then deploy the exact output that was built**

---

## Part 6 — Add Retention

Artifacts do not need to be stored forever.

Update the upload step:

```yaml
- name: Upload build output
  uses: actions/upload-artifact@v7
  with:
    name: web-dist
    path: dist/
    retention-days: 7
```

Commit and push the change.

### Question

What does:

```yaml
retention-days: 7
```

control?

---

## Challenge

Change the artifact name from:

```text
web-dist
```

to something else, such as:

```text
site-build
```

but change it only in the upload step.

Run the workflow.

### Questions

1. What happens in `deploy-demo`?
2. Why does it fail?
3. What do you need to change to fix it?

The upload and download steps must agree on the artifact name.
