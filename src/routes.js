import { Router } from 'express';
import User from './app/models/User';
import UserController from './app/controllers/UserCOntroller'

const routes = new Router();

routes.post('/users', UserController.store);

routes.get('/', async (req, res) => {
    const user = await User.create({
        name: 'Anna Fragoso',
        email: 'anna@hotmail.com',
        password_hash: '123123',
    });
    return res.json(user);
});

export default routes;