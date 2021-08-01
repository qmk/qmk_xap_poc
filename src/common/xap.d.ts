interface HidDeviceInfo {
  interface: number;
  manufacturer: string;
  path: string;
  product: string;
  productId: number;
  release: number;
  usage: number;
  usagePage: number;
  vendorId: number;
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
