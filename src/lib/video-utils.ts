
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

    // Rutube
    const rutubeRegex = /rutube\.ru\/video\/([a-f0-9]{32})\//;
    const rutubeMatch = url.match(rutubeRegex);
    if (rutubeMatch && rutubeMatch[1]) {
      // Rutube thumbnail URLs are not as straightforward.
      // A common pattern is https://pic.rutube.ru/video/XX/YY/XXYY...ZZ.jpg
      // where XX and YY are the first two pairs of characters from the video ID.
      const videoId = rutubeMatch[1];
      const part1 = videoId.substring(0, 2);
      const part2 = videoId.substring(2, 4);
      // This is a common pattern, but might not be 100% reliable.
      // A more robust solution would involve using Rutube's oEmbed API,
      // but that requires a client-side fetch which complicates things.
      return `https://pic.rutube.ru/video/${part1}/${part2}/${videoId}.jpg`;
    }

  } catch (error) {
    console.error("Error getting thumbnail from URL:", error);
    return null;
  }

  return null;
}
