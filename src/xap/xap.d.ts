import { BrowserWindow } from 'electron';
import { Device } from 'usb-detection';

export interface UsbConnectionEvent {
  device: Device;
  timestamp: Date;
}

export interface HidDeviceInfo {
  manufacturer: string;
  path: string;
  name: string;
  productId: number;
  usage: number;
  usagePage: number;
  vendorId: number;
}

export interface HidDevice {
  info: HidDeviceInfo;
}

interface HidConnectionEvent {
  device: HidDeviceInfo;
  timestamp: Date;
}

export interface HidListenTextEvent {
  device: HidDeviceInfo;
  timestamp: Date;
  text: string;
}

export interface XapConnectionEvent {
  device: HidDeviceInfo;
  timestamp: Date;
}

export interface XapTextEvent {
  device: HidDeviceInfo;
  timestamp: Date;
  text: string;
}

export interface XapDataEvent {
  device: HidDeviceInfo;
  timestamp: Date;
  data: Buffer;
}

export interface XapElectron {
  attach(window: BrowserWindow): void;
}

export interface XapRenderer {
  attach(): void;

  send(device: HidDeviceInfo, data: Buffer): Promise<void>;

  onUsbConnect(callback: (data: XapConnectionEvent) => Promise<void>): Promise<void>;
  onUsbDisconnect(callback: (data: XapConnectionEvent) => Promise<void>): Promise<void>;

  onConsoleConnect(callback: (data: XapConnectionEvent) => Promise<void>): Promise<void>;
  onConsoleDisconnect(callback: (data: XapConnectionEvent) => Promise<void>): Promise<void>;
  onConsoleText(callback: (data: XapTextEvent) => Promise<void>): Promise<void>;

  onXapConnect(callback: (data: XapConnectionEvent) => Promise<void>): Promise<void>;
  onXapDisconnect(callback: (data: XapConnectionEvent) => Promise<void>): Promise<void>;
  onXapData(callback: (data: XapDataEvent) => Promise<void>): Promise<void>;
}
