"use client";

import { useState } from "react";
import { hostVibeArchitect, HostVibeArchitectOutput } from "@/ai/flows/host-vibe-architect";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VibeArchitectProps {
  currentVideoId: string;
  upcomingVideoIds: string[];
}

export function VibeArchitect({ currentVideoId, upcomingVideoIds }: VibeArchitectProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HostVibeArchitectOutput | null>(null);

  const analyzeVibes = async () => {
    if (!currentVideoId) return;
    setLoading(true);
    try {
      const output = await hostVibeArchitect({
        currentTrackVideoId: currentVideoId,
        upcomingTrackVideoIds: upcomingVideoIds.slice(0, 3), // Analyze top 3
      });
      setResult(output);
    } catch (error) {
      console.error("Vibe Architect error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm neon-border overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
          <Sparkles className="h-4 w-4 animate-glow-pulse" />
          VIBE ARCHITECT
        </CardTitle>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={analyzeVibes} 
          disabled={loading || !currentVideoId}
          className="h-8 px-2 hover:bg-primary/10 hover:text-primary"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        {!result && !loading && (
          <p className="text-xs text-muted-foreground italic">
            Analyze the lyrical sentiment of current and upcoming tracks to define the session's soul.
          </p>
        )}
        {loading && (
          <div className="flex flex-col items-center justify-center py-4 space-y-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Architecting Vibe...</p>
          </div>
        )}
        {result && !loading && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Transition Vibez</p>
              <div className="flex flex-wrap gap-2">
                {result.transitionVibes.map((vibe, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                    {vibe}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Session Theme</p>
              <div className="space-y-1">
                {result.titleThemes.map((theme, idx) => (
                  <p key={idx} className="text-sm font-headline font-bold text-foreground">
                    #{theme}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
