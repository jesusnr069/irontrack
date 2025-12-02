
// Utility to generate synthesized sounds using Web Audio API
// No external files required, works offline.

let audioCtx: AudioContext | null = null;

const getContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const playSound = (type: 'beep' | 'start' | 'finish' | 'record' | 'tick') => {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'tick':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.1);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;

      case 'beep': // Timer countdown
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;

      case 'start': // Timer start / Go
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.linearRampToValueAtTime(1760, now + 0.1);
        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;

      case 'finish': // Workout Complete
        // Simple arpeggio
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            
            osc2.type = 'triangle';
            osc2.frequency.value = freq;
            
            const time = now + (i * 0.1);
            gain2.gain.setValueAtTime(0.3, time);
            gain2.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
            
            osc2.start(time);
            osc2.stop(time + 0.4);
        });
        break;
        
      case 'record': // PR Celebration
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(880, now + 0.2);
        osc.frequency.linearRampToValueAtTime(440, now + 0.4);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.linearRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
        break;
    }

  } catch (e) {
    console.error("Audio play failed", e);
  }
};
