declare module 'xterm' {
  interface Terminal {
    loadWebfontAndOpen(el: HTMLElement): Terminal;
  }
}
