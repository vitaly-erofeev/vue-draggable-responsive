import { ListenerInterface } from 'e:/vue-draggable-responsive/src/domain/service/ListenerInterface'
import { EventTypes } from 'e:/vue-draggable-responsive/src/domain/model/EventTypes'

export default class SimpleRemoveListener implements ListenerInterface {
  private readonly handler: Function

  constructor (handler: Function) {
    this.handler = handler
  }

  handle (event: object): void {
    this.handler(event)
  }

  isSubscribed (eventType: EventTypes): boolean {
    return eventType === EventTypes.REMOVE_BLOCK
  }
}
