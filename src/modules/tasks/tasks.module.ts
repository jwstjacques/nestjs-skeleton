import { Module } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { TasksController } from "./tasks.controller";
import { TasksV2Controller } from "./tasks-v2.controller";
import { TasksDal } from "./tasks.dal";

@Module({
  controllers: [TasksController, TasksV2Controller],
  providers: [TasksService, TasksDal],
  exports: [TasksService],
})
export class TasksModule {}
