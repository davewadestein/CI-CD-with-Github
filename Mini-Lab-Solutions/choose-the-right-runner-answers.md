# Choose the Right Runner — Answer Key

These are the recommended answers for the runner-selection mini-lab.

1. **Every pull request — run unit tests on each proposed change**
   - **Recommended:** GitHub-hosted runner
   - **Why:** This is the default case. The job needs a normal build/test environment and does not require private network access, special hardware, or a custom toolchain.

2. **Private network deploy — deploy to a server reachable only inside your VPN**
   - **Recommended:** Self-hosted runner
   - **Why:** The runner needs network access to infrastructure that a GitHub-hosted runner cannot normally reach.

3. **Licensed toolchain — build a native app that requires a licensed compiler**
   - **Recommended:** Self-hosted runner
   - **Why:** Your organization can install and manage the licensed software on infrastructure it controls.

4. **Local rehearsal — debug workflow syntax before pushing**
   - **Recommended:** Local execution/rehearsal
   - **Why:** Local tools can provide fast feedback while developing or debugging a workflow, although local execution is not identical to GitHub-hosted execution.

5. **Large organization — run hundreds of parallel jobs**
   - **Recommended:** Advanced runner strategy such as runner groups and scale sets / ARC
   - **Why:** At this scale, manually managing individual self-hosted runners becomes cumbersome. Runner groups help govern access, while scale sets / ARC can add and remove runner capacity dynamically.

## Completed deployment-job YAML

For the YAML portion of the mini-lab, one reasonable completion is:

```yaml
jobs:
  deploy:
    runs-on: [self-hosted, linux, prod-net]
    environment: production

    steps:
      - uses: actions/checkout@v4
      - run: ./deploy.sh
```

`runs-on` chooses **where the job executes**.

`environment: production` associates the job with the named GitHub Environment **production**, where deployment protections such as approvals or environment-specific secrets can be configured.
