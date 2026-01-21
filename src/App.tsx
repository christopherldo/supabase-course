import "./App.css";

import { useEffect, useState } from "react";
import {
  createTask,
  deleteTask,
  readTasks,
  updateTask,
} from "./services/tasks";
import type { Task } from "./types/task";
import { TaskForm } from "./components/TaskForm";
import { TaskList } from "./components/TaskList";

function App() {
  const [currentTask, setCurrentTask] = useState<Omit<Task, "created_at">>({
    title: "",
    description: "",
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isEditingTask, setIsEditingTask] = useState(false);

  const fetchTasks = async () => {
    const { error, data } = await readTasks();

    if (error) {
      console.error(error);
    } else if (data) {
      setTasks(data);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let result;
    if (isEditingTask && currentTask.id) {
      result = await updateTask(currentTask as Task);
    } else {
      result = await createTask(currentTask as Task);
    }

    if (result && !result.error) {
      await fetchTasks();
      resetCurrentTask();
    }
  };

  const handleClickOnEditTask = (task: Task) => {
    setIsEditingTask(true);
    setCurrentTask(task);
  };

  const handleClickOnCancelEditButton = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
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
}

export default App;
