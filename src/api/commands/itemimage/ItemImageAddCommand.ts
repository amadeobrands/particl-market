import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemImageService } from '../../services/ItemImageService';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemImage } from '../../models/ItemImage';
import { RpcCommandInterface } from '../RpcCommandInterface';
import * as crypto from 'crypto-js';
import { ItemImageCreateRequest } from '../../requests/ItemImageCreateRequest';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import { HashableObjectType } from '../../../api/enums/HashableObjectType';
import { ObjectHashService } from '../../services/ObjectHashService';

export class ItemImageAddCommand extends BaseCommand implements RpcCommandInterface<ItemImage> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ItemImageService) private itemImageService: ItemImageService,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.ObjectHashService) private objectHashService: ObjectHashService
    ) {
        super(Commands.ITEMIMAGE_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: listing_item_template_id
     *  [1]: dataId
     *  [2]: protocol
     *  [3]: encoding
     *  [4]: data
     *
     * @param data
     * @returns {Promise<ItemImage>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ItemImage> {

        // check listingItemTemplate id present in params
        if (!data.params[0]) {
            throw new MessageException('ListingItemTemplate id can not be null.');
        }
        // find listing item template
        const listingItemTemplate = await this.listingItemTemplateService.findOne(data.params[0]);

        // find related itemInformation
        const itemInformation = listingItemTemplate.related('ItemInformation').toJSON();

        // TODO: why the fuck is image hash created from iteminformation?
        // create item images
        return await this.itemImageService.create({
            item_information_id: itemInformation.id,
            hash: await this.objectHashService.getHash({
                dataId: data.params[1],
                protocol: data.params[2],
                encoding: data.params[3],
                data: data.params[4],
                imageVersion: 'ORIGINAL'
            }, HashableObjectType.ITEMIMAGE),
            data: [{
                dataId: data.params[1],
                protocol: data.params[2],
                encoding: data.params[3],
                data: data.params[4],
                imageVersion: 'ORIGINAL'
            }]
        } as ItemImageCreateRequest);
    }

    public usage(): string {
        return this.getName() + ' <listingItemTemplateId> [<dataId> [<protocol> [<encoding> [<data>]]]] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemTemplateId>       - Numeric - The ID of the listing item template \n'
            + '                                     we want to associate this item image with. \n'
            + '    <dataId>                      - [optional] String - [TODO] \n'
            + '    <protocol>                    - [optional] Enum{LOCAL, IPFS, HTTPS, ONION, SMSG} - The protocol we want to use to load the image. \n'
            + '    <encoding>                    - [optional] Enum{BASE64} - The format the image is encoded in. \n'
            + '    <data>                        - [optional] String - The image\'s data. ';
    }

    public description(): string {
        return 'Add an item image to a listing item template, identified by its ID.';
    }

    public example(): string {
        return 'image ' + this.getName() + ' 1 someDataId LOCAL BASE64 '
            + 'iVBORw0KGgoAAAANSUhEUgAAAAMAAAADCAIAAADZSiLoAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUU'
            + 'H4gIQCyAa2TIm7wAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAAaSURBVAjXY/j//z8'
            + 'DA8P///8Z/v//D+EgAAD4JQv1hrMfIwAAAABJRU5ErkJggg== ';
    }
}
