import express from 'express';

function generateId() {

    try {
        const min = 100000;
        const max = 999999;
    
        return Math.floor(Math.random() * (max - min + 1) + min);
    } catch (err) {
        console.log(err);
    }

}

module.exports = { generateId }