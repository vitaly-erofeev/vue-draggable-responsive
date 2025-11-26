export type PropertiesBlockV2 = {
  isBlockV2: boolean;
}
export type PropertiesBlock = {
  contentType: string | null;
  showBreadcrumbs?: boolean;
  name?: string;
}

export type ParametersBlock = {
  width: number;
  height: number;
  parentGuid: string;
  alias: string;
}
type StylesBlock = {
  style: string;
  isHidden: boolean;
}

export type BlockDTOV2 = ParametersBlock & StylesBlock & {
  guid: string;
  isStretched: boolean;
  isActive: boolean;
  isActiveAsParent: boolean;
  blockV2: PropertiesBlockV2;
  properties: PropertiesBlock;
  children: BlockDTOV2[];
}

export type BlockTree = BlockDTOV2[];
export type BlockMap = Map<string, BlockDTOV2>
