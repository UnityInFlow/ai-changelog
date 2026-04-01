import { Octokit } from "@octokit/rest";

interface ReleaseOptions {
  repo: string;
  tag: string;
  name: string;
  body: string;
  token: string;
}

export async function createGithubRelease(
  options: ReleaseOptions,
): Promise<string> {
  if (!options.token) {
    throw new Error(
      "GITHUB_TOKEN is required for publishing releases. Set it as an environment variable.",
    );
  }

  if (!options.repo || !options.repo.includes("/")) {
    throw new Error(
      'Invalid repo format. Expected "owner/repo" (e.g. "UnityInFlow/ai-changelog").',
    );
  }

  const octokit = new Octokit({ auth: options.token });
  const [owner, repo] = options.repo.split("/");

  const response = await octokit.repos.createRelease({
    owner,
    repo,
    tag_name: options.tag,
    name: options.name,
    body: options.body,
  });

  return response.data.html_url;
}
