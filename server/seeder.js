import mongoose from 'mongoose';
import colors from 'colors';
import dotenv from 'dotenv';
import users from './data/users.js';
import User from './models/Usuario.js';
import Consulta from './models/Consulta.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const importData = async () => {
	try {
		// delete all the current data
		await User.deleteMany();
		await Consulta.deleteMany();

		// create users (use save middleware by calling User.create for each one)
		for (const user of users) {
			await User.create(user);
		}

		console.log('Data inserted in to the DB'.green.inverse);
		process.exit();
	} catch (err) {
		console.error(`Error: ${err.message}`.red.inverse);
		process.exit(1);
	}
};

const destroyData = async () => {
	try {
		await User.deleteMany();
		await Consulta.deleteMany();

		console.log('Data deleted from the DB'.red.inverse);
		process.exit();
	} catch (err) {
		console.error(`Error: ${err.message}`.red.inverse);
		process.exit(1);
	}
};

// check the npm flag and call appropriate function
if (process.argv[2] === '-d') destroyData();
else importData();

