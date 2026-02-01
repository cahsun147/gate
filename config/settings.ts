export const settings = Object.freeze({
  title: 'XGATE',
  description: 'XGATE Ai For Blokchain',
  background: 'hsl(180, 20%, 4%)',
  version: '1.0.0-xgate',
  deployTime: new Date().toISOString(),
  apps: {
    terminal: {
      url: '/terminal'
    },
    chat: {
      url: '/chat-v3'
    },
    tokenomic: {
      url: '/tokenomic'
    },
    perf: {
      url: '/'
    }
  }
} as const)
