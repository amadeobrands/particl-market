import { Bookshelf } from '../../config/Database';
import { Collection } from 'bookshelf';
import { ListingItem } from './ListingItem';
import { BidData } from './BidData';
import { BidSearchParams } from '../requests/BidSearchParams';

export class Bid extends Bookshelf.Model<Bid> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<Bid> {
        if (withRelated) {
            return await Bid.where<Bid>({ id: value }).fetch({
                withRelated: [
                'BidData'
                ]
            });
        } else {
            return await Bid.where<Bid>({ id: value }).fetch();
        }
    }

    public static async search(options: BidSearchParams, withRelated: boolean = true): Promise<Collection<Bid>> {
        const bidCollection = Bid.forge<Collection<Bid>>()
            .query( qb => {

                qb.where('bids.listing_item_id', '=', options.listingItemId);

                if (options.action && typeof options.action === 'string') {
                    qb.where('bids.action', '=', options.action);
                }

            }).orderBy('bids.created_at', 'ASC');

        if (withRelated) {
            return await bidCollection.fetchAll({
                withRelated: [
                  'ListingItem',
                  'BidData'
                ]
            });
        } else {
            return await bidCollection.fetchAll();
        }
    }

    public static async getLatestBid(listingItemId: number): Promise<Bid> {
        return await Bid.where<Bid>({ listing_item_id: listingItemId }).orderBy('created_at', 'DESC').fetch();
    }

    public get tableName(): string { return 'bids'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Action(): string { return this.get('action'); }
    public set Action(value: string) { this.set('action', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public ListingItem(): ListingItem {
       return this.belongsTo(ListingItem, 'listing_item_id', 'id');
    }

    public BidData(): Collection<BidData> {
       return this.hasMany(BidData, 'bid_id', 'id');
    }
}
