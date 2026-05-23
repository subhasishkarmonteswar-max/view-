AuxCordocracy 🎧🔥
Stop the "Dictator DJ" and let the crowd vote on the music!

AuxCordocracy is a real-time, crowd-sourced music curation platform. It transforms the traditional "aux cord" experience—where one person controls the playlist—into a true democracy.

🚀 The Problem
In most parties and gatherings, one person dominates the music choice, often killing the vibe with tracks the crowd doesn't want to hear. This "musical dictatorship" ruins the atmosphere and ignores the guests' preferences.

💡 The Solution
AuxCordocracy lets guests vote for the music that plays.

Host: Sets up a "Station" on their laptop.

Guests: Join via a simple Room Code on their phones.

The Democratic Filter: Songs only play if they reach a 2-Vote Threshold. If a song is disliked, it stays in the queue or gets buried by better tracks.

🛠️ Tech Stack
Framework: Next.js

Backend: Firebase Realtime Database (for instant synchronization)

API: YouTube IFrame Player API

Deployment: Vercel (recommended)

📋 Features
Real-time Sync: Instant updates across all devices.

Democratic Voting: Upvote/Downvote system for tracks.

Auto-Play Logic: The system automatically picks the highest-voted song to play next.

Cyberpunk UI: Sleek, dark, and high-energy interface.

🚀 How to Run
Clone this repository.

Install dependencies: npm install

Add your firebaseConfig in src/app/page.tsx.

Set up your Firebase Realtime Database with public rules:

JSON
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
Run the dev server: npm run dev
