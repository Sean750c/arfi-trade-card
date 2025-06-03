export function generateDeviceId(): string {
  // Generate a simple device ID based on timestamp and random number
  // In a production app, you'd want to use a more sophisticated fingerprinting solution
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `web_${timestamp}_${randomStr}`;
}