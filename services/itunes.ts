import { Track } from "@/context/PlayerContext";

const ITUNES_BASE = "https://itunes.apple.com";

export interface ITunesSearchResult {
  resultCount: number;
  results: ITunesTrack[];
}

interface ITunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  albumName: string;
  collectionName: string;
  artworkUrl100: string;
  artworkUrl60: string;
  previewUrl: string;
  trackTimeMillis: number;
  primaryGenreName: string;
  kind: string;
}

function mapToTrack(item: ITunesTrack): Track {
  return {
    trackId: item.trackId,
    trackName: item.trackName,
    artistName: item.artistName,
    albumName: item.collectionName ?? item.albumName ?? "",
    collectionName: item.collectionName ?? "",
    artworkUrl100: item.artworkUrl100?.replace("100x100", "300x300") ?? "",
    artworkUrl60: item.artworkUrl60 ?? "",
    previewUrl: item.previewUrl ?? "",
    trackTimeMillis: item.trackTimeMillis ?? 30000,
    primaryGenreName: item.primaryGenreName ?? "",
  };
}

export async function searchTracks(
  query: string,
  limit = 20
): Promise<Track[]> {
  const url = `${ITUNES_BASE}/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=${limit}&country=br`;
  const res = await fetch(url);
  const data: ITunesSearchResult = await res.json();
  return data.results
    .filter((r) => r.previewUrl && r.kind === "song")
    .map(mapToTrack);
}

export async function getTopCharts(
  genre: string = "",
  limit = 20
): Promise<Track[]> {
  const genreMap: Record<string, string> = {
    pop: "14",
    rock: "21",
    hiphop: "18",
    electronic: "7",
    rb: "15",
    latin: "12",
    country: "6",
    jazz: "11",
  };
  const genreId = genreMap[genre] || "";
  const genreParam = genreId ? `&genreId=${genreId}` : "";
  const url = `https://rss.applemarketingtools.com/api/v2/br/music/most-played/${limit}/songs.json${genreParam ? `?${genreParam}` : ""}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const feed = data?.feed?.results ?? [];
    const ids = feed
      .map((item: { id: string }) => item.id)
      .slice(0, limit)
      .join(",");
    if (!ids) return [];
    const lookupUrl = `${ITUNES_BASE}/lookup?id=${ids}&entity=song&country=br`;
    const lookupRes = await fetch(lookupUrl);
    const lookupData: ITunesSearchResult = await lookupRes.json();
    return lookupData.results
      .filter((r) => r.previewUrl && r.kind === "song")
      .map(mapToTrack);
  } catch {
    return searchTracks("top hits 2024", limit);
  }
}

export async function getArtistTopTracks(
  artistName: string,
  limit = 10
): Promise<Track[]> {
  return searchTracks(`${artistName}`, limit);
}

export async function getFeaturedPlaylists(): Promise<
  { title: string; genre: string; query: string }[]
> {
  return [
    { title: "Hot Hits", genre: "pop", query: "top hits 2024" },
    { title: "Hip-Hop Essentials", genre: "hiphop", query: "hip hop 2024" },
    { title: "Electronic Vibes", genre: "electronic", query: "electronic dance 2024" },
    { title: "R&B Soul", genre: "rb", query: "r&b soul 2024" },
    { title: "Rock Classics", genre: "rock", query: "rock classic hits" },
    { title: "Latin Fire", genre: "latin", query: "latin hits 2024" },
  ];
}
