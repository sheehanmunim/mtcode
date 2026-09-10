import { afterEach, describe, expect, it, vi } from "@effect/vitest";

describe("mobile branding helpers", () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock("expo-constants");
  });

  it("defaults to T3 Code when branding extra is missing", async () => {
    vi.doMock("expo-constants", () => ({
      default: { expoConfig: { name: "T3 Code", extra: { appVariant: "production" } } },
    }));
    const branding = await import("./branding.ts");
    expect(branding.getProductName()).toBe("T3 Code");
    expect(branding.getConnectName()).toBe("T3 Connect");
    expect(branding.getAppScheme()).toBe("t3code");
  });

  it("reads the baked branding from expo extra", async () => {
    vi.doMock("expo-constants", () => ({
      default: {
        expoConfig: {
          name: "T3 Code Preview",
          extra: {
            branding: {
              productName: "T3 Code",
              connectProductName: "T3 Connect",
              scheme: "t3code",
              schemeDev: "t3code-dev",
              schemePreview: "t3code-preview",
            },
          },
        },
      },
    }));
    const branding = await import("./branding.ts");
    expect(branding.getMobileClientLabel()).toBe("T3 Code Mobile");
    expect(branding.getAppSchemeDev()).toBe("t3code-dev");
    expect(branding.getAppSchemePreview()).toBe("t3code-preview");
    expect(branding.getBrandMark()).toBe("T3");
    expect(branding.getBrandLabel()).toBe("Code");
  });
});
