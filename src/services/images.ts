import supabase from "../lib/supabase-client";

export const uploadImage = async (file: File) => {
  const filePath = `${file.name}-${Date.now()}`;

  const { error } = await supabase.storage
    .from("tasks-images")
    .upload(filePath, file);

  if (error) {
    console.error("Error uploading image: ", error.message);
    return;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("tasks-images").getPublicUrl(filePath);

  return publicUrl;
};
