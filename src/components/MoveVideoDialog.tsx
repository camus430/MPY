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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRightLeft } from "lucide-react";
import { useMoveVideo } from "@/hooks/useMoveVideo";
import { useCreators } from "@/hooks/useVideos";
import type { VideoWithCreator } from "@/types/database";

interface MoveVideoDialogProps {
  video: VideoWithCreator | null;
}

const MoveVideoDialog = ({ video }: MoveVideoDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>("");
  const { data: creators = [] } = useCreators();
  const moveVideo = useMoveVideo();

  if (!video || !video.creator) return null;

  const handleMove = () => {
    if (!selectedCreatorId) return;
    
    moveVideo.mutate(
      { videoId: video.id, newCreatorId: selectedCreatorId },
      {
        onSuccess: () => {
          setOpen(false);
          setSelectedCreatorId("");
        },
      }
    );
  };

  // Filtrer les créateurs pour ne pas afficher le créateur actuel
  const availableCreators = creators.filter(c => c.id !== video.creator_id);

  if (availableCreators.length === 0) {
    return null; // Ne pas afficher le bouton s'il n'y a pas d'autres créateurs
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ArrowRightLeft className="h-4 w-4 mr-2" />
          Déplacer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Déplacer la vidéo</DialogTitle>
          <DialogDescription>
            Déplacer "{video.title}" vers un autre créateur
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Créateur actuel</label>
            <p className="text-sm text-muted-foreground">{video.creator.name}</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nouveau créateur</label>
            <Select value={selectedCreatorId} onValueChange={setSelectedCreatorId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un créateur" />
              </SelectTrigger>
              <SelectContent>
                {availableCreators.map((creator) => (
                  <SelectItem key={creator.id} value={creator.id}>
                    {creator.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={moveVideo.isPending}
          >
            Annuler
          </Button>
          <Button
            onClick={handleMove}
            disabled={!selectedCreatorId || moveVideo.isPending}
          >
            Déplacer la vidéo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MoveVideoDialog;
