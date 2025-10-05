import { useState, useMemo } from 'react';
import { VideoWithCreator } from '@/types/database';

export const useSearch = (videos: VideoWithCreator[]) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVideos = useMemo(() => {
    if (!searchTerm.trim()) return videos;

    const normalizeString = (str: string) => 
      str.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // Remove accents

    const normalizedSearch = normalizeString(searchTerm);

    return videos.filter(video => {
      const normalizedTitle = normalizeString(video.title);
      const normalizedCreatorName = normalizeString(video.creator?.name || '');
      
      return normalizedTitle.includes(normalizedSearch) ||
             normalizedCreatorName.includes(normalizedSearch);
    });
  }, [videos, searchTerm]);

  const clearSearch = () => setSearchTerm('');

  return {
    searchTerm,
    setSearchTerm,
    filteredVideos,
    clearSearch,
    hasResults: filteredVideos.length > 0,
    isSearching: searchTerm.trim().length > 0
  };
};