// @ts-ignore
import KanbanColumnSkeleton from "@/components/skeleton/kanban";
import ProjectCardSkeleton from "@/components/skeleton/project-card";
import { KanbanAddCardButton } from "@/components/tasks/kanban/add-card-button";
import {
  KanbanBoard,
  KanbanBoardContainer,
} from "@/components/tasks/kanban/board";
import { ProjectCardMemo } from "@/components/tasks/kanban/card";
import KanbanColumn from "@/components/tasks/kanban/column";
import KanbanItem from "@/components/tasks/kanban/item";
import { UPDATE_TASK_MUTATION } from "@/graphql/mutations";
import { TASKS_QUERY, TASK_STAGES_QUERY } from "@/graphql/queries";
import { TaskStagesQuery, TasksQuery } from "@/graphql/types";
import { DragEndEvent } from "@dnd-kit/core";
import { useList, useNavigation, useUpdate } from "@refinedev/core";
import { GetFieldsFromList } from "@refinedev/nestjs-query";
import React from "react";

const TaskList = ({ children }: React.PropsWithChildren) => {
  const { data: stages, isLoading: stagesLoading } = useList<
    GetFieldsFromList<TaskStagesQuery>
  >({
    resource: "taskStages",
    filters: [
      {
        field: "title",
        operator: "in",
        value: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"],
      },
    ],
    sorters: [
      {
        field: "createdAt",
        order: "asc",
      },
    ],
    meta: {
      gqlQuery: TASK_STAGES_QUERY,
    },
  });

  const { mutate: updateTask } = useUpdate();

  const handleOnDragEnd = (event: DragEndEvent) => {
    let stageId = event.over?.id as string | undefined | null;
    const taskId = event.active.id;

    const taskStageId = event.active.data.current?.stageId;

    if (stageId === taskStageId) {
      return;
    }
    if (stageId === "unassigned") {
      stageId = null;
    }
    updateTask({
      resource: "tasks",
      id: taskId,
      values: {
        stageId,
      },
      successNotification: false,
      mutationMode: "optimistic",
      meta: {
        gqlQuery: UPDATE_TASK_MUTATION,
      },
    });
  };

  const { data: tasks, isLoading: tasksLoading } = useList<
    GetFieldsFromList<TasksQuery>
  >({
    resource: "tasks",
    sorters: [
      {
        field: "dueDate",
        order: "asc",
      },
    ],
    queryOptions: {
      enabled: !!stages,
    },
    pagination: { mode: "off" },
    meta: {
      gqlQuery: TASKS_QUERY,
    },
  });

  const taskStages = React.useMemo(() => {
    if (!tasks?.data || !stages?.data) {
      return {
        unassignedStage: [],
        stages: [],
      };
    }
    const unassignedStage = tasks.data.filter((task) => !task.stageId);
    const grouped = stages.data.map((stage) => ({
      ...stage,
      tasks: tasks.data.filter(
        (task) => task?.stageId?.toString() === stage.id
      ),
    }));
    return {
      unassignedStage,
      columns: grouped,
    };
  }, [stages, tasks]);

  const { replace } = useNavigation();
  const isLoading = stagesLoading || tasksLoading;
  if (isLoading) return <PageSkeleton />;
  const handleAddCard = ({ stageId }: { stageId: string }) => {
    const path =
      stageId === "unassigned" ? "/tasks/new" : `/tasks/new?stageId=${stageId}`;
    replace(path);
  };
  return (
    <>
      <KanbanBoardContainer>
        <KanbanBoard onDragEnd={handleOnDragEnd}>
          <KanbanColumn
            id="unassigned"
            title={"unassigned"}
            count={taskStages.unassignedStage.length || 0}
            onAddClick={() => handleAddCard({ stageId: "unassigned" })}
          >
            {taskStages.unassignedStage.map((task) => (
              <KanbanItem
                id={task.id}
                key={task.id}
                data={{ ...task, stageId: "unassigned" }}
              >
                <ProjectCardMemo
                  {...task}
                  dueDate={task.dueDate || undefined}
                />
              </KanbanItem>
            ))}
            {!taskStages.unassignedStage.length && (
              <KanbanAddCardButton
                onClick={() => handleAddCard({ stageId: "unassigned" })}
              />
            )}
          </KanbanColumn>
          {taskStages.columns?.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              count={column.tasks.length}
              onAddClick={() => handleAddCard({ stageId: column.id })}
            >
              {!isLoading &&
                column.tasks.map((task) => (
                  <KanbanItem
                    id={task.id}
                    key={task.id}
                    data={{ ...task, stageId: column.id }}
                  >
                    <ProjectCardMemo
                      {...task}
                      dueDate={task.dueDate || undefined}
                    />
                  </KanbanItem>
                ))}
              {!column.tasks.length && (
                <KanbanAddCardButton
                  onClick={() => handleAddCard({ stageId: column.id })}
                />
              )}
            </KanbanColumn>
          ))}
        </KanbanBoard>
      </KanbanBoardContainer>
      {children}
    </>
  );
};

export default TaskList;

const PageSkeleton = () => {
  const columnCount = 4;
  const itemCount = 4;

  return (
    <KanbanBoardContainer>
      {Array.from({ length: columnCount }).map((_, index) => (
        <KanbanColumnSkeleton key={index}>
          {Array.from({ length: itemCount }).map((_, index) => (
            <ProjectCardSkeleton key={index} />
          ))}
        </KanbanColumnSkeleton>
      ))}
    </KanbanBoardContainer>
  );
};
