/**
 * Devices Store
 * 
 * Manages paired devices and device pairing operations.
 * Uses the DeviceService from foundframe-front for persistence.
 */

import type { IDeviceService, PairedDevice, PairingQrData, ScannedPairingData } from '@o19/foundframe-front';

// Service instance (set during initialization)
let deviceService: IDeviceService | null = null;

// Reactive state
let pairedDevices = $state<PairedDevice[]>([]);
let isLoading = $state(false);
let error = $state<string | null>(null);

// Getters
export function getPairedDevices(): PairedDevice[] {
  return pairedDevices;
}

export function getIsLoading(): boolean {
  return isLoading;
}

export function getError(): string | null {
  return error;
}

/**
 * Set the device service (called during app initialization)
 */
export function setDeviceService(service: IDeviceService): void {
  deviceService = service;
}

/**
 * Generate a pairing QR code
 */
export async function generatePairingQr(deviceName: string): Promise<PairingQrData> {
  if (!deviceService) {
    throw new Error('Device service not initialized');
  }
  
  try {
    isLoading = true;
    error = null;
    const result = await deviceService.generatePairingQr(deviceName);
    return result;
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to generate pairing QR';
    error = msg;
    throw e;
  } finally {
    isLoading = false;
  }
}

/**
 * Parse a pairing URL from a scanned QR code
 */
export async function parsePairingUrl(url: string): Promise<ScannedPairingData> {
  if (!deviceService) {
    throw new Error('Device service not initialized');
  }
  
  try {
    isLoading = true;
    error = null;
    const result = await deviceService.parsePairingUrl(url);
    return result;
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to parse pairing URL';
    error = msg;
    throw e;
  } finally {
    isLoading = false;
  }
}

/**
 * Confirm pairing with a scanned device
 */
export async function confirmPairing(nodeIdHex: string, alias: string): Promise<PairedDevice> {
  if (!deviceService) {
    throw new Error('Device service not initialized');
  }
  
  try {
    isLoading = true;
    error = null;
    const result = await deviceService.confirmPairing(nodeIdHex, alias);
    // Refresh the list after pairing
    await loadPairedDevices();
    return result;
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to confirm pairing';
    error = msg;
    throw e;
  } finally {
    isLoading = false;
  }
}

/**
 * Load all paired devices
 */
export async function loadPairedDevices(): Promise<PairedDevice[]> {
  if (!deviceService) {
    throw new Error('Device service not initialized');
  }
  
  try {
    isLoading = true;
    error = null;
    const devices = await deviceService.listPairedDevices();
    pairedDevices = devices;
    return devices;
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to load paired devices';
    error = msg;
    throw e;
  } finally {
    isLoading = false;
  }
}

/**
 * Check followers and auto-pair
 */
export async function checkFollowersAndPair(): Promise<PairedDevice[]> {
  if (!deviceService) {
    throw new Error('Device service not initialized');
  }
  
  try {
    isLoading = true;
    error = null;
    const devices = await deviceService.checkFollowersAndPair();
    // Refresh the list
    await loadPairedDevices();
    return devices;
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to check followers';
    error = msg;
    throw e;
  } finally {
    isLoading = false;
  }
}

/**
 * Unpair a device
 */
export async function unpairDevice(nodeIdHex: string): Promise<void> {
  if (!deviceService) {
    throw new Error('Device service not initialized');
  }
  
  try {
    isLoading = true;
    error = null;
    await deviceService.unpairDevice(nodeIdHex);
    // Refresh the list
    await loadPairedDevices();
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to unpair device';
    error = msg;
    throw e;
  } finally {
    isLoading = false;
  }
}

/**
 * Check if a device is already paired
 */
export function isDevicePaired(nodeIdHex: string): boolean {
  return pairedDevices.some(d => d.nodeId === nodeIdHex);
}

/**
 * Get a device by its node ID
 */
export function getDeviceByNodeId(nodeIdHex: string): PairedDevice | undefined {
  return pairedDevices.find(d => d.nodeId === nodeIdHex);
}

/**
 * Clear any error
 */
export function clearError(): void {
  error = null;
}
