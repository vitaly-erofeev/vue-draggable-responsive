import { SizeTypes } from 'e:/vue-draggable-responsive/src/domain/model/SizeTypes'

export interface ReplicationProperties {
  columns?: number
  horizontalMargin?: {
    type: SizeTypes,
    value: number
  }
  verticalMargin?: {
    type: SizeTypes,
    value: number
  }
  function?: Function
  topBlockGuid?: string
  additionalData?: object
}
