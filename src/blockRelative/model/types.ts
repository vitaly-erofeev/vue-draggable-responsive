export type PropertiesBlockV2 = {
  isBlockV2: boolean;
};
type SizeTypes = 'px' | '%' | 'auto';
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

export type CustomStyles = {
  paddingLeft: string;
  paddingRight: string;
  paddingTop: string;
  paddingBottom: string;
  minHeight: string;
  maxHeight: string;
  display: string;
  flexDirection: string;
  justifyContent: string;
  alignItems: string;
  flexWrap: string;
  gap: string;
}
export type BlockDTOV2Grid = {
  gridArea: string;
  widthArea: number;
  heightArea: number;
};
export type StylesComponent = {
  minWidth: string;
  maxWidth: string;
  flexGrow: string;
  flexShrink: string;
};
type StylesBlock = {
  style: string;
  isHidden: boolean;
  customStyles: CustomStyles;
  stylesComponent: StylesComponent
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
