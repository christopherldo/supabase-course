import { useCallback, useEffect, useState, type ChangeEvent } from "react";
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
import { uploadImage } from "../services/images";

interface TaskManagerProps {
  userId: string;
}

export const TaskManager = ({ userId }: TaskManagerProps) => {
  const [currentTask, setCurrentTask] = useState<Task>({
    title: "",
    description: "",
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [taskImage, setTaskImage] = useState<File | null>(null);

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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setTaskImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let imageURL: string | undefined;

    if (taskImage) {
      imageURL = await uploadImage(taskImage);
    }

    let result;

    if (isEditingTask && currentTask.id) {
      result = await updateTask(currentTask);
    } else {
      result = await createTask({
        ...currentTask,
        user_id: userId,
        image_url: imageURL,
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
      setTaskImage(null);
      return;
    }

    setCurrentTask(task);
  };

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

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1rem" }}>
      <h2>Task Manager CRUD</h2>

      <TaskForm
        currentTask={currentTask}
        handleClickOnCancelEditButton={handleClickOnCancelEditButton}
        handleSubmit={handleSubmit}
        isEditingTask={isEditingTask}
        setCurrentTask={setCurrentTask}
        handleFileChange={handleFileChange}
      />

      <TaskList
        handleClickOnDeleteTask={handleClickOnDeleteTask}
        handleClickOnEditTask={handleClickOnEditTask}
        tasks={tasks}
      />
    </div>
  );
};
