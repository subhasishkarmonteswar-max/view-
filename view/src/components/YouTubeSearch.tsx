"use client";

import { useState } from "react";
import { youtubeSearch, YouTubeSearchOutput } from "@/ai/flows/youtube-search-flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Plus, Loader2, Music } from "lucide-react";
import Image from "next/image";

interface YouTubeSearchProps {
  onAddTrack: (videoId: string, title: string) => void;
}

export function YouTubeSearch({ onAddTrack }: YouTubeSearchProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<YouTubeSearchOutput['results']>([]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const output = await youtubeSearch({ query });
      setResults(output.results);
    } catch (error) {
      console.error("YouTube search error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-1">CONTRIBUTE</h2>
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">Inject audio into the consensus stream</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input 
          placeholder="Search for a track or artist..." 
          value={query}
          className="bg-muted/30 border-secondary/30 h-12"
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" variant="secondary" disabled={loading} className="h-12 px-6 font-black uppercase italic">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5 mr-1" />}
          Find
        </Button>
      </form>

      {results.length > 0 && (
        <div className="grid grid-cols-1 gap-2 animate-in fade-in slide-in-from-top-2 duration-300 max-h-[400px] overflow-y-auto pr-2">
          {results.map((track) => (
            <Card key={track.videoId} className="p-2 bg-card/40 border-secondary/10 hover:bg-secondary/5 transition-colors flex items-center justify-between group">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="relative w-16 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                  <Image 
                    src={track.thumbnail} 
                    alt={track.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-sm truncate uppercase italic tracking-tighter">{track.title}</p>
                  <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">{track.channelTitle}</p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => onAddTrack(track.videoId, track.title)}
                className="h-10 px-3 text-secondary hover:bg-secondary/20 font-black italic"
              >
                <Plus className="h-4 w-4 mr-1" /> ADD
              </Button>
            </Card>
          ))}
        </div>
      )}

      {results.length === 0 && !loading && query && (
        <div className="text-center py-6">
          <p className="text-muted-foreground text-sm italic">Search for something to see results.</p>
        </div>
      )}
    </div>
  );
}
