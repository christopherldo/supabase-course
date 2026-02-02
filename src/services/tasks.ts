import supabase from "../lib/supabase-client";
import type { Task } from "../types/task";

export const createTask = async (task: Task) => {
  const { error, data } = await supabase
    .from("tasks")
    .insert(task)
    .select()
    .single();

  if (error) {
    console.error("Error adding task: ", error.message);
    return { error };
  }

  return { data };
};

export const readTasks = async () => {
  const { error, data } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error reading tasks: ", error.message);
    return { error };
  }

  return { data };
};

export const updateTask = async (data: Task) => {
  const { error, data: updatedData } = await supabase
    .from("tasks")
    .update({
      title: data.title,
      description: data.description,
      image_url: data.image_url,
    })
    .eq("id", data.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating task: ", error.message);
    return { error };
  }

  return { data: updatedData };
};

export const deleteTask = async (id?: string) => {
  if (!id) return { error: "No ID provided" };

  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) {
    console.error("Error deleting task: ", error.message);
    return { error };
  }

  return { error: null };
};
