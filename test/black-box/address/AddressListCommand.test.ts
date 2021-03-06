import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';

describe('AddressListCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const addressCommand = Commands.ADDRESS_ROOT.commandName;
    const listCommand = Commands.ADDRESS_LIST.commandName;
    let defaultProfileId;

    const testData = {
        firstName: 'Johnny',
        lastName: 'Depp',
        title: 'Work',
        addressLine1: '123 6th St',
        addressLine2: 'Melbourne, FL 32904',
        city: 'Melbourne',
        state: 'Mel State',
        country: 'Finland',
        zipCode: '85001'
    };

    let defaultProfile;

    beforeAll(async () => {
        await testUtil.cleanDb();
        defaultProfile = await testUtil.getDefaultProfile();
        defaultProfileId = defaultProfile.id;
    });

    test('Should list empty address list for default profile id', async () => {
        // list all the address
        const addRes = await rpc(addressCommand, [listCommand, defaultProfileId]);
        addRes.expectJson();
        addRes.expectStatusCode(200);
        const result: any = addRes.getBody()['result'];
        expect(result.length).toBe(0);
    });

    test('Should list empty address for default profile when no profile is given', async () => {
        // list all the address
        const addRes = await rpc(addressCommand, [listCommand]);
        addRes.expectJson();
        addRes.expectStatusCode(200);
        const result: any = addRes.getBody()['result'];
        expect(result.length).toBe(0);
    });

    test('Should list one address for default profile id', async () => {
        // add address
        // TODO: this could fail when api changes, create and use 'data generate address'
        const res = await rpc(addressCommand, [Commands.ADDRESS_ADD.commandName, defaultProfileId,
                    testData.firstName, testData.lastName, testData.title,
                    testData.addressLine1, testData.addressLine2,
                    testData.city, testData.state, testData.country, testData.zipCode]);
        res.expectJson();
        res.expectStatusCode(200);

        // list created addresses
        const addRes = await rpc(addressCommand, [listCommand, defaultProfileId]);
        addRes.expectJson();
        addRes.expectStatusCode(200);
        const result: any = addRes.getBody()['result'];
        expect(result.length).toBe(1);

    });

    test('Should list two addresses for default profile id', async () => {
        // add address
        const res = await rpc(addressCommand, [Commands.ADDRESS_ADD.commandName, defaultProfileId,
                    testData.firstName, testData.lastName, testData.title,
                    testData.addressLine1, testData.addressLine2,
                    testData.city, testData.state, testData.country, testData.zipCode]);
        res.expectJson();
        res.expectStatusCode(200);

        // list created addresses
        const addRes = await rpc(addressCommand, [listCommand, defaultProfileId]);
        addRes.expectJson();
        addRes.expectStatusCode(200);
        const result: any = addRes.getBody()['result'];
        expect(result.length).toBe(2);
    });

    test('Should list two addresses for default profile when no profile is given', async () => {
        // list all the address without profile id
        const addRes = await rpc(addressCommand, [listCommand]);
        addRes.expectJson();
        addRes.expectStatusCode(200);
        const result: any = addRes.getBody()['result'];
        expect(result.length).toBe(2);
    });

});
