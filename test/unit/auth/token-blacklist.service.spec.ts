import { Test, TestingModule } from "@nestjs/testing";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { TokenBlacklistService } from "../../../src/auth/services/token-blacklist.service";

describe("TokenBlacklistService", () => {
  let service: TokenBlacklistService;
  const mockCacheManager = {
    set: jest.fn(),
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [TokenBlacklistService, { provide: CACHE_MANAGER, useValue: mockCacheManager }],
    }).compile();

    service = module.get<TokenBlacklistService>(TokenBlacklistService);
  });

  // ==========================================================================
  // revoke()
  // ==========================================================================

  describe("revoke()", () => {
    it("should store jti in cache with correct key and TTL", async () => {
      const jti = "abc-123";
      const ttl = 3600;

      await service.revoke(jti, ttl);

      expect(mockCacheManager.set).toHaveBeenCalledWith(`token:blacklist:${jti}`, "1", ttl);
    });

    it("should not throw when cache set fails", async () => {
      mockCacheManager.set.mockRejectedValueOnce(new Error("Redis down"));

      await expect(service.revoke("fail-jti", 600)).resolves.toBeUndefined();
    });

    it("should use correct key prefix", async () => {
      const jti = "prefix-check";

      await service.revoke(jti, 100);

      const calledKey = mockCacheManager.set.mock.calls[0][0] as string;

      expect(calledKey).toBe(`token:blacklist:${jti}`);
    });
  });

  // ==========================================================================
  // isRevoked()
  // ==========================================================================

  describe("isRevoked()", () => {
    it("should return true when token exists in cache", async () => {
      mockCacheManager.get.mockResolvedValueOnce("1");

      const result = await service.isRevoked("existing-jti");

      expect(result).toBe(true);
    });

    it("should return false when token does not exist in cache", async () => {
      mockCacheManager.get.mockResolvedValueOnce(null);

      const result = await service.isRevoked("missing-jti");

      expect(result).toBe(false);
    });

    it("should return false when cache get returns undefined", async () => {
      mockCacheManager.get.mockResolvedValueOnce(undefined);

      const result = await service.isRevoked("undefined-jti");

      expect(result).toBe(false);
    });

    it("should return false (fail open) when cache is unavailable", async () => {
      mockCacheManager.get.mockRejectedValueOnce(new Error("Redis down"));

      const result = await service.isRevoked("error-jti");

      expect(result).toBe(false);
    });

    it("should use correct key prefix for lookup", async () => {
      mockCacheManager.get.mockResolvedValueOnce(null);

      const jti = "lookup-check";

      await service.isRevoked(jti);

      expect(mockCacheManager.get).toHaveBeenCalledWith(`token:blacklist:${jti}`);
    });
  });

  // ==========================================================================
  // Integration pattern
  // ==========================================================================

  describe("round-trip", () => {
    it("should correctly round-trip revoke and check", async () => {
      const jti = "round-trip-jti";
      const ttl = 3600;

      await service.revoke(jti, ttl);

      expect(mockCacheManager.set).toHaveBeenCalledWith(`token:blacklist:${jti}`, "1", ttl);

      // Simulate the cache returning the stored value on subsequent lookup
      mockCacheManager.get.mockResolvedValueOnce("1");

      const revoked = await service.isRevoked(jti);

      expect(revoked).toBe(true);
      expect(mockCacheManager.get).toHaveBeenCalledWith(`token:blacklist:${jti}`);
    });
  });
});
