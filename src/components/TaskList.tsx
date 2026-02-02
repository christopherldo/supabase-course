import type { Task } from "../types/task";

interface TaskListProps {
  tasks: Task[];
  handleClickOnEditTask: (task: Task) => void;
  handleClickOnDeleteTask: (id?: string) => Promise<void>;
}

export const TaskList = ({
  tasks,
  handleClickOnEditTask,
  handleClickOnDeleteTask,
}: TaskListProps) => {
  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {tasks.map((task) => (
        <li
          style={{
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "1rem",
            marginBottom: "0.5rem",
          }}
          key={task.id}
        >
          <div>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            {task.image_url && (
              <img
                src={task.image_url}
                alt={task.title}
                style={{ height: 70 }}
              />
            )}
            <div>
              <button
                style={{ padding: "0.5rem 1rem", marginRight: "0.5rem" }}
                onClick={() => handleClickOnEditTask(task)}
              >
                Edit
              </button>
              <button
                style={{ padding: "0.5rem 1rem" }}
                onClick={() => handleClickOnDeleteTask(task.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};
