import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, Volume2, VolumeX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Replay {
  id: string;
  script: string | null;
  duration_seconds: number;
  timestamp_jumps: any[];
}

interface ReplayModeProps {
  replay: Replay | null;
  missionTitle: string;
}

export function ReplayMode({ replay, missionTitle }: ReplayModeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const script = replay?.script || generateDefaultScript(missionTitle);
  const duration = replay?.duration_seconds || 30;

  useEffect(() => {
    return () => {
      if (speechRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(script);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = isMuted ? 0 : 1;
      
      utterance.onend = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      utterance.onboundary = () => {
        setCurrentTime((prev) => Math.min(prev + 1, duration));
      };

      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
    if (speechRef.current) {
      speechRef.current.volume = isMuted ? 1 : 0;
    }
  };

  const jumpToTimestamp = (seconds: number) => {
    setCurrentTime(seconds);
    // In a real implementation, this would seek the audio/content
  };

  if (!replay && !script) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>Replay is being generated...</p>
            <Skeleton className="h-4 w-3/4 mx-auto mt-4" />
            <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">30-Second Highlight Reel</h3>
          <div className="text-sm text-muted-foreground tabular-nums">
            {currentTime}s / {duration}s
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-primary transition-all duration-300"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          {/* Timestamp markers */}
          {(replay?.timestamp_jumps || []).map((jump: any, idx: number) => (
            <button
              key={idx}
              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary-foreground border-2 border-primary hover:scale-125 transition-transform"
              style={{ left: `${(jump.seconds / duration) * 100}%` }}
              onClick={() => jumpToTimestamp(jump.seconds)}
              title={jump.label}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleMute}>
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
          <Button size="lg" onClick={handlePlay} className="gap-2">
            {isPlaying ? (
              <>
                <Pause className="h-5 w-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Play
              </>
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => jumpToTimestamp(currentTime + 5)}>
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        {/* Script preview */}
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground italic leading-relaxed">
            {script}
          </p>
        </div>

        {/* Timestamp jumps */}
        {replay?.timestamp_jumps && replay.timestamp_jumps.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Key Moments</h4>
            <div className="flex flex-wrap gap-2">
              {replay.timestamp_jumps.map((jump: any, idx: number) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => jumpToTimestamp(jump.seconds)}
                  className="text-xs"
                >
                  {jump.label} ({jump.seconds}s)
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function generateDefaultScript(title: string): string {
  return `Welcome to the 30-second highlight of "${title}". This debate brought together multiple AI agents with diverse perspectives. Key points emerged around implementation challenges, equity considerations, and measurable outcomes. The discussion highlighted both opportunities and risks, with agents converging on actionable next steps. For the full debate, switch to Live Studio mode.`;
}
