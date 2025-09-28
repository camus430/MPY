import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import MediaUpload from '@/components/MediaUpload';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCreators } from '@/hooks/useVideos';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const AddMedia = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: creators = [] } = useCreators();
  const isMobile = useIsMobile();
  
  const [uploadedFile, setUploadedFile] = useState<{
    title: string;
    file_url: string;
    file_type: 'video' | 'audio';
    file_size: number;
    duration?: string;
  } | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    creator_id: '',
    thumbnail_url: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUploadComplete = (fileData: any) => {
    setUploadedFile(fileData);
    setFormData(prev => ({ ...prev, title: fileData.title }));
    toast.success('Fichier uploadé ! Remplissez maintenant les détails.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadedFile || !user) {
      toast.error('Veuillez uploader un fichier d\'abord');
      return;
    }

    if (!formData.title.trim() || !formData.creator_id) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);

    try {
      const videoData = {
        title: formData.title.trim(),
        thumbnail_url: formData.thumbnail_url || '/placeholder.svg',
        duration: uploadedFile.duration || '0:00',
        view_count: 0,
        creator_id: formData.creator_id,
        video_file_url: uploadedFile.file_type === 'video' ? uploadedFile.file_url : null,
        audio_file_url: uploadedFile.file_type === 'audio' ? uploadedFile.file_url : null,
        file_type: uploadedFile.file_type,
        file_size: uploadedFile.file_size
      };

      const { data, error } = await supabase
        .from('videos')
        .insert([videoData])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création:', error);
        toast.error('Erreur lors de la création du média');
        return;
      }

      toast.success('Média ajouté avec succès !');
      navigate('/');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button onClick={() => navigate("/")} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>

        <div className={cn(
          "max-w-4xl mx-auto grid gap-6",
          isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
        )}>
          {/* Upload Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Ajouter un média
              </h1>
              <p className="text-muted-foreground">
                Uploadez vos fichiers vidéo ou audio pour une lecture optimisée en arrière-plan
              </p>
            </div>

            <MediaUpload onUploadComplete={handleUploadComplete} />

            {uploadedFile && (
              <Card className="p-4 bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <div>
                    <p className="text-sm font-medium">
                      Fichier {uploadedFile.file_type} uploadé
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(uploadedFile.file_size / (1024 * 1024)).toFixed(1)} MB • {uploadedFile.duration}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Form Section */}
          {uploadedFile && (
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Détails du média</h2>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Titre *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Titre de votre média"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Créateur *
                  </label>
                  <Select
                    value={formData.creator_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, creator_id: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un créateur" />
                    </SelectTrigger>
                    <SelectContent>
                      {creators.map((creator) => (
                        <SelectItem key={creator.id} value={creator.id}>
                          {creator.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description de votre média (optionnel)"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    URL de la miniature
                  </label>
                  <Input
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                    placeholder="https://exemple.com/image.jpg (optionnel)"
                    type="url"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Création en cours...' : 'Créer le média'}
                </Button>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddMedia;