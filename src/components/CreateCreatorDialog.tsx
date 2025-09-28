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
import { Plus, Loader2, Youtube } from "lucide-react";
import { useCreateCreator, type CreateCreatorWithChannelData } from "@/hooks/useCreateCreator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CreateCreatorDialogProps {
  variant?: "default" | "floating";
}

const CreateCreatorDialog = ({ variant = "default" }: CreateCreatorDialogProps) => {
  const [open, setOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isLoadingYoutube, setIsLoadingYoutube] = useState(false);
  const [creatorData, setCreatorData] = useState<CreateCreatorWithChannelData | null>(null);

  const createCreator = useCreateCreator();
  const { toast } = useToast();

  const fetchYouTubeData = async () => {
    if (!youtubeUrl.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une URL YouTube",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingYoutube(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('get-youtube-creator', {
        body: { url: youtubeUrl.trim() }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setCreatorData({
        name: data.name,
        avatar_url: data.avatar_url,
        description: data.description,
        subscriber_count: data.subscriber_count,
        youtube_channel_id: data.channel_id,
      });

      toast({
        title: "Succès",
        description: `Informations récupérées pour ${data.name}`,
      });

    } catch (error: any) {
      console.error('Error fetching YouTube data:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de récupérer les informations YouTube",
        variant: "destructive",
      });
    } finally {
      setIsLoadingYoutube(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!creatorData) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord récupérer les informations YouTube",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await createCreator.mutateAsync(creatorData);
      setOpen(false);
      setYoutubeUrl("");
      setCreatorData(null);
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const resetForm = () => {
    setYoutubeUrl("");
    setCreatorData(null);
  };

  const renderTriggerButton = () => {
    if (variant === "floating") {
      return (
        <Button 
          size="icon"
          className={cn(
            "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300",
            "bg-red-600 hover:bg-red-700 text-white border-0",
            "hover:scale-110 active:scale-95"
          )}
        >
          <Plus className="h-6 w-6" />
        </Button>
      );
    }
    
    return (
      <Button 
        size="lg" 
        className="gap-2 font-semibold px-8 py-4 text-base shadow-lg hover:shadow-xl transition-all bg-red-600 hover:bg-red-700 text-white border-0 rounded-lg"
      >
        <Plus className="h-5 w-5" />
        Ajouter un créateur
      </Button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        {renderTriggerButton()}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-600" />
            Ajouter un créateur YouTube
          </DialogTitle>
          <DialogDescription>
            Entrez l'URL d'une chaîne YouTube pour récupérer automatiquement les informations.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtube_url">URL de la chaîne YouTube *</Label>
              <div className="flex gap-2">
                <Input
                  id="youtube_url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/@nomducreateur ou https://youtube.com/channel/ID"
                  disabled={isLoadingYoutube}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={fetchYouTubeData}
                  disabled={isLoadingYoutube || !youtubeUrl.trim()}
                  variant="outline"
                >
                  {isLoadingYoutube ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Récupérer"
                  )}
                </Button>
              </div>
            </div>

            {creatorData && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={creatorData.avatar_url} 
                    alt={creatorData.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold">{creatorData.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {creatorData.subscriber_count.toLocaleString()} abonnés
                    </p>
                  </div>
                </div>
                {creatorData.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {creatorData.description}
                  </p>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createCreator.isPending}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={createCreator.isPending || !creatorData}
              className="bg-red-600 hover:bg-red-700"
            >
              {createCreator.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Ajouter le créateur
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCreatorDialog;