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

  describe("GET /status", () => {
    describe("Success", () => {
      it("should return simple status check", () => {
        return request(app.getHttpServer())
          .get("/status")
          .expect(HttpStatus.OK)
          .expect((res: request.Response) => {
            expect(res.body).toHaveProperty("status", "ok");
            expect(res.body).toHaveProperty("timestamp");
            expect(res.body).toHaveProperty("uptime");
            expect(res.body).toHaveProperty("environment");
            expect(res.body).toHaveProperty("database");

            expect(res.body.database).toHaveProperty("status");

            expect(res.body.database).toHaveProperty("latency");
          });
      });
    });
  });
});
