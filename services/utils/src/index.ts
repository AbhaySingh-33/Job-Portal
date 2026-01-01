import express from 'express';
import router from './routes.js';
import dotenv from 'dotenv';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';
import { startSendMailConsumer } from './consumer.js';

dotenv.config();

(async () => {
    await startSendMailConsumer();
})();

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET
});

const app = express();
app.use(cors());

app.use(express.json({ limit: '50mb'}));
app.use('/api/utils', router);
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.listen(process.env.PORT, ()=> {
    console.log('Utils service is running on port',process.env.PORT);
})