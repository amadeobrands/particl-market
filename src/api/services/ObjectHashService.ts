import * as crypto from 'crypto-js';
import { inject, named } from 'inversify';
import { HashableObjectType } from '../../api/enums/HashableObjectType';
import { ListingItemFactory } from '../../api/factories/ListingItemFactory';
import { ImageFactory } from '../../api/factories/ImageFactory';
import { Types, Core, Targets } from '../../constants';
import { Logger as LoggerType } from '../../core/Logger';

export class ObjectHashService {

    public log: LoggerType;

    constructor(
        @inject(Types.Factory) @named(Targets.Factory.ListingItemFactory) public listingItemFactory: ListingItemFactory,
        @inject(Types.Factory) @named(Targets.Factory.ImageFactory) public imageFactory: ImageFactory,
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async getHash(objectToHash: any, type: HashableObjectType): Promise<string> {
        let hashableObject;
        switch (type) {
            case HashableObjectType.LISTINGITEM:
            case HashableObjectType.LISTINGITEMTEMPLATE: {
                const templateOrItem = objectToHash;
                const templateOrItemCategoryWithRelated: any = templateOrItem.ItemInformation.ItemCategory;

                hashableObject = await this.listingItemFactory.getMessage(templateOrItem, templateOrItemCategoryWithRelated);
                delete hashableObject.hash;
                break;
            }
            case HashableObjectType.ITEMIMAGE: {
                // create the hash from ORIGINAL imageversion
                hashableObject = {
                    protocol: objectToHash.protocol,
                    encoding: objectToHash.encoding,
                    data: objectToHash.data,
                    id: objectToHash.dataId
                };
                break;
            }
            case HashableObjectType.DEFAULT: {
                hashableObject = objectToHash;
            }
        }
        return crypto.SHA256(JSON.stringify(hashableObject).split('').sort().toString()).toString();
    }
}
