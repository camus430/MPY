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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { useCreateCreator, type CreateCreatorData } from "@/hooks/useCreateCreator";

const CreateCreatorDialog = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateCreatorData>({
    name: "",
    avatar_url: "",
    description: "",
    subscriber_count: 0,
  });

  const createCreator = useCreateCreator();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createCreator.mutateAsync(formData);
      setOpen(false);
      setFormData({
        name: "",
        avatar_url: "",
        description: "",
        subscriber_count: 0,
      });
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const handleInputChange = (field: keyof CreateCreatorData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un créateur
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau créateur</DialogTitle>
          <DialogDescription>
            Remplissez les informations pour ajouter un nouveau créateur à la liste.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Nom du créateur"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="avatar_url">URL de l'avatar</Label>
            <Input
              id="avatar_url"
              type="url"
              value={formData.avatar_url}
              onChange={(e) => handleInputChange("avatar_url", e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subscriber_count">Nombre d'abonnés</Label>
            <Input
              id="subscriber_count"
              type="number"
              min="0"
              value={formData.subscriber_count}
              onChange={(e) => handleInputChange("subscriber_count", parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Description du créateur..."
              rows={3}
            />
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
            <Button type="submit" disabled={createCreator.isPending}>
              {createCreator.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Ajouter
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCreatorDialog;