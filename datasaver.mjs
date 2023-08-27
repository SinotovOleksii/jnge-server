import pg from 'pg';
const { Pool } = pg;
import pgFormat from 'pg-format';


//put this in main module.
import dotenv from 'dotenv';
dotenv.config();
//console.log(process.env.PGUSER);

class dataSaver{
    pool;
    #schema;
    #dataTable = 'device_messages';
    #usersTable = 'users';
    /**
     * @description Create pool to work with schema and ident with application name
     * @param {string} appalicationName 
     * @param {string} schema 
     */
    constructor(appalicationName, schema){
        if (!schema) throw new Error('dataSaver constructor error in schema name');
        this.#schema = schema;
        const initPoolObj = {
            application_name: appalicationName,
            max: 10
        };
        this.pool = new Pool(initPoolObj);
        this.pool.on('connect', () => {
            console.log('Pool connected');
        })
        this.pool.on('error', (err, client) => {
            console.log('Pool has an error: ', err);
            client.end();
        })
    }
    /**
     * @desciption create tables for shema name.
     * @param {string} name of schema 
     * @return {boolean} true if created succesfully
     */
    async createTables(){
        var createText = pgFormat(`CREATE TABLE IF NOT EXISTS %I.%I(
            datatime bigint NOT NULL,
            dev_data jsonb);`, this.#schema, this.#dataTable);
        createText += pgFormat(`CREATE TABLE IF NOT EXISTS %I.%I(
            datatime integer NOT NULL,
            dev_data jsonb);`, this.#schema, this.#usersTable);
        //createText += pgFormat(`GRANT ALL ON TABLE %I.device_messages, %I.users TO %I;`, this.schema, this.schema, process.env.PGUSER)
        let result;
        try {
            result = await this.pool.query(createText);
            console.log(result);
            return true;
        } catch(e) {
            console.log('ERROR occured', e);
            return false;
        }
    }
    async saveDevData(data){
        if (!data) return false;
        try {JSON.parse(data)} catch(e) {return false};
        var insterText = pgFormat('INSERT INTO %I.%I (datatime, dev_data) VALUES (%s, %L)', this.#schema, this.#dataTable, Date.now(), data);
        console.log(insterText);
    }
}


const d = new dataSaver('jnge-dev', 'jnge-dev');
//d.createTables('jnge-dev')
//    .then((r) => console.log('resolve: ', r))
//    .catch((e) => console.log('reject: ', e));
d.saveDevData( '{"dev": 66, "a": 4}' );

setInterval(()=>console.log('interval'), 10000);