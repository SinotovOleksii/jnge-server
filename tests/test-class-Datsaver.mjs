import dataSaver from '../datasaver.mjs';
import { describe, it} from 'node:test';
import assert from 'node:assert';

const databaseParams = {
    schemaName: 'jnge_test',
    dataTable: 'device_messages',
    usersTable: 'users'
};
const database = new dataSaver('jnge_test', databaseParams);

describe('Tests for Datasaver class', () => {
    describe('Test connection to DB',  () => {
        it('Should be zero clients', () => {
            var expectedVal = 0;
            var actualVal = database ?. pool ?. totalCount;
            assert.strictEqual(actualVal, expectedVal);
        });

        it('Should pass a test simple query', async () => {
            var expectedVal = 100500;
            var actualVal = -1;
            var result = await database.query('SELECT 100500');
            actualVal = result ?. rows ?. [0] ?. ['?column?'];
            database.end();
            assert.strictEqual(actualVal, expectedVal); 
        });


    });
});