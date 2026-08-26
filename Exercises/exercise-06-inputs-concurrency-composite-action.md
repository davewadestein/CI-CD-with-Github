# Exercise 6 — Inputs, Concurrency, and Reusable Steps

## Goal

Add workflow controls and reuse to the CI/CD workflow you have built throughout the previous exercises.

By the end of this exercise, you should be able to recognize and explain:

- `workflow_dispatch` inputs
- `${{ inputs.NAME }}`
- concurrency groups
- `cancel-in-progress`
- local composite actions
- when a composite action is useful
- the difference between reusable steps and reusable workflows

This exercise continues from the same repository and workflow used in Exercises 1–5.

---

# Starting Point

Your repository should already contain:

```text
.github/workflows/ci.yml
```

and a pipeline similar to:

```text
test → build → deploy-demo
```

The workflow should also already demonstrate:

- automatic and manual triggers
- `needs`
- artifacts
- repository variables
- repository secrets
- explicit permissions

In this exercise, you will add three new capabilities:

```text
Manual input
Concurrency control
Reusable build logic
```

---

# Part 1 — Add a Manual Deployment Input

Update the existing `workflow_dispatch` trigger so that a person running the workflow manually can choose an environment.

Replace:

```yaml
workflow_dispatch:
```

with:

```yaml
workflow_dispatch:
  inputs:
    environment:
      description: Deployment environment
      required: true
      type: choice
      options:
        - staging
        - production
```

Your trigger section should now look similar to:

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: Deployment environment
        required: true
        type: choice
        options:
          - staging
          - production

  push:
    branches:
      - main
    paths:
      - 'src/**'
```

Commit and push the change.

---

## Part 2 — Run the Workflow Manually

Open:

```text
Repository → Actions → CI → Run workflow
```

You should now see a choice for:

```text
Deployment environment
```

Choose:

```text
staging
```

and run the workflow.

---

## Part 3 — Display the Selected Input

Add this step to `deploy-demo`:

```yaml
- name: Show selected environment
  run: echo "Selected environment is ${{ inputs.environment }}"
```

Run the workflow manually again.

You should see:

```text
Selected environment is staging
```

Try running it again and choose:

```text
production
```

---

## Questions

1. Who supplies the value for `${{ inputs.environment }}`?
2. When does the user see the choice?
3. Why is a choice input safer than asking someone to type any arbitrary value?
4. Can one workflow use the input value to decide whether it is deploying to staging or production?

---

# Important Observation

The input exists because the workflow was triggered manually with:

```yaml
workflow_dispatch
```

A push-triggered run does not have a person choosing an input.

If the same workflow also runs on `push`, think carefully about what should happen when no manual input was supplied.

For this exercise, we are using the input mainly to observe how manual workflow parameters work.

---

# Part 4 — Add Concurrency Control

Add this near the top of the workflow, at the same level as `on:` and `permissions:`:

```yaml
concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: true
```

For example:

```yaml
name: CI

on:
  workflow_dispatch:
    inputs:
      environment:
        description: Deployment environment
        required: true
        type: choice
        options:
          - staging
          - production

  push:
    branches:
      - main
    paths:
      - 'src/**'

permissions:
  contents: read

concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: true
```

Commit and push the change.

---

# Part 5 — Make the Workflow Slow Enough to Observe

Temporarily add this step near the beginning of `deploy-demo`:

```yaml
- name: Simulate deployment
  run: sleep 60
```

Now manually start the workflow twice in quick succession.

Watch the runs in the **Actions** tab.

---

## Observe

With:

```yaml
cancel-in-progress: true
```

a newer run in the same concurrency group can cancel an older in-progress run.

The group is:

```yaml
deploy-${{ github.ref }}
```

So runs associated with the same Git reference are grouped together.

---

## Questions

1. What happened to the earlier run?
2. Why might this behavior be useful for a test or staging deployment?
3. Would you always want to cancel an in-progress production deployment?
4. What does `${{ github.ref }}` contribute to the concurrency group?

---

# Part 6 — Remove the Temporary Delay

After observing concurrency behavior, remove:

```yaml
- name: Simulate deployment
  run: sleep 60
```

Commit and push the workflow again.

The delay was only there to make concurrency easy to observe.

---

# Part 7 — Create a Local Composite Action

Now move the build commands into a reusable local action.

Create this directory:

```text
.github/actions/prepare-build/
```

Inside it, create:

```text
action.yml
```

Your repository should now contain:

```text
.github/
├── actions/
│   └── prepare-build/
│       └── action.yml
└── workflows/
    └── ci.yml
```

---

# Part 8 — Define the Composite Action

Put this in:

```text
.github/actions/prepare-build/action.yml
```

```yaml
name: Prepare Build
description: Prepare the application build

runs:
  using: composite

  steps:
    - name: Create output directory
      shell: bash
      run: mkdir -p dist

    - name: Copy application
      shell: bash
      run: cp src/index.html dist/index.html
```

Commit the new file.

---

# Part 9 — Use the Composite Action

In the `build` job, find the commands that currently create the `dist` directory and copy the application.

You may currently have something similar to:

```yaml
- name: Build application
  run: |
    mkdir -p dist
    cp src/index.html dist/index.html
```

Replace that step with:

```yaml
- name: Prepare build
  uses: ./.github/actions/prepare-build
```

The `build` job should now look similar to:

```yaml
build:
  needs: test

  permissions:
    contents: read
    packages: write

  runs-on: ubuntu-latest

  steps:
    - uses: actions/checkout@v7

    - name: Prepare build
      uses: ./.github/actions/prepare-build

    - name: Upload build output
      uses: actions/upload-artifact@v7
      with:
        name: web-dist
        path: dist/
        retention-days: 7
```

Commit and push the change.

---

# Part 10 — Verify That the Workflow Still Works

Run the workflow, then inspect each job to confirm the pipeline still works end to end.

Confirm that:

- `test` succeeds
- `build` succeeds
- `web-dist` is uploaded
- `deploy-demo` downloads the artifact
- the deployment steps still run

Open the `build` job and inspect the steps from the composite action.

You should see the steps defined inside:

```text
.github/actions/prepare-build/action.yml
```

---

# Questions

1. Where is the reusable build logic now stored?
2. What does this line mean?

```yaml
uses: ./.github/actions/prepare-build
```

3. Why must the repository be checked out before using the local action?
4. What did we gain by moving the build commands into a composite action?

---

# Key Takeaway — Composite Actions

A composite action packages a group of steps into one reusable unit.

Instead of repeating:

```yaml
- run: mkdir -p dist

- run: cp src/index.html dist/index.html
```

a workflow can use:

```yaml
- uses: ./.github/actions/prepare-build
```

This makes repeated implementation easier to maintain.

A useful mental model is:

> **Composite action = reusable group of steps**

---

# Composite Action vs. Reusable Workflow

These are related, but they solve different problems.

## Composite Action

Use a composite action when you want to reuse:

```text
steps
```

For example:

```text
install dependencies
run a formatter
prepare a build
configure a tool
```

A workflow calls it from inside a job:

```yaml
steps:
  - uses: ./.github/actions/prepare-build
```

---

## Reusable Workflow

Use a reusable workflow when you want to reuse:

```text
jobs or an entire workflow structure
```

For example:

```text
test job
build job
security scan job
deployment pipeline
```

A reusable workflow is called at the job level rather than as a single step.

For this exercise, you only need to create the composite action.

---

# Complete Conceptual Picture

Your workflow now demonstrates:

```text
Trigger
  ↓
Input
  ↓
Test
  ↓
Build
  ↓
Composite action
  ↓
Artifact
  ↓
Deploy demo
  ↓
Concurrency control
```

Across Exercises 1–6, you have now used many of the core building blocks of GitHub Actions.

---

# Review Questions

Be prepared to explain:

1. What does `workflow_dispatch` provide?
2. What does `${{ inputs.environment }}` represent?
3. What problem does `concurrency` solve?
4. What does `cancel-in-progress: true` do?
5. What is `${{ github.ref }}`?
6. What is a composite action?
7. How is a composite action different from a reusable workflow?
8. Why do we still use `actions/checkout@v7` before calling a local composite action?

---

# Challenge

Add an input named:

```text
version
```

to `workflow_dispatch`.

Make it optional:

```yaml
version:
  description: Version to deploy
  required: false
  type: string
```

Then add a step:

```yaml
- name: Show requested version
  run: echo "Requested version is ${{ inputs.version }}"
```

Run the workflow manually and supply a value such as:

```text
v1.2.0
```

### Questions

1. Where does the value appear?
2. What happens if you leave the value blank?
3. How could a real deployment workflow use a version input?
