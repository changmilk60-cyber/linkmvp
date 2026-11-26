"use client";

import { useEffect, useRef, useState } from "react";
import type { VideoPlayMode } from "@/lib/sections";

type FullscreenCapable = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

/**
 * YouTube player for a sales page and for the admin preview — one component,
 * so what the owner previews is what visitors get.
 *
 * Click mode shows a poster with a play button in the middle and an expand
 * button in the corner. The YouTube player is only created when it is pressed,
 * which also lets it start with sound: the press is a user gesture, whereas a
 * page that autoplays on load must be muted. Autoplay mode keeps the earlier
 * behaviour (muted, starts on load).
 *
 * The box takes the clip's shape: 16:9 for landscape, 9:16 for a vertical
 * clip, capped so a tall one never grows taller than the screen.
 */
export default function VideoPlayer({
  videoId,
  title,
  orientation,
  playMode,
}: {
  videoId: string;
  title: string;
  orientation: "landscape" | "portrait";
  playMode: VideoPlayMode;
}) {
  const [playing, setPlaying] = useState(playMode === "autoplay");
  const [posterOk, setPosterOk] = useState(true);
  const wrap = useRef<HTMLDivElement>(null);
  const poster = useRef<HTMLImageElement>(null);

  // The poster is part of the server-rendered HTML, so it can fail before React
  // has attached onError, and that event is then never seen. Look again once
  // mounted: a finished load with no pixels means it failed.
  useEffect(() => {
    const el = poster.current;
    if (el && el.complete && el.naturalWidth === 0) setPosterOk(false);
  }, []);

  function play() {
    setPlaying(true);
  }

  // Expands the whole player to the screen and starts it. The Fullscreen API
  // is not available on every browser for a plain element (iPhone Safari only
  // offers it for video), so where it is missing the press simply starts the
  // video and YouTube's own expand button takes over.
  function expand() {
    setPlaying(true);
    const el = wrap.current as FullscreenCapable | null;
    if (!el) return;
    try {
      const req = el.requestFullscreen?.bind(el) ?? el.webkitRequestFullscreen?.bind(el);
      const result = req?.();
      if (result && typeof (result as Promise<void>).catch === "function") (result as Promise<void>).catch(() => {});
    } catch {
      /* not allowed here; playback has already started */
    }
  }

  const src =
    `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0` +
    (playMode === "autoplay" ? "&mute=1" : "");

  return (
    <div ref={wrap} className="pv-video" data-orientation={orientation}>
      <div className="pv-video-box" style={{ aspectRatio: orientation === "portrait" ? "9 / 16" : "16 / 9" }}>
        {playing ? (
          <iframe
            src={src}
            title={title}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            {posterOk ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={poster}
                src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                alt=""
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={() => setPosterOk(false)}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : null}
            <button type="button" className="pv-video-play" onClick={play} aria-label={`เล่นวิดีโอ: ${title}`}>
              <span aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" /></svg>
              </span>
            </button>
            <button type="button" className="pv-video-full" onClick={expand} aria-label="ขยายเต็มจอ" title="ขยายเต็มจอ">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
