jest.mock("../config/env", () => {
  const actual = jest.requireActual("../config/env");
  return {
    config: {
      ...actual.config,
      corsOrigins: ["http://test-allowed.com"],
    },
  };
});

import request from "supertest";
import app from "../server";
import { config } from "../config/env";

describe("CORS Configuration", () => {
  it("should allow requests from allowed origins", async () => {
    const allowedOrigin = "http://test-allowed.com";

    const response = await request(app)
      .options("/api/health") // Preflight request
      .set("Origin", allowedOrigin);

    expect(response.headers["access-control-allow-origin"]).toBe(allowedOrigin);
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("should block requests from random unauthorized origins", async () => {
    const evilOrigin = "http://definitely-not-allowed.com";

    const response = await request(app)
      .options("/api/health")
      .set("Origin", evilOrigin);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("should block requests that attempt to use '*' directly as an origin", async () => {
    const response = await request(app)
      .options("/api/health")
      .set("Origin", "*");

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("should allow requests without an origin (server-to-server)", async () => {
    const response = await request(app).get("/api/health");

    // Server-to-server requests without an origin header should pass
    // and return standard healthy status
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("healthy");
  });
});
