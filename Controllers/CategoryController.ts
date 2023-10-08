import express from 'express';
const dotenv = require('dotenv');
const database = require('./DatabaseController');
const { generateId } = require('./../Utilities/GeneralUtilities');

dotenv.config({ path: '../../.env' });

async function createCatId() {

    try {
        const id = generateId();

        database.query("SELECT * FROM ?? WHERE category_id = ?", [process.env.DB_CATEGORY_TABLE, id], async (err: any, result: any) => {
    
            const queryResult = result[0];
    
            if(queryResult === id) {
                createCatId();
            }
    
        })
        
        return id;
    } catch (err) {
        console.log(err);
    }


}

module.exports = { createCatId }