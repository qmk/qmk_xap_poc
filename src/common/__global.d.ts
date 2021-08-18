import XapRenderer from '../xap/xap';

declare global {
  interface BetterIpcRenderer {
    answerMain: (channel: string, callback: (data: any) => any) => Promise<any>;
    callMain: (channel: string, data?: any) => Promise<any>;
  }

  interface Window {
    ipc: BetterIpcRenderer;
    xap: XapRenderer;
  }
}

export {};
