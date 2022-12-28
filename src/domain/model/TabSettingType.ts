import { InteractiveProperties } from '@/domain/model/InteractiveProperties'

export interface TabSettingType {
  isHidden: boolean,
  isBlocked: boolean,
  isStyled: boolean,
  isDefaultTab: boolean,

  hiddenConditions?: object,
  blockedConditions?: object,
  styledConditions?: object,

  interactive?: InteractiveProperties,

  style: string
}
