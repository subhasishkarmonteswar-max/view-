"use client";

import { useState, useEffect } from "react";
import { ref, onValue, push, runTransaction, update, get, remove } from "firebase/database";
import { database } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { 
  Radio, 
  Users, 
  ArrowLeft, 
  Music, 
  Plus, 
  ThumbsUp, 
  ThumbsDown, 
  Zap, 
  LayoutDashboard,
  LogOut,
  Headphones,
  ExternalLink,
  Search,
  CheckCircle2,
  Copy
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { YouTubeSearch } from "@/components/YouTubeSearch";
import { VibeArchitect } from "@/components/VibeArchitect";

export default function AuxCordocracy() {
  const [view, setView] = useState<'landing' | 'host_setup' | 'guest_setup' | 'host_dashboard' | 'guest_booth'>('landing');
  const [roomCode, setRoomCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [queue, setQueue] = useState<any[]>([]);
  const [manualUrl, setManualUrl] = useState("");

  // --- ACTIONS ---

  const handleCreateRoom = async () => {
    if (roomCode.length < 4) {
      toast({ title: "Invalid Code", description: "Use at least 4 digits for your room ID.", variant: "destructive" });
      return;
    }
    await update(ref(database, `rooms/${roomCode}`), { active: true, createdAt: Date.now() });
    setView('host_dashboard');
  };

  const handleJoinRoom = async () => {
    if (!roomCode || !nickname) {
      toast({ title: "Missing Info", description: "Please enter both a room code and nickname.", variant: "destructive" });
      return;
    }
    const roomSnap = await get(ref(database, `rooms/${roomCode}`));
    if (!roomSnap.exists()) {
      toast({ title: "Room Not Found", description: "This room doesn't exist yet. Ask the host to create it.", variant: "destructive" });
      return;
    }
    setView('guest_booth');
  };

  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const addTrackViaUrl = () => {
    const videoId = extractVideoId(manualUrl);
    if (!videoId) {
      toast({ title: "Invalid URL", description: "Please provide a valid YouTube link.", variant: "destructive" });
      return;
    }
    addTrackToQueue(videoId, `Track: ${videoId}`);
    setManualUrl("");
  };

  const addTrackToQueue = (videoId: string, title?: string) => {
    push(ref(database, `rooms/${roomCode}/queue`), {
      videoId: videoId,
      title: title || `Track ${videoId}`,
      score: 1,
      voteCount: 1,
      addedBy: nickname || 'Host',
      timestamp: Date.now()
    });
    toast({ title: "Track Added", description: "The link is now in the consensus pool." });
  };

  const handleVote = (songId: string, value: number) => {
    runTransaction(ref(database, `rooms/${roomCode}/queue/${songId}`), (song) => {
      if (song) {
        song.score = (song.score || 0) + value;
        song.voteCount = (song.voteCount || 0) + 1;
      }
      return song;
    });
  };

  const handleRemoveTrack = (songId: string) => {
    remove(ref(database, `rooms/${roomCode}/queue/${songId}`));
    toast({ title: "Track Advanced", description: "The consensus has moved to the next track." });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "URL copied to clipboard." });
  };

  // --- SYNC LOGIC ---

  useEffect(() => {
    if (view === 'host_dashboard' || view === 'guest_booth') {
      const queueRef = ref(database, `rooms/${roomCode}/queue`);
      const unsubscribe = onValue(queueRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          setQueue([]);
          return;
        }
        const list = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
        
        list.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return a.timestamp - b.timestamp;
        });
        
        setQueue(list);
      });
      return () => unsubscribe();
    }
  }, [view, roomCode]);

  // --- RENDERING ---

  return (
    <div className="min-h-screen flex flex-col font-body bg-background text-foreground">
      
      {/* LANDING */}
      {view === 'landing' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
          <div className="text-center mb-12 animate-in fade-in zoom-in duration-1000">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter neon-glow mb-2 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent text-center leading-none">
              AUXCORDOCRACY
            </h1>
            <p className="text-muted-foreground tracking-widest uppercase text-sm font-medium">
              Democratic Playlists • External Broadcast • Direct Links
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            <Card 
              className="group cursor-pointer border-primary/20 bg-card/40 backdrop-blur hover:bg-card/60 hover:border-primary transition-all duration-300 neon-border"
              onClick={() => setView('host_setup')}
            >
              <CardHeader className="text-center p-10">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Radio className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-3xl font-black italic">BROADCAST</CardTitle>
                <CardDescription className="text-muted-foreground text-base">Host the session and open the consensus links.</CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="group cursor-pointer border-secondary/20 bg-card/40 backdrop-blur hover:bg-card/60 hover:border-secondary transition-all duration-300 shadow-[0_0_15px_hsla(var(--secondary),0.1)]"
              onClick={() => setView('guest_setup')}
            >
              <CardHeader className="text-center p-10">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-secondary" />
                </div>
                <CardTitle className="text-3xl font-black italic">CONVENE</CardTitle>
                <CardDescription className="text-muted-foreground text-base">Join a booth to submit URLs and vote on the queue.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      )}

      {/* HOST SETUP */}
      {view === 'host_setup' && (
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md border-primary/30 bg-card/80 backdrop-blur">
            <CardHeader>
              <Button variant="ghost" size="sm" onClick={() => setView('landing')} className="w-fit -ml-2 mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <CardTitle className="text-3xl font-black">STATION CONFIG</CardTitle>
              <CardDescription>Enter a unique 4-digit code to initialize your station.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                placeholder="0000" 
                maxLength={4} 
                className="text-center text-4xl font-black tracking-widest h-16 border-primary/50"
                onChange={(e) => setRoomCode(e.target.value)}
              />
              <Button onClick={handleCreateRoom} className="w-full h-12 text-lg font-bold uppercase tracking-tighter" size="lg">
                <Zap className="mr-2 h-5 w-5 fill-current" /> Ignite Broadcast
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* GUEST SETUP */}
      {view === 'guest_setup' && (
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md border-secondary/30 bg-card/80 backdrop-blur">
            <CardHeader>
              <Button variant="ghost" size="sm" onClick={() => setView('landing')} className="w-fit -ml-2 mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <CardTitle className="text-3xl font-black">REMOTE AUTH</CardTitle>
              <CardDescription>Connect to a station using the host's 4-digit ID.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                placeholder="STATION ID" 
                className="text-center font-bold tracking-widest border-secondary/50"
                onChange={(e) => setRoomCode(e.target.value)}
              />
              <Input 
                placeholder="NICKNAME" 
                className="text-center font-bold border-secondary/50"
                onChange={(e) => setNickname(e.target.value)}
              />
              <Button onClick={handleJoinRoom} variant="secondary" className="w-full h-12 text-lg font-bold uppercase tracking-tighter" size="lg">
                <Headphones className="mr-2 h-5 w-5 fill-current" /> Enter Booth
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* HOST DASHBOARD */}
      {view === 'host_dashboard' && (
        <div className="flex-1 flex flex-col">
          <header className="border-b bg-card/50 backdrop-blur-md p-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Radio className="text-primary-foreground h-6 w-6" />
              </div>
              <div>
                <h1 className="font-black text-xl italic tracking-tighter leading-none text-left">STATION ID: {roomCode}</h1>
                <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase mt-1 text-left">Live Consensus Queue</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => window.location.reload()} className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4 mr-2" /> End Session
            </Button>
          </header>

          <main className="flex-1 p-6 max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {queue.length > 0 ? (
                <Card className="border-primary border-2 bg-primary/5 p-8 text-center space-y-6 neon-border animate-in fade-in slide-in-from-top-4 duration-700">
                  <div className="space-y-2">
                    <Badge className="bg-primary text-primary-foreground font-black italic tracking-widest animate-pulse">LIVE NOW</Badge>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter truncate">{queue[0].title}</h2>
                    <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest">Added by {queue[0].addedBy}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg border border-primary/20 overflow-hidden">
                      <p className="text-[10px] font-mono text-primary flex-1 truncate text-left">
                        https://www.youtube.com/watch?v={queue[0].videoId}
                      </p>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => copyToClipboard(`https://www.youtube.com/watch?v=${queue[0].videoId}`)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button 
                      size="lg" 
                      className="h-20 w-full text-2xl font-black italic tracking-tighter uppercase"
                      onClick={() => window.open(`https://www.youtube.com/watch?v=${queue[0].videoId}`, '_blank')}
                    >
                      <ExternalLink className="mr-3 h-8 w-8" /> OPEN IN YOUTUBE
                    </Button>

                    <Button 
                      variant="outline" 
                      className="w-full border-primary/40 hover:bg-primary/10 font-bold"
                      onClick={() => handleRemoveTrack(queue[0].id)}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" /> MARK AS FINISHED / NEXT TRACK
                    </Button>
                  </div>
                  
                  <p className="text-muted-foreground text-[10px] italic uppercase tracking-widest font-bold">
                    The top track is determined by community voting.
                  </p>
                </Card>
              ) : (
                <div className="text-center py-20 border-2 border-dashed border-muted rounded-2xl">
                  <Music className="w-16 h-16 text-muted mx-auto mb-4 opacity-30" />
                  <h2 className="text-2xl font-black text-muted uppercase">Waiting for consensus...</h2>
                  <p className="text-muted-foreground text-sm font-medium">Guests are adding tracks in Booth {roomCode}.</p>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="font-black italic text-xl flex items-center gap-2 uppercase">
                  <LayoutDashboard className="h-5 w-5 text-primary" /> Consensus Pool
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {queue.slice(1).map((song, i) => (
                    <Card key={song.id} className="p-4 bg-card/50 flex items-center justify-between border-border/50 group hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0 font-black text-xs group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                          {i + 2}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-sm truncate uppercase tracking-tight">{song.title}</p>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase">Score: {song.score} • Added by {song.addedBy}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="font-black italic uppercase tracking-tighter"
                        onClick={() => window.open(`https://www.youtube.com/watch?v=${song.videoId}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" /> Open
                      </Button>
                    </Card>
                  ))}
                  {queue.length <= 1 && (
                    <p className="text-center text-xs text-muted-foreground italic py-4">No tracks in the upcoming pool yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <VibeArchitect 
                currentVideoId={queue[0]?.videoId} 
                upcomingVideoIds={queue.slice(1, 4).map(s => s.videoId)} 
              />
              
              <Card className="p-4 bg-muted/20 border-dashed border-2">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" /> Guest View
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 text-[10px] space-y-2">
                  <p className="font-medium text-muted-foreground">Ask guests to visit this site and enter:</p>
                  <div className="bg-background p-2 rounded text-center font-black text-xl tracking-widest text-primary border border-primary/20">
                    {roomCode}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      )}

      {/* GUEST BOOTH */}
      {view === 'guest_booth' && (
        <div className="flex-1 flex flex-col">
          <header className="border-b bg-card/50 backdrop-blur-md p-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-secondary text-secondary">BOOTH {roomCode}</Badge>
              <h1 className="font-black italic tracking-tighter text-sm uppercase">{nickname}</h1>
            </div>
            <Button variant="ghost" size="sm" onClick={() => window.location.reload()} className="text-muted-foreground h-8 px-2">
              <LogOut className="h-4 w-4" />
            </Button>
          </header>

          <main className="flex-1 p-6 max-w-2xl mx-auto w-full space-y-10 animate-in fade-in duration-500">
            
            <section className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-1">CONTRIBUTE</h2>
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">Paste a link to influence the session</p>
              </div>

              <Card className="p-6 bg-card/60 backdrop-blur border-secondary/20 space-y-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder="https://www.youtube.com/watch?v=..." 
                    value={manualUrl}
                    className="bg-muted/30 border-secondary/30 h-12 font-medium"
                    onChange={(e) => setManualUrl(e.target.value)}
                  />
                  <Button onClick={addTrackViaUrl} variant="secondary" className="h-12 px-6 font-black uppercase italic">
                    <Plus className="h-5 w-5 mr-1" /> Add
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-px bg-muted flex-1" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">OR SEARCH</span>
                  <div className="h-px bg-muted flex-1" />
                </div>
                <YouTubeSearch onAddTrack={addTrackToQueue} />
              </Card>
            </section>

            <section className="space-y-4">
              <h3 className="font-black italic text-lg border-b pb-2 flex items-center gap-2 uppercase">
                <Zap className="h-5 w-5 text-secondary" /> Voting Arena
              </h3>
              
              <div className="space-y-3">
                {queue.length === 0 ? (
                  <div className="text-center py-20 bg-muted/10 rounded-xl border border-dashed">
                    <Music className="h-12 w-12 text-muted mx-auto mb-2 opacity-20" />
                    <p className="text-muted-foreground font-medium italic">Consensus pool is empty.</p>
                  </div>
                ) : (
                  queue.map((item, idx) => (
                    <Card key={item.id} className="p-4 bg-card/60 backdrop-blur border-secondary/10 flex items-center justify-between">
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 text-xs font-black text-secondary">
                          #{idx + 1}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-sm truncate uppercase italic tracking-tighter">{item.title}</p>
                          <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Score: {item.score}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleVote(item.id, 1)}
                          className="h-10 w-10 text-secondary hover:bg-secondary/20 rounded-full"
                        >
                          <ThumbsUp className="h-5 w-5" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleVote(item.id, -1)}
                          className="h-10 w-10 text-muted-foreground hover:bg-destructive/20 hover:text-destructive rounded-full"
                        >
                          <ThumbsDown className="h-5 w-5" />
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </section>
          </main>
        </div>
      )}
    </div>
  );
}
