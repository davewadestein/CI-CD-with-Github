# Exercise 1 — Create and Run Your First Workflow

## Goal

Create a simple GitHub Actions workflow, run it manually, and inspect what happened.

By the end of this exercise, you should be able to recognize and explain:

- `.github/workflows`
- `name`
- `on`
- `jobs`
- `runs-on`
- `steps`
- `run`
- `workflow_dispatch`
- `actions/checkout`

---

## Starting Repository

Your repository should contain at least:

```text
github-actions-lab/
├── src/
│   └── index.html
└── README.md
```

If your repository already contains additional files, that is fine.

---

## Part 1 — Create the Workflow File

In your repository, create this file:

```text
.github/workflows/ci.yml
```

Add the following YAML:

```yaml
name: CI

on:
  workflow_dispatch:

jobs:
  hello:
    runs-on: ubuntu-latest

    steps:
      - name: Show environment
        run: |
          echo "Hello from GitHub Actions"
          uname -a
          pwd
```

Commit and push the new workflow file to GitHub.

---

## Part 2 — Run the Workflow Manually

In GitHub:

1. Open your repository
2. Select the **Actions** tab
3. Select the **CI** workflow
4. Click **Run workflow**
5. Start the workflow
6. Open the workflow run after it begins
7. Open the `hello` job
8. Expand the **Show environment** step

Look at the output produced by:

```bash
echo "Hello from GitHub Actions"
uname -a
pwd
```

---

## Questions

Be prepared to answer:

1. What caused this workflow to run?
2. What type of runner executed the job?
3. Where can you see the output from the `echo` command?
4. What does a green check mark mean?

---

## Part 3 — Inspect the Runner

Add another step to the workflow:

```yaml
      - name: List files
        run: ls -la
```

Your `steps` section should now look like:

```yaml
steps:
  - name: Show environment
    run: |
      echo "Hello from GitHub Actions"
      uname -a
      pwd

  - name: List files
    run: ls -la
```

Commit and push the change, then run the workflow again.

Inspect the output from `ls -la`.

### Question

Do you see the files from your repository, such as `README.md` or `src/`?

---

## Part 4 — Check Out the Repository

A GitHub-hosted runner starts as a fresh environment. Your repository contents are not automatically placed on the runner.

Add this step **before** the other steps:

```yaml
      - uses: actions/checkout@v7
```

Your complete workflow should now look like:

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

Commit and push the change, then run the workflow again.

Inspect the output from **List files**.

### Question

What changed?

---

## Key Takeaway

A GitHub Actions job runs on a runner.

A GitHub-hosted runner starts as a fresh environment, so your repository files are not automatically present.

This step:

```yaml
- uses: actions/checkout@v4
```

checks out your repository onto the runner so later steps can work with your code and files.

---

## Challenge

Add one more step that displays the contents of `src/index.html`.

For example, use a shell command that reads the file and writes its contents to the workflow log.

Run the workflow again and confirm that your new step succeeds.
