import { Module, Global } from "@nestjs/common";
import { CacheModule as NestCacheModule } from "@nestjs/cache-manager";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { redisStore } from "cache-manager-redis-yet";

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get<string>("cache.redis.host", "localhost"),
            port: configService.get<number>("cache.redis.port", 6379),
          },
          password: configService.get<string>("cache.redis.password"),
          database: configService.get<number>("cache.redis.db", 0),
          // Default TTL removed - use CacheTTL enum values per operation instead
          // Each cache operation specifies its own TTL based on data volatility
        }),
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
