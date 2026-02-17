import { EventTypes } from '@/domain/model/EventTypes'

export interface ListenerInterface {
  handle (event: object): void

  isSubscribed (eventType: EventTypes): boolean
}
