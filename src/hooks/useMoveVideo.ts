import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MoveVideoParams {
  videoId: string;
  newCreatorId: string;
}

export const useMoveVideo = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ videoId, newCreatorId }: MoveVideoParams) => {
      const { error } = await supabase
        .from('videos')
        .update({ creator_id: newCreatorId })
        .eq('id', videoId);

      if (error) {
        throw error;
      }

      return { videoId, newCreatorId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast({
        title: "Succès",
        description: "La vidéo a été déplacée vers le nouveau créateur",
      });
    },
    onError: (error: any) => {
      console.error('Error moving video:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de déplacer la vidéo",
        variant: "destructive",
      });
    },
  });
};
