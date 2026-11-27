const handler = vi.fn(() => new Response("auth ran"));
vi.mock("@/auth", () => ({ auth: () => handler }));

afterEach(() => vi.unstubAllEnvs());

test("with login off Auth.js never runs, so no secret is needed", async () => {
  const { default: proxy } = await import("@/proxy");
  vi.stubEnv("NODE_ENV", "production");
  await proxy({} as never, {} as never);
  expect(handler).not.toHaveBeenCalled();

  vi.stubEnv("REQUIRE_LOGIN", "1");
  await proxy({} as never, {} as never);
  expect(handler).toHaveBeenCalledTimes(1);
});
