import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("api parity", () => {
  it("exposes /stats", async () => {
    const app = createApp();
    const res = await request(app).get("/stats");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("algorithms");
    expect(res.body).toHaveProperty("metrics");
  });
});

