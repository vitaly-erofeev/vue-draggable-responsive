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

export type BlockDTOV2 = ParametersBlock & {
  guid: string;
  isStretched: boolean;
  isActive: boolean;
  isActiveAsParent: boolean;
  isHidden: boolean;
  blockV2: PropertiesBlockV2;
  properties: PropertiesBlock;
  children: BlockDTOV2[];
}

export type BlockTree = BlockDTOV2[];
export type BlockMap = Map<string, BlockDTOV2>
