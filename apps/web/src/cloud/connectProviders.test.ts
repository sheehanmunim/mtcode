import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import {
  canEmbedClerkProvider,
  parseConnectProviders,
  providerHasRelay,
  readBakedConnectProviders,
  resolveDefaultConnectProviderId,
  resolveEmbeddedClerkProvider,
  selectEmbeddableConnectProviderId,
} from "./connectProviders.ts";

const t3 = {
  id: "t3" as const,
  label: "T3 Connect",
  clerkPublishableKey: "pk_live_t3",
  clerkJwtTemplate: "t3-relay",
  clerkCliOAuthClientId: "oauth",
  relayUrl: "https://relay.t3.codes",
  hostedAppUrl: "https://app.t3.codes",
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("parseConnectProviders", () => {
  it("returns an empty list for invalid JSON", () => {
    expect(parseConnectProviders("")).toEqual([]);
    expect(parseConnectProviders("{not json")).toEqual([]);
    expect(parseConnectProviders("{}")).toEqual([]);
  });

  it("keeps a well-formed T3 provider", () => {
    expect(parseConnectProviders(JSON.stringify([t3]))).toEqual([t3]);
  });

  it("drops a provider naming an identity this build no longer has", () => {
    const retired = { ...t3, id: "mt", label: "MT Connect" };
    expect(parseConnectProviders(JSON.stringify([retired, t3]))).toEqual([t3]);
  });
});

describe("canEmbedClerkProvider", () => {
  it("embeds T3 Connect only on Electron or app.t3.codes", () => {
    expect(canEmbedClerkProvider(t3, { origin: "https://example.test", isElectron: false })).toBe(
      false,
    );
    expect(canEmbedClerkProvider(t3, { origin: "https://app.t3.codes", isElectron: false })).toBe(
      true,
    );
    expect(canEmbedClerkProvider(t3, { origin: "https://example.test", isElectron: true })).toBe(
      true,
    );
  });
});

describe("readBakedConnectProviders", () => {
  it("returns the T3 provider from the baked provider list", () => {
    vi.stubEnv("VITE_CONNECT_PROVIDERS", JSON.stringify([t3]));
    expect(readBakedConnectProviders()).toEqual([t3]);
  });
});

describe("resolveDefaultConnectProviderId", () => {
  it("resolves the single baked T3 provider everywhere", () => {
    // Electron / relay-capable path.
    expect(resolveDefaultConnectProviderId([t3], { origin: "file://", isElectron: true })).toBe(
      "t3",
    );
    // Origins where T3 Clerk cannot embed still fall back to the only provider.
    expect(
      resolveDefaultConnectProviderId([t3], {
        origin: "https://example.test",
        isElectron: false,
      }),
    ).toBe("t3");
  });

  it("has nothing to resolve without a provider", () => {
    expect(resolveDefaultConnectProviderId([], { origin: "file://", isElectron: true })).toBeNull();
  });
});

describe("resolveEmbeddedClerkProvider", () => {
  it("mounts T3 where it can embed and nothing where it cannot", () => {
    expect(
      resolveEmbeddedClerkProvider([t3], "t3", { origin: "file://", isElectron: true }),
    ).toEqual(t3);
    expect(
      resolveEmbeddedClerkProvider([t3], "t3", {
        origin: "https://example.test",
        isElectron: false,
      }),
    ).toBeNull();
  });
});

describe("selectEmbeddableConnectProviderId", () => {
  it("rejects an identity Clerk cannot embed on this origin", () => {
    expect(
      selectEmbeddableConnectProviderId([t3], "t3", {
        origin: "https://example.test",
        isElectron: false,
      }),
    ).toBeNull();
    expect(
      selectEmbeddableConnectProviderId([t3], "t3", {
        origin: "file://",
        isElectron: true,
      }),
    ).toBe("t3");
  });
});

describe("providerHasRelay", () => {
  it("requires an https relay URL", () => {
    expect(providerHasRelay(t3)).toBe(true);
    expect(providerHasRelay({ ...t3, relayUrl: "" })).toBe(false);
    expect(providerHasRelay(null)).toBe(false);
  });
});
