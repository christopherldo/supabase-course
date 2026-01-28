import { useCallback, useEffect, useState } from "react";
import type { Task } from "../types/task";
import {
  createTask,
  deleteTask,
  readTasks,
  updateTask,
} from "../services/tasks";
import { TaskForm } from "./TaskForm";
import { TaskList } from "./TaskList";
import supabase from "../lib/supabase-client";

interface TaskManagerProps {
  userId: string;
}

export const TaskManager = ({ userId }: TaskManagerProps) => {
  const [currentTask, setCurrentTask] = useState<
    Omit<Task, "created_at" | "user_id">
  >({
    title: "",
    description: "",
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isEditingTask, setIsEditingTask] = useState(false);

  const fetchTasks = useCallback(async () => {
    const { error, data } = await readTasks();

    if (error) {
      console.error(error);
    } else if (data) {
      setTasks(data);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    const channel = supabase.channel("tasks-insert-channel");

    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tasks" },
        (payload) => {
          const data = payload.new as Task;

          setTasks((prev) => [...prev, data]);
        },
      )
      .subscribe((status, err) => {
        console.log(status);

        if (err) console.error(err);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let result;
    if (isEditingTask && currentTask.id) {
      result = await updateTask(currentTask as Task);
    } else {
      result = await createTask({
        ...currentTask,
        user_id: userId,
      } as Task);
    }

    if (result && !result.error) {
      resetCurrentTask();
    }
  };

  const handleClickOnEditTask = (task: Task) => {
    setIsEditingTask(true);
    setCurrentTask(task);
  };

  const handleClickOnCancelEditButton = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();

    setIsEditingTask(false);
    resetCurrentTask();
  };

  const handleClickOnDeleteTask = async (id?: string) => {
    if (!id) return;

    const { error } = await deleteTask(id);

    if (!error) {
      await fetchTasks();
    }
  };

  const resetCurrentTask = (task?: Task) => {
    if (!task) {
      setCurrentTask({ title: "", description: "" });
      return;
    }

    setCurrentTask(task);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1rem" }}>
      <h2>Task Manager CRUD</h2>

      <TaskForm
        currentTask={currentTask}
        handleClickOnCancelEditButton={handleClickOnCancelEditButton}
        handleSubmit={handleSubmit}
        isEditingTask={isEditingTask}
        setCurrentTask={setCurrentTask}
      />

      <TaskList
        handleClickOnDeleteTask={handleClickOnDeleteTask}
        handleClickOnEditTask={handleClickOnEditTask}
        tasks={tasks}
      />
    </div>
  );
};
