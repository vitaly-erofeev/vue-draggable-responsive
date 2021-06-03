import { BlockRepositoryInterface } from '@/domain/repository/BlockRepositoryInterface'
import BlockDTO from '@/domain/model/BlockDTO'
import GuidGenerator from '@/infrastructure/service/GuidGenerator'
import { BlockProperties } from '@/domain/model/BlockProperties'

export default class BlockRepository implements BlockRepositoryInterface {
  private blocks: BlockDTO[] = [];

  change (block: BlockDTO, property: string, value: any): void {
    const blockModel = this.getByGuid(block.guid)
    if (typeof blockModel !== 'undefined') {
      blockModel[property] = value
    }
  }

  getByGuid (guid: string): BlockDTO | undefined {
    let answer: BlockDTO | undefined
    JSON.stringify(this.blocks, (_, nestedValue) => {
      if (nestedValue && nestedValue.guid === guid) {
        answer = nestedValue
      }
      return nestedValue
    })

    return answer
  }

  add (block: BlockProperties): string {
    block.guid = GuidGenerator.generate()
    let parent: undefined | BlockDTO
    if (block.parentGuid) {
      parent = this.getByGuid(block.parentGuid)
      if (typeof parent !== 'undefined') {
        parent.children.push(new BlockDTO(block))
      }
    } else {
      this.blocks.push(new BlockDTO(block))
    }

    return block.guid
  }

  get (): BlockDTO[] {
    return this.blocks
  }
}
