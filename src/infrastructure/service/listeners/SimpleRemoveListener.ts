import { ListenerInterface } from '@/domain/service/ListenerInterface'
import { EventTypes } from '@/domain/model/EventTypes'

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
