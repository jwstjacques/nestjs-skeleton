import { Test, TestingModule } from "@nestjs/testing";
import { HttpStatus, INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "./../src/app.module";

describe("AppController (e2e)", () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /health", () => {
    it("should return health status", () => {
      return request(app.getHttpServer())
        .get("/health")
        .expect(HttpStatus.OK)
        .expect((res: request.Response) => {
          expect(res.body).toHaveProperty("status", "ok");
          expect(res.body).toHaveProperty("timestamp");
          expect(res.body).toHaveProperty("uptime");
          expect(res.body).toHaveProperty("environment");
          expect(res.body).toHaveProperty("database");
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(res.body.database).toHaveProperty("status");
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(res.body.database).toHaveProperty("latency");
        });
    });
  });

  describe("GET /stats", () => {
    it("should return application statistics", () => {
      return request(app.getHttpServer())
        .get("/stats")
        .expect(HttpStatus.OK)
        .expect((res: request.Response) => {
          expect(res.body).toHaveProperty("users");
          expect(res.body).toHaveProperty("tasks");
          expect(res.body).toHaveProperty("tasksByStatus");
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(typeof res.body.users).toBe("number");
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(typeof res.body.tasks).toBe("number");
        });
    });
  });
});
