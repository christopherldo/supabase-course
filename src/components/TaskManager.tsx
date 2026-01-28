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

  const handleRealtimeDelete = useCallback((oldTask: Task) => {
    setTasks((prev) => prev.filter((task) => task.id !== oldTask.id));
  }, []);

  const handleRealtimeUpdate = useCallback((newTask: Task) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === newTask.id ? newTask : task)),
    );
  }, []);

  const handleRealtimeInsert = useCallback((newTask: Task) => {
    setTasks((prev) => [...prev, newTask]);
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      const { error, data } = await readTasks();

      if (error) {
        console.error(error);
      } else if (data) {
        setTasks(data);
      }
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    const channel = supabase.channel("tasks-insert-channel");

    channel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        (payload) => {
          console.log(payload);

          const { new: newTask, old: oldTask, eventType } = payload;

          switch (eventType) {
            case "INSERT":
              handleRealtimeInsert(newTask as Task);
              break;
            case "DELETE":
              handleRealtimeDelete(oldTask as Task);
              break;
            case "UPDATE":
              handleRealtimeUpdate(newTask as Task);
              break;
          }
        },
      )
      .subscribe((status, err) => {
        console.log(status);

        if (err) console.error(err);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handleRealtimeInsert, handleRealtimeDelete, handleRealtimeUpdate]);

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

    await deleteTask(id);
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
