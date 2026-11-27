const handler = vi.fn(() => new Response("auth ran"));
vi.mock("@/auth", () => ({ auth: () => handler }));

afterEach(() => vi.unstubAllEnvs());

test("local preview never touches Auth.js, so no secret is needed", async () => {
  const { default: proxy } = await import("@/proxy");
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("DATA_SOURCE", "csv");
  vi.stubEnv("AUTH_DEV_BYPASS", "1");
  await proxy({} as never, {} as never);
  expect(handler).not.toHaveBeenCalled();

  vi.stubEnv("NODE_ENV", "production");
  await proxy({} as never, {} as never);
  expect(handler).toHaveBeenCalledTimes(1);
});
