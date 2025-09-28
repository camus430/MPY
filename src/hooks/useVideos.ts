import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { VideoWithCreator } from "@/types/database";

export const useVideos = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Écouter les changements en temps réel pour les vidéos
    const videosChannel = supabase
      .channel('videos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'videos'
        },
        () => {
          // Invalider le cache des vidéos quand il y a un changement
          queryClient.invalidateQueries({ queryKey: ["videos"] });
        }
      )
      .subscribe();

    // Écouter les changements en temps réel pour les créateurs
    const creatorsChannel = supabase
      .channel('creators-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'creators'
        },
        () => {
          // Invalider le cache des vidéos et créateurs quand il y a un changement
          queryClient.invalidateQueries({ queryKey: ["videos"] });
          queryClient.invalidateQueries({ queryKey: ["creators"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(videosChannel);
      supabase.removeChannel(creatorsChannel);
    };
  }, [queryClient]);

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
        console.error("Erreur lors du chargement des vidéos:", error);
        throw error;
      }

      console.log("Vidéos chargées:", data?.length || 0);
      return data as VideoWithCreator[];
    },
    staleTime: 0, // Toujours récupérer les données fraîches
    refetchOnWindowFocus: true, // Recharger quand la fenêtre reprend le focus
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