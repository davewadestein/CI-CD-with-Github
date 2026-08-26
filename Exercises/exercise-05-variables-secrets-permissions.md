# Exercise 5 — Variables, Secrets, and Permissions

## Goal

Add ordinary configuration, a GitHub Actions secret, and explicit job permissions to the workflow.

By the end of this exercise, you should be able to recognize and explain:

- repository variables
- repository secrets
- `${{ vars.NAME }}`
- `${{ secrets.NAME }}`
- `permissions`
- workflow-level vs. job-level permissions
- why different jobs should receive different levels of access

---

## Starting Point

Continue using the same repository and workflow file:

```text
.github/workflows/ci.yml
```

Your workflow from Exercise 4 should already contain jobs similar to:

```text
test → build → deploy-demo
```

The `build` job should create and upload an artifact, and the `deploy-demo` job should download that artifact.

For this exercise, you will add:

- one ordinary configuration value
- one harmless demo secret
- explicit `GITHUB_TOKEN` permissions

> Do not use any real passwords, cloud credentials, API keys, or production secrets in this exercise.

---

# Part 1 — Create a Repository Variable

In GitHub, open:

```text
Repository → Settings → Secrets and variables → Actions
```

Select the **Variables** tab and create a new repository variable:

```text
Name: DEPLOY_REGION
Value: us-east-2
```

This is ordinary configuration, not sensitive information.

---

## Part 2 — Create a Demo Secret

In the same area, select the **Secrets** tab and create a new repository secret:

```text
Name: DEMO_TOKEN
Value: super-secret-demo-12345
```

This value is only for the exercise.

Do not reuse a real token or password.

---

## Part 3 — Use the Variable in `deploy-demo`

Modify the `deploy-demo` job so it reads the repository variable:

```yaml
deploy-demo:
  needs: build
  runs-on: ubuntu-latest

  env:
    REGION: ${{ vars.DEPLOY_REGION }}

  steps:
    - name: Download build output
      uses: actions/download-artifact@v7
      with:
        name: web-dist
        path: ./dist

    - name: Show deployment configuration
      run: echo "Deploying to $REGION"

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
Show deployment configuration
```

You should see:

```text
Deploying to us-east-2
```

---

## Questions

1. Where is `DEPLOY_REGION` stored?
2. Is `DEPLOY_REGION` sensitive?
3. What does this expression do?

```yaml
${{ vars.DEPLOY_REGION }}
```

4. Why is a repository variable a better choice than a secret for ordinary configuration?

---

# Part 4 — Use the Secret Safely

Add a step to `deploy-demo`:

```yaml
- name: Verify deployment token
  env:
    TOKEN: ${{ secrets.DEMO_TOKEN }}
  run: |
    echo "A deployment token was provided"
    test -n "$TOKEN"
```

Commit and push the change.

Open the workflow run and inspect the step.

The step should confirm that a value was provided without printing the value itself.

---

## Important

Do not intentionally print secrets just to demonstrate masking.

For example, avoid:

```yaml
run: echo "$TOKEN"
```

A better practice is:

> **Do not print sensitive values in the first place**

---

## Questions

1. Where is `DEMO_TOKEN` stored?
2. What does this expression do?

```yaml
${{ secrets.DEMO_TOKEN }}
```

3. Why is the secret assigned only to the step that needs it?
4. Why is this safer than defining the secret for the entire workflow?

---

# Part 5 — Add Explicit GitHub Permissions

Add a workflow-level permission near the top of the workflow:

```yaml
permissions:
  contents: read
```

For example:

```yaml
name: CI

on:
  workflow_dispatch:

  push:
    branches:
      - main
    paths:
      - 'src/**'

permissions:
  contents: read
```

This gives the workflow's `GITHUB_TOKEN` a read-only default for repository contents.

Commit and push the change.

Confirm that the workflow still succeeds.

---

## What Does `permissions:` Control?

This:

```yaml
permissions:
  contents: read
```

controls what the automatically generated GitHub `GITHUB_TOKEN` is allowed to do.

It does **not** control operating-system permissions on the runner.

It also does **not** automatically control access to AWS, Azure, Google Cloud, or other external systems.

Those platforms have their own authentication and authorization systems.

---

# Part 6 — Give `build` Different Permissions

Suppose the `build` job eventually needs to publish a package or container image to a GitHub package registry.

Override the workflow-level permissions for that job:

```yaml
build:
  needs: test

  permissions:
    contents: read
    packages: write

  runs-on: ubuntu-latest
```

The `deploy-demo` job does not need the same GitHub package publishing authority.

You can leave it with:

```yaml
deploy-demo:
  needs: build

  permissions:
    contents: read

  runs-on: ubuntu-latest
```

Commit and push the change.

---

## Questions

1. Why does `build` receive:

```yaml
packages: write
```

while `deploy-demo` does not?

2. Why is it useful to give jobs different permissions?

3. What security principle does this demonstrate?

---

# Part 7 — Understand GitHub Permissions vs. Deployment Permissions

A common question is:

> If `deploy-demo` only has `contents: read`, how could it deploy anything?

The answer is that `permissions:` controls the GitHub `GITHUB_TOKEN`.

A real deployment platform would normally provide separate deployment authority.

For example:

```text
GitHub permissions
    ↓
What the job may do in GitHub

AWS IAM / Azure identity / cloud credentials
    ↓
What the job may do in the deployment platform
```

A real AWS deployment might use:

- an IAM role
- temporary credentials
- OIDC authentication

A real Azure deployment might use:

- a service principal
- workload identity federation

Those are separate from:

```yaml
permissions:
  contents: read
```

---

# Complete Example

Your workflow should now contain patterns similar to:

```yaml
name: CI

on:
  workflow_dispatch:

  push:
    branches:
      - main
    paths:
      - 'src/**'

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v7

      - name: Run tests
        run: echo "Tests passed"

  build:
    needs: test

    permissions:
      contents: read
      packages: write

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
          retention-days: 7

  deploy-demo:
    needs: build

    permissions:
      contents: read

    runs-on: ubuntu-latest

    env:
      REGION: ${{ vars.DEPLOY_REGION }}

    steps:
      - name: Download build output
        uses: actions/download-artifact@v7
        with:
          name: web-dist
          path: ./dist

      - name: Show deployment configuration
        run: echo "Deploying to $REGION"

      - name: Verify deployment token
        env:
          TOKEN: ${{ secrets.DEMO_TOKEN }}
        run: |
          echo "A deployment token was provided"
          test -n "$TOKEN"

      - name: Deploy
        run: echo "Deploying application"
```

---

# Key Takeaways

Use:

```yaml
${{ vars.NAME }}
```

for ordinary configuration.

Use:

```yaml
${{ secrets.NAME }}
```

for sensitive values.

Use:

```yaml
permissions:
```

to control what the workflow's GitHub token is allowed to do.

A good security principle is:

> **Give each job only the permissions and secrets it actually needs**

This is the principle of **least privilege**.

---

# Challenge

Move:

```yaml
REGION: ${{ vars.DEPLOY_REGION }}
```

from the job-level `env:` section into only the step that uses it.

Then run the workflow again.

### Questions

1. Does the workflow still work?
2. Which scope is narrower?
3. Which version better follows the principle of least privilege?
