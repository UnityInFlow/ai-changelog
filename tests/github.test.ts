import { describe, it, expect, vi } from "vitest";
import { createGithubRelease } from "../src/github.js";

// Mock @octokit/rest
const mockCreateRelease = vi.fn().mockResolvedValue({
  data: {
    html_url: "https://github.com/test/repo/releases/tag/v1.0.0",
  },
});

vi.mock("@octokit/rest", () => {
  return {
    Octokit: class MockOctokit {
      repos = { createRelease: mockCreateRelease };
    },
  };
});

describe("github", () => {
  it("creates a release and returns URL", async () => {
    const url = await createGithubRelease({
      repo: "test/repo",
      tag: "v1.0.0",
      name: "v1.0.0",
      body: "Release notes",
      token: "fake-token",
    });
    expect(url).toContain("github.com");
  });

  it("throws without token", async () => {
    await expect(
      createGithubRelease({
        repo: "test/repo",
        tag: "v1.0.0",
        name: "v1.0.0",
        body: "Notes",
        token: "",
      }),
    ).rejects.toThrow();
  });

  it("throws with missing repo format", async () => {
    await expect(
      createGithubRelease({
        repo: "",
        tag: "v1.0.0",
        name: "v1.0.0",
        body: "Notes",
        token: "fake-token",
      }),
    ).rejects.toThrow();
  });
});
