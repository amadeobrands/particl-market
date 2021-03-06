import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class MessageObjectUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public dataId: string;

    @IsNotEmpty()
    public dataValue: string;

}
// tslint:enable:variable-name
