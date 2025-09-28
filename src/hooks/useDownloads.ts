import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import type { VideoWithCreator } from "@/types/database";

export const useDownloads = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: downloads, isLoading } = useQuery({
    queryKey: ["downloads", user?.id],
    queryFn: async (): Promise<VideoWithCreator[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("downloads")
        .select(`
          video:videos(
            *,
            creator:creators(*)
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur lors du chargement des téléchargements:", error);
        throw error;
      }

      return data?.map(item => item.video).filter(Boolean) as VideoWithCreator[];
    },
    enabled: !!user?.id,
  });

  const addDownload = useMutation({
    mutationFn: async (videoId: string) => {
      if (!user?.id) throw new Error("Utilisateur non connecté");

      const { error } = await supabase
        .from("downloads")
        .insert({
          user_id: user.id,
          video_id: videoId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["downloads"] });
      toast.success("Vidéo ajoutée aux téléchargements");
    },
    onError: (error: any) => {
      if (error.code === "23505") {
        toast.info("Cette vidéo est déjà dans vos téléchargements");
      } else {
        toast.error("Erreur lors de l'ajout aux téléchargements");
        console.error("Erreur:", error);
      }
    },
  });

  const removeDownload = useMutation({
    mutationFn: async (videoId: string) => {
      if (!user?.id) throw new Error("Utilisateur non connecté");

      const { error } = await supabase
        .from("downloads")
        .delete()
        .eq("user_id", user.id)
        .eq("video_id", videoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["downloads"] });
      toast.success("Vidéo supprimée des téléchargements");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression");
      console.error("Erreur:", error);
    },
  });

  const isDownloaded = (videoId: string) => {
    return downloads?.some(video => video.id === videoId) || false;
  };

  return {
    downloads: downloads || [],
    isLoading,
    addDownload: addDownload.mutate,
    removeDownload: removeDownload.mutate,
    isDownloaded,
    isAddingDownload: addDownload.isPending,
    isRemovingDownload: removeDownload.isPending,
  };
};