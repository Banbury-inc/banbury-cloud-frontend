import dgram from 'dgram';

interface WolOptions {
  address?: string;
  port?: number;
}

export async function wakeOnLan(macAddress: string, options: WolOptions = {}): Promise<boolean> {
  const defaults = {
    address: '255.255.255.255', // Broadcast address
    port: 9 // Standard WoL port
  };

  const settings = { ...defaults, ...options };

  try {
    // Clean up MAC address format (remove colons, hyphens etc.)
    const cleanMac = macAddress.replace(/[:\-]/g, '');
    if (cleanMac.length !== 12 || !/^[0-9A-Fa-f]{12}$/.test(cleanMac)) {
      throw new Error('Invalid MAC address format');
    }

    // Create magic packet
    const magicPacket = Buffer.alloc(102);
    
    // First 6 bytes of 0xFF
    for (let i = 0; i < 6; i++) {
      magicPacket[i] = 0xFF;
    }
    
    // Repeat MAC address 16 times
    for (let i = 1; i <= 16; i++) {
      for (let j = 0; j < 6; j++) {
        magicPacket[i * 6 + j] = parseInt(cleanMac.substr(j * 2, 2), 16);
      }
    }

    // Create UDP socket
    const socket = dgram.createSocket('udp4');
    
    // Enable broadcast
    socket.setBroadcast(true);

    // Send magic packet
    return new Promise((resolve, reject) => {
      socket.send(
        magicPacket,
        0,
        magicPacket.length,
        settings.port,
        settings.address,
        (error) => {
          socket.close();
          
          if (error) {
            console.error('Error sending WoL packet:', error);
            reject(error);
            return;
          }
          
          console.log(`Wake-on-LAN packet sent to ${macAddress}`);
          resolve(true);
        }
      );
    });

  } catch (error) {
    console.error('Error in wakeOnLan:', error);
    throw error;
  }
}

// Function to validate MAC address format
export function isValidMacAddress(macAddress: string): boolean {
  // Accept formats: XX:XX:XX:XX:XX:XX, XX-XX-XX-XX-XX-XX, XXXXXXXXXXXX
  const macRegex = /^([0-9A-Fa-f]{2}[:-]?){5}([0-9A-Fa-f]{2})$/;
  return macRegex.test(macAddress);
}