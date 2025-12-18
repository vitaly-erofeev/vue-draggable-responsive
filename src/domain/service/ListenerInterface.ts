import { EventTypes } from 'e:/vue-draggable-responsive/src/domain/model/EventTypes'

export interface ListenerInterface {
  handle (event: object): void

  isSubscribed (eventType: EventTypes): boolean
}
