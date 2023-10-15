import express from 'express';
const dotenv = require('dotenv');
const database = require('./DatabaseController');
const { generateId } = require('./../Utilities/GeneralUtilities');

dotenv.config({ path: '../../.env' });

async function createProductId() {

    try {
        const id = generateId();

        database.query("SELECT * FROM ?? WHERE product_id = ?", [process.env.DB_PRODUCTS_TABLE, id], async (err: any, result: any) => {
    
            const queryResult = result[0];
    
            if(queryResult === id) {
                createProductId();
            }
    
        })
        
        return id;
    } catch (err) {
        console.log(err);
    }


}

module.exports = { createProductId }