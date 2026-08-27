# CI/CD with GitHub — Mini-Lab YAML Solutions

These files are recommended answer keys for the slide mini-labs that require YAML changes or additions.

Some mini-labs are design exercises with more than one defensible answer; these files show one clear solution consistent with the course's teaching goals.

## Included

1. `01-choose-the-right-runner.yml`
2. `02-refactor-an-advanced-workflow.yml`
   - companion: `actions/prepare-release/action.yml`
3. `03-harden-a-release-workflow.yml`
4. `04-pass-build-output-to-deploy.yml`
5. `05-publish-then-deploy.yml`
6. `06-add-advanced-checks.yml`

## Notes

- These examples intentionally remain transitional rather than production-complete
- Deployment scripts, Dockerfiles, package configuration, and repository/environment settings must exist for the corresponding examples to run end-to-end
- `environment:` names a GitHub Environment; it does not itself identify or connect to the actual deployment server/cloud target