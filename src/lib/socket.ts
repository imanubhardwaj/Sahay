/**
 * Get Socket.io instance from global (set by custom server)
 */
export function getIO() {
  if (typeof global !== 'undefined' && (global as any).io) {
    return (global as any).io;
  }
  return null;
}

