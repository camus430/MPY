import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { VideoWithCreator } from "@/types/database";

export const useVideos = () => {
  return useQuery({
    queryKey: ["videos"],
    queryFn: async (): Promise<VideoWithCreator[]> => {
      const { data, error } = await supabase
        .from("videos")
        .select(`
          *,
          creator:creators(*)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data as VideoWithCreator[];
    },
  });
};

export const useCreators = () => {
  return useQuery({
    queryKey: ["creators"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("creators")
        .select("*")
        .order("name");

      if (error) {
        throw error;
      }

      return data;
    },
  });
};