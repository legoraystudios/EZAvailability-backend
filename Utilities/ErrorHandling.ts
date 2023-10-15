import express, { Request, Response, NextFunction } from 'express';

function errorHandling(err: any, req: Request, res: Response) {
    console.log(err);
    return res.status(500).json({ errors: { msg: "Internal Server Error." } });
}

module.exports = { errorHandling }