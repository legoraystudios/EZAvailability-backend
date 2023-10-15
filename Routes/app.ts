import express, { Express, Request, Response } from 'express';
const router = express.Router()

router.get('/', (req: Request, res: Response) => {
    res.send('EZAvailability Backend by Legoncio. Visit https://github.com/legoraystudios/EZAvailability-backend for docs.')
  })

module.exports = router