# CI/CD with GitHub — Glossary

This glossary covers the main terms used throughout the course.

## Git and GitHub Basics

### Repository
A project managed with Git.

A repository usually contains source code, configuration files, documentation, and version history.

### Commit
A saved snapshot of changes in a Git repository.

Each commit has a unique identifier.

### Branch
A named line of development in Git.

Common examples include:

```text
main
feature/login
bugfix/payment-error
```

### Pull Request
A request to merge changes from one branch into another.

Pull requests are also commonly used for:

- code review
- automated testing
- discussion
- approval
- policy enforcement

### Merge
The process of combining changes from one branch into another.

---

## CI/CD

### CI
**Continuous Integration**

The practice of automatically validating code changes as developers integrate them into a shared repository.

Typical CI activities include:

- running tests
- checking code quality
- performing security scans
- building the application

### CD
**Continuous Delivery** or **Continuous Deployment**

Both involve automating what happens after code has been built and tested.

**Continuous Delivery** usually means the software is kept ready for deployment, but a human may approve the final release.

**Continuous Deployment** usually means successful changes can be deployed automatically without a manual release step.

### Pipeline
A sequence of automated activities used to build, test, package, and deploy software.

In GitHub Actions, a pipeline is usually implemented as one or more workflows.

---

## GitHub Actions

### GitHub Actions
GitHub's automation platform.

It allows workflows to respond to repository events and perform tasks such as testing, building, scanning, packaging, and deployment.

### Workflow
An automated process defined in a YAML file under:

```text
.github/workflows/
```

A workflow contains one or more jobs.

### Workflow Run
One execution of a workflow.

For example, pushing a commit may trigger a new workflow run.

### Event
Something that can trigger a workflow.

Examples include:

```text
push
pull_request
workflow_dispatch
schedule
```

### Trigger
The event or condition that causes a workflow to run.

Triggers are defined under:

```yaml
on:
```

### `workflow_dispatch`
A GitHub Actions event that allows a workflow to be started manually.

It can also define user-supplied inputs.

Example:

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        type: choice
        options:
          - staging
          - production
```

### Job
A group of steps that execute on the same runner.

Example:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
```

### Step
One unit of work inside a job.

A step usually either:

- runs a command with `run:`
- invokes an action with `uses:`

Example:

```yaml
- name: Run tests
  run: pytest
```

### Action
A reusable unit of automation that can be called from a workflow step.

Example:

```yaml
- uses: actions/checkout@v7
```

Actions can be implemented in several ways, including:

- JavaScript
- Docker
- composite actions

### `uses:`
Tells GitHub Actions to invoke an action or reusable workflow.

Example:

```yaml
uses: actions/checkout@v7
```

### `run:`
Tells the runner to execute a shell command or script.

Example:

```yaml
run: pytest
```

---

## Runners

### Runner
The machine that executes a GitHub Actions job.

A runner can be:

- GitHub-hosted
- self-hosted

### GitHub-Hosted Runner
A temporary virtual machine provided and managed by GitHub.

Example:

```yaml
runs-on: ubuntu-latest
```

### Self-Hosted Runner
A machine provided and managed by your organization.

Self-hosted runners are useful when jobs need:

- access to internal networks
- specialized software
- licensed tools
- custom hardware
- more control over the execution environment

### `runs-on`
Specifies what kind of runner should execute a job.

Example:

```yaml
runs-on: ubuntu-latest
```

---

## Job Relationships

### `needs`
Specifies that one job depends on another.

Example:

```yaml
build:
  needs: test
```

This means `build` normally runs only after `test` succeeds.

### Dependency
A relationship in which one job, task, or component depends on another.

In a CI/CD pipeline, dependencies often control execution order.

---
## Retention

Retention controls how long the output from a particular workflow run remains available after that run finishes.

For example, run #101 produces:

- web-dist

...and keeps it for, say, 7 days.

So even if run #102 builds a brand new web-dist, the old artifact is still tied to run #101 for later inspection (within the 7 day window).

---

## Variables, Secrets, and Permissions

### Variable
A configuration value that is not considered sensitive.

Example uses:

- deployment region
- feature flag
- environment name

Repository variables can be referenced with:

```yaml
${{ vars.DEPLOY_REGION }}
```

### Secret
A sensitive value stored securely by GitHub.

Examples include:

- API tokens
- passwords
- credentials

Secrets are referenced with:

```yaml
${{ secrets.DEMO_TOKEN }}
```

### Environment Variable
A value made available to a process through its runtime environment.

In GitHub Actions:

```yaml
env:
  REGION: ${{ vars.DEPLOY_REGION }}
```

### Permission
Controls what the workflow's GitHub token is allowed to do.

Example:

```yaml
permissions:
  contents: read
```

### `GITHUB_TOKEN`
A temporary token automatically provided to GitHub Actions workflows.

Its capabilities are controlled using `permissions:`.

### Least Privilege
The security principle of granting only the permissions required to perform a task.

For example:

```yaml
permissions:
  contents: read
```

is preferable to giving a workflow unnecessary write access.

---

## GitHub Environments

### Environment
A named deployment context in GitHub.

Examples:

```text
staging
production
```

A GitHub Environment can have:

- required reviewers
- environment-specific secrets
- deployment restrictions
- protection rules

Example:

```yaml
environment: staging
```

This does **not** create a server or cloud environment.

It associates the job with GitHub's named `staging` Environment.

### Staging
A deployment environment used to test software before production.

### Production
The live environment used by real users.

---

## Artifacts, Caches, and Packages

### Artifact
A file or group of files produced during a workflow run and preserved for later use.

Examples include:

- compiled applications
- test reports
- logs
- deployment bundles

Example:

```yaml
- uses: actions/upload-artifact@v7
  with:
    name: web-dist
    path: dist/
```

### Cache
Saved data used to avoid repeating expensive work in later workflow runs.

Examples include:

- dependency downloads
- compiler caches
- generated intermediate files

The main purpose of a cache is **speed**.

### Artifact vs. Cache

A useful distinction:

```text
Cache
→ avoid repeating expensive work

Artifact
→ preserve and pass important output
```

### Package
A versioned software deliverable stored in a package registry.

Examples include:

- libraries
- container images
- application packages

Unlike a temporary workflow artifact, a package is usually intended for longer-term distribution or reuse.

---

## Build and Deployment

### Build
The process of turning source code into a deployable output.

Examples include:

- compiling code
- generating a web bundle
- creating a container image
- packaging application files

### Deploy
The process of making a built application available in a target environment.

### Build Once, Deploy Many
The practice of building an application once and deploying the same output to multiple environments.

For example:

```text
build
  ↓
artifact
  ↓
staging
  ↓
production
```

This helps ensure that production receives the same software that was tested earlier.

### Push Deployment
A deployment model in which the CI/CD system connects to the target environment and actively sends or applies the deployment.

Conceptually:

```text
GitHub Actions
      ↓
target environment
```

### Pull Deployment
A deployment model in which the CI/CD system updates desired state, and another system notices the change and performs the deployment.

Conceptually:

```text
GitHub Actions
      ↓
desired state in Git
      ↓
deployment controller
      ↓
target environment
```

This model is common in GitOps systems.

### Reconciliation
The process of continuously comparing actual system state with desired state and correcting differences.

In pull-based deployment systems, the runtime or controller often owns reconciliation.

---

## Workflow Reuse

### Composite Action
A reusable group of workflow steps packaged as a custom action.

Typically defined in:

```text
action.yml
```

A composite action is useful when you want to reuse a repeated task.

Example idea:

```text
prepare build
→ install tools
→ run checks
→ create output
```

### Reusable Workflow
A workflow designed to be called by another workflow.

It uses:

```yaml
on:
  workflow_call:
```

Reusable workflows are useful for sharing:

- jobs
- pipeline structure
- larger CI/CD patterns

### Composite Action vs. Reusable Workflow

A useful distinction:

```text
Composite action
→ reuse steps

Reusable workflow
→ reuse jobs or pipeline structure
```

---

## Docker and JavaScript Actions

### Docker Action
A GitHub Action that runs inside a Docker container.

Its metadata includes:

```yaml
runs:
  using: docker
```

Docker actions are useful when you want to package:

- tools
- runtime dependencies
- operating-system dependencies
- custom execution logic

into a controlled environment.

### Dockerfile
A file containing instructions for building a Docker image.

Example:

```dockerfile
FROM koalaman/shellcheck-alpine:stable
```

### Container Image
A packaged filesystem and runtime configuration used to start containers.

### Container
A running instance of a container image.

### JavaScript Action
A GitHub Action implemented in JavaScript and executed using Node.js.

Example metadata:

```yaml
runs:
  using: node24
  main: index.js
```

JavaScript actions are useful when reusable automation requires more logic than is convenient in shell commands.

### Action Input
A value supplied to an action using `with:`.

Example:

```yaml
with:
  environment: staging
```

### Action Output
A value generated by an action and made available to later workflow steps.

Example:

```yaml
${{ steps.release.outputs.release-id }}
```

---

## Concurrency

### Concurrency
A GitHub Actions feature used to control overlapping workflow runs or jobs.

Example:

```yaml
concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: true
```

### Concurrency Group
A name used to identify runs that should be treated as belonging to the same concurrency group.

### `cancel-in-progress`
When set to `true`, a newer run can cancel an older run in the same concurrency group.

This is often useful when only the newest deployment matters.

---

## Workflow Expressions and Context

### Expression
A value evaluated by GitHub Actions inside:

```text
${{ ... }}
```

Example:

```yaml
${{ github.ref }}
```

### Context
A collection of information made available to GitHub Actions expressions.

Examples include:

```text
github
inputs
vars
secrets
steps
runner
```

### `github.ref`
The Git reference associated with the workflow run.

It may refer to a branch or tag.

### `runner.os`
The operating system of the runner.

Example values include:

```text
Linux
Windows
macOS
```

### `hashFiles()`
A GitHub Actions expression function that calculates a hash based on one or more files.

It is commonly used when creating cache keys.

Example:

```yaml
${{ hashFiles('src/**') }}
```

---

## Security and Governance

### Policy
A rule controlling how workflows may operate.

Examples include:

- allowed actions
- required approvals
- branch protections
- deployment restrictions

### Allowed Actions
A GitHub policy that controls which actions and reusable workflows are permitted to run.

This can help reduce software supply-chain risk.

### Security Scan
An automated check for security issues.

Examples include:

- dependency vulnerabilities
- secret exposure
- source-code vulnerabilities
- container image vulnerabilities

### Dependency Scan
A scan that checks third-party dependencies for known vulnerabilities or policy violations.

### Secret Scan
A scan that looks for credentials or secrets accidentally committed to a repository.

### Static Analysis
Automated analysis of source code without executing the program.

Examples include:

- linting
- code-quality checks
- security analysis

ShellCheck is an example of static analysis for shell scripts.

---

## Scheduled and Manual Automation

### Scheduled Workflow
A workflow triggered using a cron schedule.

Example:

```yaml
on:
  schedule:
    - cron: '0 6 * * 1'
```

### Cron
A syntax used to describe recurring schedules.

### Manual Workflow
A workflow triggered by a user through `workflow_dispatch`.

---

## Useful Mental Model

A typical GitHub Actions workflow answers four questions:

```text
1. When should this run?
   → on:

2. Where should it run?
   → runs-on:

3. What work should happen?
   → jobs and steps

4. What may it access or change?
   → permissions, secrets, environments
```
