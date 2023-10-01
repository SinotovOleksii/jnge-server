import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
const { Pool } = pg;
import pgFormat from 'pg-format';
import process from 'node:process';
import { Buffer } from 'node:buffer';

class pgsqlConnector{
  pool;
    
  /**
     * @description Create pool to work with pgdatabase and ident with application name
     * @param {string} appalicationName 
     */
  constructor(appalicationName){
    const initPoolObj = {
      application_name: appalicationName,
      max: 10,
      idleTimeoutMillis: 600000,
    };
    this.pool = new Pool(initPoolObj);
    this.pool.on('connect', () => {
      process.stdout.write(`Database pool connected.\nClients in pool: ${this.pool.totalCount}, where idle is: ${this.pool.idleCount}, waiting: ${this.pool.waitingCount}\n`);
    });
    this.pool.on('error', (err, client) => {
      process.stderr.write(`Pool has an error: ${toString(err)}\n`);
      client.end();
      process.stderr.write(`Clients in pool: ${this.pool.totalCount}, where idle is: ${this.pool.idleCount}, waiting: ${this.pool.waitingCount}\n`);
    });
    this.createDataTableQuery = `CREATE TABLE IF NOT EXISTS %I.%I(
            datetime double precision NOT NULL,
            dev_data jsonb);`;
    this.createUsersTableQuery = `CREATE TABLE IF NOT EXISTS %I.%I(
            datetime double precision NOT NULL,
            dev_data jsonb);`;
    this.insertDataQuery = 'INSERT INTO %I.%I (datetime, dev_data) VALUES (%s, %L)';

  }

  serializeDevData(data){ //convert buffers to strings
    let convertedData = Object.create(data);

    //convert object props to string hex
    for  (const [key, val] of Object.entries(data)){
      if (Buffer.isBuffer(val)){
        convertedData[key] = val.toString('hex');
      } else {
        convertedData[key] = val;
      }
    }
    return convertedData;
  }

  // deserializeDevData(data) {


  // }

  async query(queryText) {
    try {
      var result  = await this.pool.query(queryText);
      return result;
    } catch(e){
      process.stderr.write(`Error when trying to process query "${queryText}": ${e.toString()}\n`);
      return false;
    }   
  }

}

class dataSaver  extends pgsqlConnector{
  #schema = {};
  /**
     * @description Create object to work with schema, tables, queries and ident with application name. 
     * @param {string} appalicationName 
     * @param {Object} schema {schemaName:string, dataTable: string, usersTable: string}
     */
  constructor(appalicationName, schema){
    let checkProp = Object.prototype.hasOwnProperty;
    if ( !schema || typeof(schema) != 'object' ) throw new Error(`dataSaver constructor error in schema object: ${toString(schema)}`);
    if ( !checkProp.call(schema, 'schemaName') || checkProp.call(schema,'dataTable') || !checkProp.call(schema,'usersTable') )
      throw new Error(`dataSaver constructor error in schema object: ${toString(schema)}`);

    super(appalicationName);
    this.#schema = schema;
  }
  /**
     * @desciption create tables for shema name. Return true  or false
     * @param {string} name of schema 
     * @return {boolean} true if created succesfully
     */
  async createTables(){
    var createText = pgFormat(this.createDataTableQuery, this.#schema.schemaName, this.#schema.dataTable);
    createText += pgFormat(this.createUsersTableQuery, this.#schema.schemaName, this.#schema.usersTable);
    //createText += pgFormat(`GRANT ALL ON TABLE %I.device_messages, %I.users TO %I;`, this.schema, this.schema, process.env.PGUSER)
    return this.query(createText);
  }

  /**
     * @desciption prepare parsed dev data to insert to the database. Return query result or false
     * @param {string} parsed Dev Data
     * @return {boolean} sheet...
     */    
  saveDevData(data){
    if (!data) {
      process.stderr.write(`saveDevData() error in data param: ${toString(data)}\n`);
      return false;
    }

    let serializedData = this.serializeDevData(data);
    var insterText = pgFormat(this.insertDataQuery, this.#schema.schemaName, this.#schema.dataTable, Date.now()/1000, serializedData);
    return this.query(insterText);
  }

  //  getDevData(devid, start_date, end_date){

  //  }




}

export default dataSaver;

/*
const s = {
    schemaName: 'jnge_test',
    dataTable: 'device_messages',
    usersTable: 'users'
};
const d = new dataSaver('jnge_test', s);
console.log(d.createTables());
console.log(d.query('DSELECT * from tt.tt;'));
console.log(d.saveDevData( {"dev": 66, "a": 4} ));

*/