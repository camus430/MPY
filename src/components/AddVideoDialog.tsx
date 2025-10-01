import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Video, Loader2, Youtube } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface AddVideoDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const AddVideoDialog = ({ open: externalOpen, onOpenChange }: AddVideoDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  
  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!youtubeUrl.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une URL YouTube",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Récupérer les données de la vidéo et du créateur
      console.log('Fetching video data from YouTube...');
      const { data, error } = await supabase.functions.invoke('get-youtube-video', {
        body: { url: youtubeUrl.trim() }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      console.log('Video data received:', data.video.title);
      console.log('Creator data received:', data.creator.name);

      // Vérifier si le créateur existe déjà
      const { data: existingCreator, error: creatorCheckError } = await supabase
        .from('creators')
        .select('id')
        .eq('youtube_channel_id', data.creator.youtube_channel_id)
        .maybeSingle();

      if (creatorCheckError) {
        throw creatorCheckError;
      }

      let creatorId: string;

      if (existingCreator) {
        // Le créateur existe déjà
        console.log('Creator already exists, using existing ID');
        creatorId = existingCreator.id;
      } else {
        // Créer le nouveau créateur
        console.log('Creating new creator:', data.creator.name);
        const { data: newCreator, error: createCreatorError } = await supabase
          .from('creators')
          .insert({
            name: data.creator.name,
            youtube_channel_id: data.creator.youtube_channel_id,
            avatar_url: data.creator.avatar_url,
            description: data.creator.description,
            subscriber_count: data.creator.subscriber_count,
          })
          .select()
          .single();

        if (createCreatorError) {
          throw createCreatorError;
        }

        creatorId = newCreator.id;
        console.log('New creator created with ID:', creatorId);
      }

      // Vérifier si la vidéo existe déjà
      const youtubeVideoId = youtubeUrl.match(/[?&]v=([^&]+)/)?.[1] || 
                             youtubeUrl.match(/youtu\.be\/([^?]+)/)?.[1];

      const { data: existingVideo, error: videoCheckError } = await supabase
        .from('videos')
        .select('id, title')
        .eq('creator_id', creatorId)
        .ilike('title', data.video.title)
        .maybeSingle();

      if (videoCheckError) {
        throw videoCheckError;
      }

      if (existingVideo) {
        toast({
          title: "Information",
          description: "Cette vidéo existe déjà dans votre collection",
        });
        handleOpenChange(false);
        setYoutubeUrl("");
        return;
      }

      // Ajouter la vidéo
      console.log('Adding video to database...');
      const { error: insertError } = await supabase
        .from('videos')
        .insert({
          creator_id: creatorId,
          title: data.video.title,
          thumbnail_url: data.video.thumbnail_url,
          duration: data.video.duration,
          view_count: data.video.view_count,
          file_type: 'youtube',
        });

      if (insertError) {
        throw insertError;
      }

      console.log('Video added successfully');

      // Rafraîchir les données
      await queryClient.invalidateQueries({ queryKey: ['videos'] });
      await queryClient.invalidateQueries({ queryKey: ['creators'] });

      toast({
        title: "Succès",
        description: `La vidéo "${data.video.title}" a été ajoutée avec succès!`,
      });

      handleOpenChange(false);
      setYoutubeUrl("");

    } catch (error: any) {
      console.error('Error adding video:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter la vidéo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      handleOpenChange(newOpen);
      if (!newOpen) setYoutubeUrl("");
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-blue-600" />
            Ajouter une vidéo YouTube
          </DialogTitle>
          <DialogDescription>
            Entrez l'URL d'une vidéo YouTube. Le créateur sera automatiquement ajouté s'il n'existe pas encore.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtube_video_url">URL de la vidéo YouTube *</Label>
              <Input
                id="youtube_video_url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... ou https://youtu.be/..."
                disabled={isLoading}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !youtubeUrl.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Ajouter la vidéo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddVideoDialog;
