import { type BleepsProviderSettings } from '@arwes/react'

export type BleepNames =
  | 'click'
  | 'open'
  | 'close'
  | 'error'
  | 'info'
  | 'intro'
  | 'content'
  | 'type'
  | 'hover'
  | 'assemble'

export const bleepsSettings: BleepsProviderSettings<BleepNames> = {
  master: { volume: 0.5 },
  categories: {
    background: { volume: 0.25, muteOnWindowBlur: true },
    transition: { volume: 0.5, muteOnWindowBlur: true },
    interaction: { volume: 0.75 },
    notification: { volume: 1 }
  },
  bleeps: {
    // Background bleeps.
    hover: {
      category: 'background',
      sources: [
        { src: '/sounds/hover.webm', type: 'audio/webm' },
        { src: '/sounds/hover.mp3', type: 'audio/mpeg' }
      ]
    },

    // Transition bleeps.
    intro: {
      category: 'transition',
      sources: [
        { src: '/sounds/intro.webm', type: 'audio/webm' },
        { src: '/sounds/intro.mp3', type: 'audio/mpeg' }
      ]
    },
    content: {
      category: 'transition',
      sources: [
        { src: '/sounds/content.webm', type: 'audio/webm' },
        { src: '/sounds/content.mp3', type: 'audio/mpeg' }
      ]
    },
    type: {
      category: 'transition',
      sources: [
        { src: '/sounds/type.webm', type: 'audio/webm' },
        { src: '/sounds/type.mp3', type: 'audio/mpeg' }
      ],
      loop: true
    },
    assemble: {
      category: 'transition',
      sources: [
        { src: '/sounds/assemble.webm', type: 'audio/webm' },
        { src: '/sounds/assemble.mp3', type: 'audio/mpeg' }
      ],
      loop: true
    },

    // Interaction bleeps.
    click: {
      category: 'interaction',
      sources: [
        { src: '/sounds/click.webm', type: 'audio/webm' },
        { src: '/sounds/click.mp3', type: 'audio/mpeg' }
      ]
    },
    open: {
      category: 'interaction',
      sources: [
        { src: '/sounds/open.webm', type: 'audio/webm' },
        { src: '/sounds/open.mp3', type: 'audio/mpeg' }
      ]
    },
    close: {
      category: 'interaction',
      sources: [
        { src: '/sounds/close.webm', type: 'audio/webm' },
        { src: '/sounds/close.mp3', type: 'audio/mpeg' }
      ]
    },

    // Notification bleeps.
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