import { Module } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { TasksController } from "./tasks.controller";
import { TasksDal } from "./tasks.dal";

@Module({
  controllers: [TasksController],
  providers: [TasksService, TasksDal],
  exports: [TasksService],
})
export class TasksModule {}
