import Appointment from '../models/Appointment';
import { startOfHour, parseISO, isBefore } from 'date-fns';
import User from '../models/User';
import File from '../models/File';
import * as Yup from 'yup';

class AppointmentController {
    async index(req, res){
        const { page = 1 } = req.query;

        const appointments = await Appointment.findAll({
            where: { user_id: req.userId, canceled_at: null },
            order: ['date'],
            attributes: ['id', 'date'],
            limit: 20,
            offset: (page - 1) * 20,
            include: [
                {
                    model: User,
                    as: 'provider',
                    attributes: ['id', 'name'],
                    include: [
                        {
                            model: File,
                            as: 'avatar',
                            attributes: ['id', 'path', 'url'],
                        },
                    ],
                },
            ],
        });

        return res.json(appointments);
    }



    async store(req, res){
        const schema = Yup.object().shape({
            provider_id: Yup.number().required(),
            date: Yup.date().required(),
        });
        
        if(!(await schema.isValid(req.body))){
            return res.status(400).json({error: 'Validation failed'});
        }

        const { provider_id, date } = req.body;

        /**
         * Check if provider_id is a provider
         */

        const checkIsProvider = await User.findOne({ 
            where: { id: provider_id, provider: true },
        });
        
        if(!checkIsProvider) {
            return res.status(401).json({error: 'You cannot create an appointment if you are not a provider' });
        }
        /**
        * Check if it's a past hour
        */
        const hourStart = startOfHour(parseISO(date));

        if(isBefore(hourStart, new Date())){
            return res.status(400).json({ error: 'Past dates are not permited'});
        }

        /**
         * Check if is available
         */

        const checkAvailability = await Appointment.findOne({
            where: {
                provider_id,
                canceled_at: null,
                date: hourStart,
            }
        });

        if(checkAvailability){
            return res.status(400).json({ error: 'Date is not available'});
        }

        const appointment = await Appointment.create({
            user_id: req.userId,
            provider_id,
            date: hourStart,
        })

        return res.json(appointment);
    }
} export default new AppointmentController();