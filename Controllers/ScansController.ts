import express from 'express';
const dotenv = require('dotenv');
const database = require('./DatabaseController');
const { generateId } = require('./../Utilities/GeneralUtilities');

dotenv.config({ path: '../../.env' });

async function createScanId() {

    try {
        const id = generateId();

        database.query("SELECT * FROM ?? WHERE scan_id = ?", [process.env.DB_SCANS_TABLE, id], async (err: any, result: any) => {
    
            const queryResult = result[0];
    
            if(queryResult === id) {
                createScanId();
            }
    
        })
        
        return id;
    } catch (err) {
        console.log(err);
    }


}

module.exports = { createScanId }