import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

describe("design system metadata pipeline", () => {
  test.skip("generates metadata/components.json", () => {
    const result = spawnSync(
      "node",
      ["squads/design/scripts/design-system/generate_components_metadata.cjs"],
      {
        encoding: "utf8",
      },
    );

    expect(result.status).toBe(0);
    expect(
      existsSync("workspace/domains/design-system/metadata/components.json"),
    ).toBe(true);
  });

  test.skip("validates metadata/components.json", () => {
    const result = spawnSync(
      "node",
      ["squads/design/scripts/design-system/validate_components_metadata.cjs"],
      {
        encoding: "utf8",
      },
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("PASS: validated");
  });

  test.skip("validates MCP skeleton", () => {
    const result = spawnSync(
      "node",
      ["squads/design/scripts/design-system/validate_mcp_skeleton.cjs"],
      {
        encoding: "utf8",
      },
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("PASS: MCP skeleton");
  });

  test.skip("syncs design manifest from squad.yaml", () => {
    const result = spawnSync(
      "node",
      ["squads/design/scripts/design-system/sync_design_manifest.cjs"],
      {
        encoding: "utf8",
      },
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("PASS: synced");
  });

  test.skip("validates design manifest drift", () => {
    const result = spawnSync(
      "node",
      [
        "squads/design/scripts/design-system/validate_design_manifest_drift.cjs",
      ],
      {
        encoding: "utf8",
      },
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("PASS: design manifest is synchronized");
  });
});
