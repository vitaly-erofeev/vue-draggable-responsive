export interface TabSettingType {
  isHidden: boolean,
  isBlocked: boolean,
  isStyled: boolean,
  isDefaultTab: boolean,

  hiddenConditions?: object,
  blockedConditions?: object,
  styledConditions?: object,

  style: string
}
