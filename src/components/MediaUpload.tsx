import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Play, Music, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface MediaUploadProps {
  onUploadComplete?: (fileData: {
    title: string;
    file_url: string;
    file_type: 'video' | 'audio';
    file_size: number;
    duration?: string;
  }) => void;
}

const MediaUpload: React.FC<MediaUploadProps> = ({ onUploadComplete }) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const acceptedTypes = {
    video: 'video/mp4,video/webm,video/mov,video/avi',
    audio: 'audio/mp3,audio/wav,audio/ogg,audio/m4a,audio/aac'
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Vérifier le type de fichier
    const isVideo = selectedFile.type.startsWith('video/');
    const isAudio = selectedFile.type.startsWith('audio/');
    
    if (!isVideo && !isAudio) {
      toast.error('Veuillez sélectionner un fichier vidéo ou audio valide');
      return;
    }

    // Vérifier la taille (max 100MB)
    if (selectedFile.size > 100 * 1024 * 1024) {
      toast.error('Le fichier est trop volumineux (max 100MB)');
      return;
    }

    setFile(selectedFile);
    setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
    
    // Créer une URL de prévisualisation
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  const getDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const element = file.type.startsWith('video/') 
        ? document.createElement('video')
        : document.createElement('audio');
      
      element.src = URL.createObjectURL(file);
      
      element.onloadedmetadata = () => {
        resolve(element.duration || 0);
        URL.revokeObjectURL(element.src);
      };
      
      element.onerror = () => {
        resolve(0);
        URL.revokeObjectURL(element.src);
      };
    });
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUpload = async () => {
    if (!file || !user || !title.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Obtenir la durée du fichier
      const durationSeconds = await getDuration(file);
      const formattedDuration = formatDuration(durationSeconds);

      // Générer un nom de fichier unique
      const fileExtension = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media-files')
        .upload(filePath, file);

      // Simuler le progrès puisque onUploadProgress n'est pas disponible
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      if (uploadError) {
        clearInterval(progressInterval);
        console.error('Upload error:', uploadError);
        toast.error('Erreur lors de l\'upload du fichier');
        return;
      }

      clearInterval(progressInterval);
      setProgress(100);

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from('media-files')
        .getPublicUrl(filePath);

      const fileData = {
        title: title.trim(),
        file_url: urlData.publicUrl,
        file_type: file.type.startsWith('video/') ? 'video' as const : 'audio' as const,
        file_size: file.size,
        duration: formattedDuration
      };

      toast.success('Fichier uploadé avec succès !');
      onUploadComplete?.(fileData);

      // Reset du formulaire
      setFile(null);
      setTitle('');
      setPreviewUrl('');
      setProgress(0);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setTitle('');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Ajouter un fichier média</h3>
        <p className="text-sm text-muted-foreground">
          Upload vos fichiers vidéo ou audio pour une lecture en arrière-plan optimale
        </p>
      </div>

      {!file ? (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            Glissez-déposez ou cliquez pour sélectionner
          </p>
          <Input
            type="file"
            accept={`${acceptedTypes.video},${acceptedTypes.audio}`}
            onChange={handleFileSelect}
            className="hidden"
            id="media-upload"
          />
          <Button 
            variant="outline" 
            onClick={() => document.getElementById('media-upload')?.click()}
          >
            Choisir un fichier
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Formats supportés: MP4, WebM, MOV, MP3, WAV, OGG (max 100MB)
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Prévisualisation du fichier */}
          <div className="relative bg-muted rounded-lg p-4">
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={removeFile}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-3">
              {file.type.startsWith('video/') ? (
                <Video className="h-8 w-8 text-primary" />
              ) : (
                <Music className="h-8 w-8 text-primary" />
              )}
              <div className="flex-1">
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
            </div>

            {/* Prévisualisation vidéo/audio */}
            {previewUrl && (
              <div className="mt-3">
                {file.type.startsWith('video/') ? (
                  <video
                    src={previewUrl}
                    controls
                    className="w-full max-h-48 rounded"
                    preload="metadata"
                  />
                ) : (
                  <audio
                    src={previewUrl}
                    controls
                    className="w-full"
                    preload="metadata"
                  />
                )}
              </div>
            )}
          </div>

          {/* Titre */}
          <div>
            <label className="text-sm font-medium mb-2 block">Titre</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entrez le titre de votre média"
            />
          </div>

          {/* Barre de progression */}
          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                Upload en cours... {Math.round(progress)}%
              </p>
            </div>
          )}

          {/* Bouton d'upload */}
          <Button
            onClick={handleUpload}
            disabled={uploading || !title.trim()}
            className="w-full"
          >
            {uploading ? 'Upload en cours...' : 'Uploader le fichier'}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default MediaUpload;