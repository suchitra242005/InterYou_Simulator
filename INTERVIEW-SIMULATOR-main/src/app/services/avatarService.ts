// AI Avatar Service - Frontend
// Uses Web Speech API for now, can upgrade to ElevenLabs later

export interface AvatarConfig {
  name: string;
  voice: string;
  rate: number;
  pitch: number;
}

export const avatarConfig: AvatarConfig = {
  name: "Mr. James",
  voice: "en-US-JennyNeural",
  rate: 0.9,
  pitch: 1
};

class AvatarServiceClass {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private isSpeaking: boolean = false;
  private onStartCallback?: () => void;
  private onEndCallback?: () => void;

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
    
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices() {
    this.voices = this.synth.getVoices() || [];
  }

  private getVoice(): SpeechSynthesisVoice | null {
    const naturalVoices = this.voices.filter(v => 
      v.lang.includes('en') && 
      (v.name.includes('Neural') || v.name.includes('Premium'))
    );
    
    if (naturalVoices.length > 0) {
      return naturalVoices[0];
    }
    
    return this.voices.find(v => v.lang.includes('en')) || null;
  }

  speak(text: string, onStart?: () => void, onEnd?: () => void): void {
    if (!this.synth) return;
    
    this.synth.cancel();

    this.onStartCallback = onStart;
    this.onEndCallback = onEnd;

    const utterance = new window.SpeechSynthesisUtterance(text);
    const voice = this.getVoice();
    
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.rate = avatarConfig.rate;
    utterance.pitch = avatarConfig.pitch;
    utterance.volume = 1;

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.onStartCallback?.();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.onEndCallback?.();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.onEndCallback?.();
    };

    this.synth.speak(utterance);
  }

  stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
  }

  get isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter(v => v.lang.includes('en'));
  }
}

export const avatarService = new AvatarServiceClass();
