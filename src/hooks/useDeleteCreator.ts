import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useDeleteCreator = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (creatorId: string) => {
      // Supprimer d'abord toutes les vidéos associées au créateur
      const { error: videosError } = await supabase
        .from('videos')
        .delete()
        .eq('creator_id', creatorId);

      if (videosError) {
        throw videosError;
      }

      // Ensuite supprimer le créateur
      const { error: creatorError } = await supabase
        .from('creators')
        .delete()
        .eq('id', creatorId);

      if (creatorError) {
        throw creatorError;
      }

      return creatorId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creators'] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast({
        title: "Succès",
        description: "Le créateur et ses vidéos ont été supprimés",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting creator:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le créateur",
        variant: "destructive",
      });
    },
  });
};
