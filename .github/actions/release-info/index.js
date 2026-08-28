const fs = require('fs');

const environment = process.env.INPUT_ENVIRONMENT || 'staging';
const repository = process.env.GITHUB_REPOSITORY || 'unknown/repository';
const refName = process.env.GITHUB_REF_NAME || 'unknown-ref';
const sha = process.env.GITHUB_SHA || 'unknown-sha';

const allowedEnvironments = ['staging', 'production'];

if (!allowedEnvironments.includes(environment)) {
  console.error(
    `Invalid environment "${environment}". Expected staging or production.`
  );
  process.exit(1);
}

const repoName = repository.split('/').pop();
const shortSha = sha.substring(0, 7);
const releaseId = `${repoName}-${environment}-${shortSha}`;

console.log(`Repository: ${repository}`);
console.log(`Ref: ${refName}`);
console.log(`Environment: ${environment}`);
console.log(`Short SHA: ${shortSha}`);
console.log(`Release ID: ${releaseId}`);

// GitHub Actions exposes the path of an output file through GITHUB_OUTPUT.
// Appending "name=value" lines makes those values available as step outputs.
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(
    process.env.GITHUB_OUTPUT,
    `release-id=${releaseId}\nshort-sha=${shortSha}\n`
  );
}

// Add a readable summary to the workflow run.
if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    [
      '## JavaScript Action Demo',
      '',
      `- Repository: \`${repository}\``,
      `- Ref: \`${refName}\``,
      `- Environment: \`${environment}\``,
      `- Release ID: \`${releaseId}\``,
      ''
    ].join('\n')
  );
}
