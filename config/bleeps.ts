import { type BleepsProviderSettings } from '@arwes/react-bleeps'

export type BleepNames =
  | 'click'
  | 'type'
  | 'error'
  | 'info'

export const bleepsSettings: BleepsProviderSettings<BleepNames> = {
  master: { volume: 0.5 },
  categories: {
    interaction: { volume: 0.75 },
    notification: { volume: 1 }
  },
  bleeps: {
    // Interaction bleeps
    click: {
      category: 'interaction',
      sources: [
        { src: '/sounds/click.webm', type: 'audio/webm' },
        { src: '/sounds/click.mp3', type: 'audio/mpeg' }
      ]
    },
    type: {
      category: 'interaction',
      sources: [
        { src: '/sounds/type.webm', type: 'audio/webm' },
        { src: '/sounds/type.mp3', type: 'audio/mpeg' }
      ],
      loop: true
    },

    // Notification bleeps
    info: {
      category: 'notification',
      sources: [
        { src: '/sounds/info.webm', type: 'audio/webm' },
        { src: '/sounds/info.mp3', type: 'audio/mpeg' }
      ]
    },
    error: {
      category: 'notification',
      sources: [
        { src: '/sounds/error.webm', type: 'audio/webm' },
        { src: '/sounds/error.mp3', type: 'audio/mpeg' }
      ]
    }
  }
}