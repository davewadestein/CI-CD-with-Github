# Exercise 8 — Add a Safe Staging Deployment

## Goal

Turn the existing deployment demo into a more realistic staging deployment job without requiring a real production system.

By the end of this exercise, you should be able to recognize how these ideas work together:

- `needs`
- artifacts
- GitHub Environments
- explicit permissions
- repository variables
- build-once/deploy-the-same-output

This exercise continues from the same repository and workflow used in Exercises 1–7.

---

# Starting Point

Your workflow should already contain:

```text
test → build → deploy-demo
```

The `build` job should create and upload:

```text
web-dist
```

The deployment job should already download that artifact.

It should also already use the repository variable created earlier:

```yaml
env:
  REGION: ${{ vars.DEPLOY_REGION }}
```

Keep that configuration in place.

In this exercise, you will make the deployment job look more like a staging deployment.

---

# Part 1 — Rename the Deployment Job

Rename:

```yaml
deploy-demo:
```

to:

```yaml
deploy-staging:
```

Keep:

```yaml
needs: build
```

This ensures the staging deployment waits for the build job and normally runs only after the build succeeds.

---

# Part 2 — Associate the Job with a GitHub Environment

Add:

```yaml
environment: staging
```

to the deployment job.

For example:

```yaml
deploy-staging:
  needs: build
  runs-on: ubuntu-latest
  environment: staging
```

Important:

> `environment: staging` associates the job with a named GitHub Environment. It does not itself tell GitHub which server or cloud service to deploy to.

---

# Part 3 — Keep Explicit Permissions

Your deployment job should already have:

```yaml
permissions:
  contents: read
```

Keep that in place.

For example:

```yaml
deploy-staging:
  needs: build
  runs-on: ubuntu-latest
  environment: staging

  permissions:
    contents: read
```

For this classroom deployment, the job does not need repository write access.

---

# Part 4 — Keep the Existing Deployment Configuration

Keep the repository-variable configuration you created earlier:

```yaml
env:
  REGION: ${{ vars.DEPLOY_REGION }}
```

For example:

```yaml
deploy-staging:
  needs: build
  runs-on: ubuntu-latest
  environment: staging

  permissions:
    contents: read

  env:
    REGION: ${{ vars.DEPLOY_REGION }}
```

This is ordinary configuration, not a secret.

The important point is that the workflow reads the deployment region from a repository variable rather than hard-coding the value in the workflow file.

---

# Part 5 — Download the Existing Build

Keep or add the artifact download step:

```yaml
- name: Download build
  uses: actions/download-artifact@v5
  with:
    name: web-dist
    path: ./dist
```

Do **not** rebuild the application in the deployment job.

The deployment job should use the exact output that the build job already produced.

---

# Part 6 — Simulate the Deployment

Replace the old deployment-demo step with:

```yaml
- name: Deploy to staging
  run: |
    echo "Deploying to staging"
    echo "Region: $REGION"
    ls -R dist
```

The job is still only simulating a deployment.

That is intentional.

The goal is to practice the workflow structure without requiring access to real infrastructure.

---

# Part 7 — Create the GitHub Environment

In the repository, open:

```text
Settings → Environments
```

Create an environment named:

```text
staging
```

You do not need to add production-style approval rules for this exercise.

The important point is to connect:

```yaml
environment: staging
```

with the named GitHub Environment in the repository.

---

# Completed Job Shape

Your deployment job should now look similar to:

```yaml
deploy-staging:
  needs: build
  runs-on: ubuntu-latest
  environment: staging

  permissions:
    contents: read

  env:
    REGION: ${{ vars.DEPLOY_REGION }}

  steps:
    - name: Download build
      uses: actions/download-artifact@v5
      with:
        name: web-dist
        path: ./dist

    - name: Deploy to staging
      run: |
        echo "Deploying to staging"
        echo "Region: $REGION"
        ls -R dist
```

---

# Part 8 — Run and Inspect

Run the workflow.

Confirm that:

- `build` succeeds
- `web-dist` is uploaded
- `deploy-staging` waits for `build`
- `deploy-staging` downloads `web-dist`
- the job is associated with the `staging` GitHub Environment
- the deployment step displays the repository-configured region
- the deployment step sees the files created by the build job

Open the workflow graph and inspect the job dependency.

---

# Questions

1. What does `needs: build` do?
2. What does `environment: staging` do?
3. Does `environment: staging` specify the actual deployment server?
4. Why does this job need only `contents: read`?
5. Where does the value of `REGION` come from?
6. Is `REGION` a secret? Why or why not?
7. Why does the deployment job download `web-dist` instead of rebuilding the application?
8. What might a production GitHub Environment add that this staging exercise does not?

---

# Key Takeaway

The most important deployment pattern in this exercise is:

```text
Build once
   ↓
Preserve the output
   ↓
Deploy that same output
```

A deployment job should not casually rebuild the application.

Using the same tested artifact makes the pipeline more predictable and traceable.

The deployment region is also kept as repository configuration:

```yaml
REGION: ${{ vars.DEPLOY_REGION }}
```

rather than being hard-coded in the workflow.

---

# Discussion

Suppose this were a real production deployment.

What might you add?

Possible examples include:

- required reviewers
- environment-specific secrets
- branch or tag restrictions
- stronger concurrency controls
- short-lived cloud credentials
- a real deployment action or script

You do not need to implement those features in this exercise.
