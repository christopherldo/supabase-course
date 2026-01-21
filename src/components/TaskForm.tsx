import type { Task } from "../types/task";

interface TaskFormProps {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  setCurrentTask: (value: Task) => void;
  currentTask: Task;
  isEditingTask: boolean;
  handleClickOnCancelEditButton: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
}

export const TaskForm = ({
  handleSubmit,
  setCurrentTask,
  currentTask,
  isEditingTask,
  handleClickOnCancelEditButton,
}: TaskFormProps) => {
  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
      <input
        type="text"
        placeholder="Task Title"
        onChange={(e) =>
          setCurrentTask({ ...currentTask, title: e.target.value })
        }
        value={currentTask.title}
        style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
      />
      <textarea
        placeholder="Task Description"
        onChange={(e) =>
          setCurrentTask({ ...currentTask, description: e.target.value })
        }
        value={currentTask.description}
        style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
      />
      {isEditingTask && (
        <button
          type="reset"
          style={{ padding: "0.5rem 1rem", marginRight: "0.5rem" }}
          onClick={handleClickOnCancelEditButton}
        >
          Cancel
        </button>
      )}
      <button type="submit" style={{ padding: "0.5rem 1rem" }}>
        {isEditingTask ? "Save Task" : "Add Task"}
      </button>
    </form>
  );
};
