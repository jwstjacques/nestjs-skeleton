import { HttpStatusUtil, HttpStatusCategory } from "../../../../src/common/utils/http-status.util";

describe("HttpStatusUtil", () => {
  describe("getCategory", () => {
    it("should categorize 2xx codes as SUCCESS", () => {
      expect(HttpStatusUtil.getCategory(200)).toBe(HttpStatusCategory.SUCCESS);
      expect(HttpStatusUtil.getCategory(201)).toBe(HttpStatusCategory.SUCCESS);
      expect(HttpStatusUtil.getCategory(204)).toBe(HttpStatusCategory.SUCCESS);
      expect(HttpStatusUtil.getCategory(299)).toBe(HttpStatusCategory.SUCCESS);
    });

    it("should categorize 3xx codes as SUCCESS", () => {
      expect(HttpStatusUtil.getCategory(301)).toBe(HttpStatusCategory.SUCCESS);
      expect(HttpStatusUtil.getCategory(302)).toBe(HttpStatusCategory.SUCCESS);
      expect(HttpStatusUtil.getCategory(304)).toBe(HttpStatusCategory.SUCCESS);
    });

    it("should categorize 4xx codes as CLIENT_ERROR", () => {
      expect(HttpStatusUtil.getCategory(400)).toBe(HttpStatusCategory.CLIENT_ERROR);
      expect(HttpStatusUtil.getCategory(401)).toBe(HttpStatusCategory.CLIENT_ERROR);
      expect(HttpStatusUtil.getCategory(403)).toBe(HttpStatusCategory.CLIENT_ERROR);
      expect(HttpStatusUtil.getCategory(404)).toBe(HttpStatusCategory.CLIENT_ERROR);
      expect(HttpStatusUtil.getCategory(422)).toBe(HttpStatusCategory.CLIENT_ERROR);
      expect(HttpStatusUtil.getCategory(429)).toBe(HttpStatusCategory.CLIENT_ERROR);
      expect(HttpStatusUtil.getCategory(499)).toBe(HttpStatusCategory.CLIENT_ERROR);
    });

    it("should categorize 5xx codes as SERVER_ERROR", () => {
      expect(HttpStatusUtil.getCategory(500)).toBe(HttpStatusCategory.SERVER_ERROR);
      expect(HttpStatusUtil.getCategory(501)).toBe(HttpStatusCategory.SERVER_ERROR);
      expect(HttpStatusUtil.getCategory(502)).toBe(HttpStatusCategory.SERVER_ERROR);
      expect(HttpStatusUtil.getCategory(503)).toBe(HttpStatusCategory.SERVER_ERROR);
      expect(HttpStatusUtil.getCategory(599)).toBe(HttpStatusCategory.SERVER_ERROR);
    });
  });

  describe("getLogLevel", () => {
    it("should return 'log' for success status codes", () => {
      expect(HttpStatusUtil.getLogLevel(200)).toBe("log");
      expect(HttpStatusUtil.getLogLevel(201)).toBe("log");
      expect(HttpStatusUtil.getLogLevel(204)).toBe("log");
      expect(HttpStatusUtil.getLogLevel(301)).toBe("log");
    });

    it("should return 'warn' for client error status codes", () => {
      expect(HttpStatusUtil.getLogLevel(400)).toBe("warn");
      expect(HttpStatusUtil.getLogLevel(401)).toBe("warn");
      expect(HttpStatusUtil.getLogLevel(404)).toBe("warn");
      expect(HttpStatusUtil.getLogLevel(422)).toBe("warn");
      expect(HttpStatusUtil.getLogLevel(429)).toBe("warn");
    });

    it("should return 'error' for server error status codes", () => {
      expect(HttpStatusUtil.getLogLevel(500)).toBe("error");
      expect(HttpStatusUtil.getLogLevel(501)).toBe("error");
      expect(HttpStatusUtil.getLogLevel(502)).toBe("error");
      expect(HttpStatusUtil.getLogLevel(503)).toBe("error");
    });
  });

  describe("isServerError", () => {
    it("should return true for 5xx status codes", () => {
      expect(HttpStatusUtil.isServerError(500)).toBe(true);
      expect(HttpStatusUtil.isServerError(501)).toBe(true);
      expect(HttpStatusUtil.isServerError(502)).toBe(true);
      expect(HttpStatusUtil.isServerError(503)).toBe(true);
      expect(HttpStatusUtil.isServerError(599)).toBe(true);
    });

    it("should return false for non-5xx status codes", () => {
      expect(HttpStatusUtil.isServerError(200)).toBe(false);
      expect(HttpStatusUtil.isServerError(201)).toBe(false);
      expect(HttpStatusUtil.isServerError(400)).toBe(false);
      expect(HttpStatusUtil.isServerError(404)).toBe(false);
      expect(HttpStatusUtil.isServerError(499)).toBe(false);
    });
  });

  describe("isClientError", () => {
    it("should return true for 4xx status codes", () => {
      expect(HttpStatusUtil.isClientError(400)).toBe(true);
      expect(HttpStatusUtil.isClientError(401)).toBe(true);
      expect(HttpStatusUtil.isClientError(404)).toBe(true);
      expect(HttpStatusUtil.isClientError(422)).toBe(true);
      expect(HttpStatusUtil.isClientError(499)).toBe(true);
    });

    it("should return false for non-4xx status codes", () => {
      expect(HttpStatusUtil.isClientError(200)).toBe(false);
      expect(HttpStatusUtil.isClientError(201)).toBe(false);
      expect(HttpStatusUtil.isClientError(301)).toBe(false);
      expect(HttpStatusUtil.isClientError(500)).toBe(false);
      expect(HttpStatusUtil.isClientError(503)).toBe(false);
    });
  });

  describe("isSuccess", () => {
    it("should return true for 2xx and 3xx status codes", () => {
      expect(HttpStatusUtil.isSuccess(200)).toBe(true);
      expect(HttpStatusUtil.isSuccess(201)).toBe(true);
      expect(HttpStatusUtil.isSuccess(204)).toBe(true);
      expect(HttpStatusUtil.isSuccess(301)).toBe(true);
      expect(HttpStatusUtil.isSuccess(302)).toBe(true);
      expect(HttpStatusUtil.isSuccess(304)).toBe(true);
    });

    it("should return false for 4xx and 5xx status codes", () => {
      expect(HttpStatusUtil.isSuccess(400)).toBe(false);
      expect(HttpStatusUtil.isSuccess(404)).toBe(false);
      expect(HttpStatusUtil.isSuccess(500)).toBe(false);
      expect(HttpStatusUtil.isSuccess(503)).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle boundary values correctly", () => {
      // Boundary between success and client error
      expect(HttpStatusUtil.getCategory(399)).toBe(HttpStatusCategory.SUCCESS);
      expect(HttpStatusUtil.getCategory(400)).toBe(HttpStatusCategory.CLIENT_ERROR);

      // Boundary between client error and server error
      expect(HttpStatusUtil.getCategory(499)).toBe(HttpStatusCategory.CLIENT_ERROR);
      expect(HttpStatusUtil.getCategory(500)).toBe(HttpStatusCategory.SERVER_ERROR);
    });

    it("should handle unusual status codes consistently", () => {
      // Very low status code
      expect(HttpStatusUtil.getCategory(100)).toBe(HttpStatusCategory.SUCCESS);

      // Very high status code
      expect(HttpStatusUtil.getCategory(999)).toBe(HttpStatusCategory.SERVER_ERROR);
    });
  });
});
