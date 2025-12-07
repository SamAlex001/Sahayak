let audioElement: HTMLAudioElement | null = null;

export const ensureAudio = () => {
  if (!audioElement) {
    audioElement = new Audio('/notify.mp3');
  }
  return audioElement;
};

export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    try { await Notification.requestPermission(); } catch {}
  }
};

export const triggerNotification = (title: string, body: string) => {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { 
        body,
        icon: '/favicon.ico',
        tag: 'sahayata-reminder',
        requireInteraction: true
      });
    }
  } catch {}
  
  // Enhanced sound alert with multiple beeps
  try {
    ensureAudio().play().catch(() => {
      // fallback: multiple beeps using Web Audio API for better attention
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create 3 beeps for better attention
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            o.frequency.value = 880 + (i * 100); // Different pitch for each beep
            o.connect(g);
            g.connect(ctx.destination);
            g.gain.setValueAtTime(0.001, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.01);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            o.start();
            o.stop(ctx.currentTime + 0.3);
          }, i * 400);
        }
      } catch {}
    });
  } catch {}
};


