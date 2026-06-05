const YOUTUBE_ID_RE =
  /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|user\/\S+|live\/))([\w-]{11})/;

export function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;
  return url.match(YOUTUBE_ID_RE)?.[1] || null;
}

export function getPropertyYoutubeVideoUrl(property) {
  if (!property) return null;
  const media = property.media || {};
  const url = media.youtubevideo || property.youtubevideo || media.youtube || property.youtube;
  return url && typeof url === 'string' ? url : null;
}

export function getPropertyYoutubeId(property) {
  return extractYouTubeId(getPropertyYoutubeVideoUrl(property));
}

export function isYouTubeShortUrl(url) {
  return typeof url === 'string' && /youtube\.com\/shorts\//i.test(url);
}

/** Minimal embed for card hover — hides controls; pair with CSS crop for title/chrome */
export function youtubeEmbedUrl(
  videoId,
  { autoplay = true, mute = true, chromeless = false } = {}
) {
  if (!videoId) return null;

  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    mute: mute ? '1' : '0',
    controls: '0',
    loop: '1',
    playlist: videoId,
    modestbranding: '1',
    playsinline: '1',
    rel: '0',
    fs: '0',
    iv_load_policy: '3',
    cc_load_policy: '0',
    disablekb: '1',
  });

  if (chromeless) {
    params.set('showinfo', '0');
    params.set('autohide', '1');
    if (typeof window !== 'undefined' && window.location?.origin) {
      params.set('origin', window.location.origin);
    }
  }

  const host = chromeless ? 'www.youtube-nocookie.com' : 'www.youtube.com';
  return `https://${host}/embed/${videoId}?${params.toString()}`;
}

/**
 * Centered cover-fit for card embed — crops edges evenly (not the top).
 * Landscape: widen iframe. Shorts: extend height.
 */
export function youtubeCardIframeStyle(isShort = false) {
  const base = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    maxWidth: 'none',
    transform: 'translate(-50%, -50%)',
    border: 0,
  };

  if (isShort) {
    return {
      ...base,
      width: '100%',
      height: '175%',
    };
  }

  return {
    ...base,
    width: '175%',
    height: '100%',
  };
}
