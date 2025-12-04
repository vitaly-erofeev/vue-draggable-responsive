export type PropertiesBlockV2 = {
  isBlockV2: boolean;
};
type SizeTypes = 'px' | '%';
export type PropertiesBlock = {
  contentType: string | null;
  showBreadcrumbs?: boolean;
  name?: string;
};

export type ParametersBlock = {
  width: number;
  height: number;
  parentGuid: string;
  alias: string;
  isComponent: boolean;
};

export type BlockDTOV2Grid = {
  gridArea: string;
  widthArea: number;
  heightArea: number;
};
type StylesBlock = {
  style: string;
  isHidden: boolean;
  sizeTypes: { width: SizeTypes; height: SizeTypes };
};

export type BlockDTOV2 = ParametersBlock &
  StylesBlock &
  Partial<BlockDTOV2Grid> & {
    guid: string;
    isStretched: boolean;
    isActive: boolean;
    isActiveAsParent: boolean;
    blockV2: PropertiesBlockV2;
    properties: PropertiesBlock;
    children: BlockDTOV2[];
  };

export type BlockTree = BlockDTOV2[];
export type BlockMap = Map<string, BlockDTOV2>;
