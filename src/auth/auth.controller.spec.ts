import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";

describe("AuthController", () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe("Success", () => {
    it("should be defined", () => {
      expect(controller).toBeDefined();
    });
  });
});
