export const formatViewCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M vues`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}K vues`;
  }
  return `${count} vues`;
};

export const formatSubscriberCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M abonnés`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}K abonnés`;
  }
  return `${count} abonnés`;
};

export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return "il y a 1 jour";
  } else if (diffDays < 7) {
    return `il y a ${diffDays} jours`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? "il y a 1 semaine" : `il y a ${weeks} semaines`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? "il y a 1 mois" : `il y a ${months} mois`;
  } else {
    const years = Math.floor(diffDays / 365);
    return years === 1 ? "il y a 1 an" : `il y a ${years} ans`;
  }
};