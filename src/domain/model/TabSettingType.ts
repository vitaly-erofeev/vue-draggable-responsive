import { InteractiveProperties } from '@/domain/model/InteractiveProperties'

export interface TabSettingType {
  isHidden: boolean,
  isBlocked: boolean,
  isStyled: boolean,
  isDefaultTab: boolean,
  isExpanded?: boolean
  parentTabForTree: string,

  hiddenConditions?: object,
  blockedConditions?: object,
  styledConditions?: object,

  interactive?: InteractiveProperties,

  style: string
}
