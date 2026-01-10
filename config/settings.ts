export const settings = Object.freeze({
  title: 'XGATE',
  description: 'Blokchain AI',
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
