export const settings = Object.freeze({
  title: 'XGATE',
  description: 'Futuristic Sci-Fi UI Web Framework',
  background: 'hsl(180, 20%, 4%)',
  version: '1.0.0-xgate',
  deployTime: new Date().toISOString(),
  apps: {
    play: {
      url: 'https://www.google.com'
    },
    perf: {
      url: 'https://www.google.com'
    }
  }
} as const)
