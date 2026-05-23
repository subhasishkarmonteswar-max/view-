'use server';
/**
 * @fileOverview The Vibe Architect AI agent analyzes lyrical sentiment to suggest transition vibes and title themes for a music session.
 *
 * - hostVibeArchitect - A function that orchestrates the analysis of track lyrics to provide vibe and theme suggestions.
 * - HostVibeArchitectInput - The input type for the hostVibeArchitect function.
 * - HostVibeArchitectOutput - The return type for the hostVibeArchitect function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const HostVibeArchitectInputSchema = z.object({
  currentTrackVideoId: z
    .string()
    .describe('The YouTube Video ID of the currently playing track.'),
  upcomingTrackVideoIds: z
    .array(z.string())
    .describe('An array of YouTube Video IDs for the top upcoming tracks in the queue.'),
});
export type HostVibeArchitectInput = z.infer<typeof HostVibeArchitectInputSchema>;

const HostVibeArchitectOutputSchema = z.object({
  transitionVibes: z
    .array(z.string())
    .describe('Suggested transition vibes based on the lyrical sentiment of the tracks. E.g., ["Smooth Flow", "Energetic Build-up", "Chill Downtempo"].'),
  titleThemes: z
    .array(z.string())
    .describe('Suggested title themes for the current music session based on the lyrical sentiment of the tracks. E.g., ["Neon Dreams", "Melancholy Rhythms", "Uplifting Journey"].'),
});
export type HostVibeArchitectOutput = z.infer<typeof HostVibeArchitectOutputSchema>;

const getLyricsTool = ai.defineTool(
  {
    name: 'getLyrics',
    description: 'Fetches the lyrics for a given YouTube video ID.',
    inputSchema: z.object({
      videoId: z.string().describe('The YouTube Video ID of the track.'),
    }),
    outputSchema: z.string().describe('The lyrics of the song.'),
  },
  async (input) => {
    // In a real application, this would call an external API (e.g., Musixmatch, LyricsFind)
    // to fetch actual lyrics based on the video ID.
    console.log(`[Tool Call] Simulating lyric fetching for video ID: ${input.videoId}`);
    // Placeholder lyrics for demonstration. The LLM should still be able to infer sentiment.
    const placeholderLyrics = {
      'dQw4w9WgXcQ': "We're no strangers to love / You know the rules and so do I / A full commitment's what I'm thinking of / You wouldn't get this from any other guy",
      'xvFZjo5PgG0': "Oh, this is the rhythm of the night / The night, oh yeah / The rhythm of the night / Oh, yeah / The rhythm of the night",
      'eM213a2L4g0': "Imagine there's no heaven / It's easy if you try / No hell below us / Above us only sky",
      'y6120QOlsfU': "Sweet Caroline, good times never seemed so good / So good, so good, so good / I've been inclined to believe they never would / But now I, I look at the night and it don't seem so lonely",
      'OPf0YbXq6k0': "Is this the real life? / Is this just fantasy? / Caught in a landslide / No escape from reality",
    };
    // Provide varied placeholder lyrics for better sentiment analysis by the LLM
    return (
      placeholderLyrics[input.videoId as keyof typeof placeholderLyrics] ||
      `This is a placeholder for lyrics for video ID: ${input.videoId}. The song talks about ${input.videoId.length % 3 === 0 ? 'excitement and energy' : input.videoId.length % 3 === 1 ? 'calmness and introspection' : 'longing and mystery'}.`
    );
  }
);

const PromptInputSchema = z.object({
  currentTrack: z.object({
    videoId: z.string().describe('YouTube Video ID'),
    lyrics: z.string().describe('Lyrical content of the current track.'),
  }),
  upcomingTracks: z.array(
    z.object({
      videoId: z.string().describe('YouTube Video ID'),
      lyrics: z.string().describe('Lyrical content of an upcoming track.'),
    })
  ),
});

const hostVibeArchitectPrompt = ai.definePrompt({
  name: 'hostVibeArchitectPrompt',
  input: { schema: PromptInputSchema },
  output: { schema: HostVibeArchitectOutputSchema },
  prompt: `You are the "Vibe Architect" for an AuxCordocracy music session. Your task is to analyze the lyrical sentiment of the currently playing track and the top upcoming tracks in the queue. Based on this analysis, you will suggest creative and fitting "transition vibes" and "title themes" for the session.

Consider the overall mood, emotions, and common lyrical elements across all provided tracks.

### Currently Playing Track:
Video ID: {{{currentTrack.videoId}}}
Lyrics:
{{{currentTrack.lyrics}}}

### Upcoming Tracks in Queue:
{{#each upcomingTracks}}
---
Video ID: {{{videoId}}}
Lyrics:
{{{lyrics}}}
{{/each}}

Based on the lyrical sentiment and themes of these tracks, provide:
1.  Transition Vibes: Short, evocative phrases or words describing potential shifts in mood or theme between tracks.
2.  Title Themes: Overarching themes or names for the current music session.
`,
});

const hostVibeArchitectFlow = ai.defineFlow(
  {
    name: 'hostVibeArchitectFlow',
    inputSchema: HostVibeArchitectInputSchema,
    outputSchema: HostVibeArchitectOutputSchema,
  },
  async (input) => {
    const currentTrackLyrics = await getLyricsTool({ videoId: input.currentTrackVideoId });

    const upcomingTracksWithLyrics = await Promise.all(
      input.upcomingTrackVideoIds.map(async (videoId) => ({
        videoId,
        lyrics: await getLyricsTool({ videoId }),
      }))
    );

    const promptInput = {
      currentTrack: {
        videoId: input.currentTrackVideoId,
        lyrics: currentTrackLyrics,
      },
      upcomingTracks: upcomingTracksWithLyrics,
    };

    const { output } = await hostVibeArchitectPrompt(promptInput);
    return output!;
  }
);

export async function hostVibeArchitect(
  input: HostVibeArchitectInput
): Promise<HostVibeArchitectOutput> {
  return hostVibeArchitectFlow(input);
}
