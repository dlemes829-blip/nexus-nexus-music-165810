import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export interface Track {
  trackId: number;
  trackName: string;
  artistName: string;
  albumName: string;
  artworkUrl100: string;
  artworkUrl60: string;
  previewUrl: string;
  trackTimeMillis: number;
  primaryGenreName: string;
  collectionName: string;
}

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  position: number;
  duration: number;
  isLoading: boolean;
  isShuffle: boolean;
  repeatMode: "off" | "all" | "one";
  favorites: Track[];
  recentlyPlayed: Track[];
}

interface PlayerContextType extends PlayerState {
  playTrack: (track: Track, queue?: Track[]) => Promise<void>;
  togglePlay: () => Promise<void>;
  skipNext: () => Promise<void>;
  skipPrev: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleFavorite: (track: Track) => void;
  isFavorite: (trackId: number) => boolean;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

const FAVORITES_KEY = "nexus_favorites";
const RECENTLY_PLAYED_KEY = "nexus_recently_played";

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");
  const [favorites, setFavorites] = useState<Track[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    });
    loadStoredData();
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  const loadStoredData = async () => {
    try {
      const [favData, recentData] = await Promise.all([
        AsyncStorage.getItem(FAVORITES_KEY),
        AsyncStorage.getItem(RECENTLY_PLAYED_KEY),
      ]);
      if (favData) setFavorites(JSON.parse(favData));
      if (recentData) setRecentlyPlayed(JSON.parse(recentData));
    } catch {}
  };

  const addToRecentlyPlayed = useCallback(async (track: Track) => {
    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((t) => t.trackId !== track.trackId);
      const updated = [track, ...filtered].slice(0, 30);
      AsyncStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const playTrack = useCallback(
    async (track: Track, newQueue?: Track[]) => {
      if (!track.previewUrl) return;
      setIsLoading(true);
      try {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }
        const { sound } = await Audio.Sound.createAsync(
          { uri: track.previewUrl },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded) {
              setPosition(status.positionMillis ?? 0);
              setDuration(status.durationMillis ?? 30000);
              setIsPlaying(status.isPlaying);
              if (status.didJustFinish) {
                handleTrackEnd();
              }
            }
          }
        );
        soundRef.current = sound;
        setCurrentTrack(track);
        if (newQueue) setQueue(newQueue);
        setIsPlaying(true);
        addToRecentlyPlayed(track);
      } catch (e) {
        console.error("Error playing track", e);
      } finally {
        setIsLoading(false);
      }
    },
    [addToRecentlyPlayed]
  );

  const handleTrackEnd = useCallback(() => {
    setQueue((q) => {
      setCurrentTrack((current) => {
        if (!current) return current;
        if (repeatMode === "one") {
          soundRef.current?.replayAsync();
          return current;
        }
        const idx = q.findIndex((t) => t.trackId === current.trackId);
        let nextIdx = idx + 1;
        if (isShuffle) {
          nextIdx = Math.floor(Math.random() * q.length);
        }
        if (nextIdx >= q.length) {
          if (repeatMode === "all") nextIdx = 0;
          else return current;
        }
        const nextTrack = q[nextIdx];
        if (nextTrack) {
          playTrack(nextTrack, q);
        }
        return current;
      });
      return q;
    });
  }, [repeatMode, isShuffle, playTrack]);

  const togglePlay = useCallback(async () => {
    if (!soundRef.current) return;
    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  }, [isPlaying]);

  const skipNext = useCallback(async () => {
    if (!currentTrack || queue.length === 0) return;
    const idx = queue.findIndex((t) => t.trackId === currentTrack.trackId);
    let nextIdx = isShuffle
      ? Math.floor(Math.random() * queue.length)
      : idx + 1;
    if (nextIdx >= queue.length) nextIdx = 0;
    await playTrack(queue[nextIdx], queue);
  }, [currentTrack, queue, isShuffle, playTrack]);

  const skipPrev = useCallback(async () => {
    if (!currentTrack || queue.length === 0) return;
    if (position > 3000) {
      await soundRef.current?.setPositionAsync(0);
      return;
    }
    const idx = queue.findIndex((t) => t.trackId === currentTrack.trackId);
    const prevIdx = idx <= 0 ? queue.length - 1 : idx - 1;
    await playTrack(queue[prevIdx], queue);
  }, [currentTrack, queue, position, playTrack]);

  const seekTo = useCallback(async (pos: number) => {
    await soundRef.current?.setPositionAsync(pos);
    setPosition(pos);
  }, []);

  const toggleShuffle = useCallback(() => setIsShuffle((v) => !v), []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((m) =>
      m === "off" ? "all" : m === "all" ? "one" : "off"
    );
  }, []);

  const toggleFavorite = useCallback((track: Track) => {
    setFavorites((prev) => {
      const exists = prev.some((t) => t.trackId === track.trackId);
      const updated = exists
        ? prev.filter((t) => t.trackId !== track.trackId)
        : [track, ...prev];
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isFavorite = useCallback(
    (trackId: number) => favorites.some((t) => t.trackId === trackId),
    [favorites]
  );

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        queue,
        isPlaying,
        position,
        duration,
        isLoading,
        isShuffle,
        repeatMode,
        favorites,
        recentlyPlayed,
        playTrack,
        togglePlay,
        skipNext,
        skipPrev,
        seekTo,
        toggleShuffle,
        toggleRepeat,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
