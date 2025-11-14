type SizeType = 'px' | '%';
interface propertiesBlockV2 {
  isBlockV2: boolean
}

interface BlockDTOV2 {
  width: number;
  height: number;
  guid: string;
  isStretched: boolean;
  isActive: boolean;
  isActiveAsParent: boolean;
  isHidden: boolean;
  // top: number;
  // right: number;
  // bottom: number;
  // left: number;
  // sizeTypes: {
  //   width: SizeType,
  //   height: SizeType,
  //   top: SizeType,
  //   right: SizeType,
  //   bottom: SizeType,
  //   left: SizeType
  // },
  blockV2: propertiesBlockV2
  // properties: {
  //   contentType: string
  // };
  parentGuid: string;
  children: BlockDTOV2[];
  alias: string;
}
export { BlockDTOV2 }
