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
            process.stdout.write('Database pool connected\n');
        })
        this.pool.on('error', (err, client) => {
            process.stderr.write(`Pool has an error: ${toString(err)}\n`);
            client.end();
        })
    };
    /**
     * @desciption create tables for shema name.
     * @param {string} name of schema 
     * @return {boolean} true if created succesfully
     */
    async createTables(){
        var createText = pgFormat(`CREATE TABLE IF NOT EXISTS %I.%I(
            datetime double precision NOT NULL,
            dev_data jsonb);`, this.#schema, this.#dataTable);
        createText += pgFormat(`CREATE TABLE IF NOT EXISTS %I.%I(
            datetime double precision NOT NULL,
            dev_data jsonb);`, this.#schema, this.#usersTable);
        //createText += pgFormat(`GRANT ALL ON TABLE %I.device_messages, %I.users TO %I;`, this.schema, this.schema, process.env.PGUSER)
        let result;
        try {
            result = await this.pool.query(createText);
            return true;
        } catch(e) {
            process.stdout.write('ERROR occured in createTable()');
            process.stdout.write(`${e.toString()}\n`);
            return false;
        }
    };
    async saveDevData(data){
        if (!data) return false;
        //try {JSON.parse(data.toString())} catch(e) {return false};
        var insterText = pgFormat('INSERT INTO %I.%I (datetime, dev_data) VALUES (%s, %L)', this.#schema, this.#dataTable, Date.now()/1000, data);
        process.stdout.write(`${insterText}\n`);
        try {
            await this.pool.query(insterText)
        } catch(e){
            process.stderr.write(`Error when trying to INSERT: ${e.toString()}\n`);
        }     
    };
};

export default dataSaver;

//const d = new dataSaver('jnge-dev', 'jnge-dev');
//d.createTables('jnge-dev')
//    .then((r) => console.log('resolve: ', r))
//    .catch((e) => console.log('reject: ', e));
//d.saveDevData( '{"dev": 66, "a": 4}' );

//setInterval(()=>process.stdout.write('interval\n'), 10000);