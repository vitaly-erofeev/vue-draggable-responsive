export interface TabSettingType {
  isHidden: boolean,
  isBlocked: boolean,
  isStyled: boolean,

  hiddenConditions?: object,
  blockedConditions?: object,
  styledConditions?: object,

  style: string
}
