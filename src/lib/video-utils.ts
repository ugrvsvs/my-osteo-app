
export async function getThumbnailFromUrl(url: string): Promise<string | null> {
  if (!url) return null;

  try {
    // YouTube
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch && youtubeMatch[1]) {
      const videoId = youtubeMatch[1];
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }

  } catch (error) {
    console.error("Error getting thumbnail from URL:", error);
    return null;
  }

  return null;
}
