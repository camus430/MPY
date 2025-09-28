import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const creatorSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(100, "Le nom doit faire moins de 100 caractères"),
  avatar_url: z.string().url("L'URL de l'avatar doit être valide").optional().or(z.literal("")),
  description: z.string().max(500, "La description doit faire moins de 500 caractères").optional(),
  subscriber_count: z.number().min(0, "Le nombre d'abonnés doit être positif").optional(),
});

export type CreateCreatorData = z.infer<typeof creatorSchema>;

export interface CreateCreatorWithChannelData extends CreateCreatorData {
  youtube_channel_id?: string;
}

export const useCreateCreator = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateCreatorWithChannelData) => {
      // Validate data
      const validatedData = creatorSchema.parse(data);
      
      const { data: creator, error } = await supabase
        .from("creators")
        .insert({
          name: validatedData.name,
          avatar_url: validatedData.avatar_url || null,
          description: validatedData.description || null,
          subscriber_count: validatedData.subscriber_count || 0,
          youtube_channel_id: data.youtube_channel_id || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // If we have a youtube_channel_id, fetch and insert videos
      if (data.youtube_channel_id) {
        try {
          console.log('Fetching videos for channel:', data.youtube_channel_id);
          await supabase.functions.invoke('get-youtube-videos', {
            body: { 
              creator_id: creator.id, 
              channel_id: data.youtube_channel_id 
            }
          });
        } catch (videoError) {
          console.error('Error fetching videos:', videoError);
          // Don't fail the creator creation if video fetching fails
        }
      }

      return creator;
    },
    onSuccess: () => {
      // Invalidate and refetch creators and videos
      queryClient.invalidateQueries({ queryKey: ["creators"] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast({
        title: "Succès",
        description: "Le créateur et ses vidéos ont été ajoutés avec succès",
      });
    },
    onError: (error) => {
      console.error("Erreur lors de l'ajout du créateur:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le créateur",
        variant: "destructive",
      });
    },
  });
};