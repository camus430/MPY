import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VideoWithCreator } from "@/types/database";

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
        throw new Error(`Erreur lors du chargement des vidéos: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};