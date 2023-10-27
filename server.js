import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './Config/connectDB.js';
import userRouter from './Router/UserRouter.js';
import productRouter from './Router/ProductRouter.js';
import categoriesRouter from './Router/CategoriesRouter.js';
import orderRouter from './Router/OrderRouter.js';
import Uploadrouter from './Controller/uploadFile.js';
import VTCPayRouter from "./Router/VTCPayRouter.js"

dotenv.config();
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectDB();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

//router other

app.use('/v4/user', userRouter);
app.use('/v4/product', productRouter);
app.use('/v4/categories', categoriesRouter);
app.use('/v4/order', orderRouter);
app.use('/v4/upload', Uploadrouter);
app.use('/v4/vtcpay', VTCPayRouter)

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
