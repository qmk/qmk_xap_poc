import { BrowserWindow } from 'electron';
import { Device } from 'usb-detection';

interface UsbConnectionEvent {
  device: Device;
  timestamp: Date;
}

interface HidDeviceInfo {
  manufacturer: string;
  path: string;
  name: string;
  productId: number;
  usage: number;
  usagePage: number;
  vendorId: number;
}

interface HidDevice {
  info: HidDeviceInfo;
}

interface HidConnectionEvent {
  device: HidDeviceInfo;
  timestamp: Date;
}

interface HidListenTextEvent {
  device: HidDeviceInfo;
  timestamp: Date;
  text: string;
}

interface XapConnectionEvent {
  device: HidDeviceInfo;
  timestamp: Date;
}

interface XapTextEvent {
  device: HidDeviceInfo;
  timestamp: Date;
  text: string;
}

interface XapDataEvent {
  device: HidDeviceInfo;
  timestamp: Date;
  data: Buffer;
}

declare module 'xap' {
  export class XapElectron {
    public attach(window: BrowserWindow): void;
  }

  export class XapRenderer {
    public attach(): void;

    public send(device: HidDeviceInfo, data: Buffer): Promise<void>;

    public onUsbConnect(callback: (data: XapConnectionEvent) => Promise<void>): Promise<void>;
    public onUsbDisconnect(callback: (data: XapConnectionEvent) => Promise<void>): Promise<void>;

    public onConsoleConnect(callback: (data: XapConnectionEvent) => Promise<void>): Promise<void>;
    public onConsoleDisconnect(callback: (data: XapConnectionEvent) => Promise<void>): Promise<void>;
    public onConsoleText(callback: (data: XapTextEvent) => Promise<void>): Promise<void>;

    public onXapConnect(callback: (data: XapConnectionEvent) => Promise<void>): Promise<void>;
    public onXapDisconnect(callback: (data: XapConnectionEvent) => Promise<void>): Promise<void>;
    public onXapData(callback: (data: XapDataEvent) => Promise<void>): Promise<void>;
  }
}
