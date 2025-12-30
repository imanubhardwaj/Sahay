/**
 * Get Socket.io instance from global (set by custom server)
 */
interface GlobalWithIO {
  io?: unknown;
}

export function getIO() {
  if (typeof global !== 'undefined') {
    const globalWithIO = global as GlobalWithIO;
    if (globalWithIO.io) {
      return globalWithIO.io;
    }
  }
  return null;
}

