import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDeleteVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      const { error } = await supabase
        .from("videos")
        .delete()
        .eq("id", videoId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      // Invalider le cache des vidéos pour refraîchir la liste
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast.success("Vidéo supprimée avec succès");
    },
    onError: (error) => {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression de la vidéo");
    },
  });
};