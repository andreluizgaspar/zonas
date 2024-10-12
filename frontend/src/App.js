import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LoginController from './controllers/loginController';
import RegisterPage from './pages/RegisterPage';
import PasswordResetPage from './pages/PasswordResetPage';
import ErrorPage from './pages/ErrorPage';
import PaymentPage from './pages/PaymentPage';
import ServiceWorkerWrapper from './ServiceWorkerWrapper';
import HomeController from './controllers/homeController';

const App = () => {
	return (
		<Router>
			<ServiceWorkerWrapper />
			<Switch>
				<Route path='/' component={HomeController} exact />
				<Route path='/login' component={LoginController} />
				<Route path='/register' component={RegisterPage} />
				<Route
					path='/user/password/reset/:token'
					component={PasswordResetPage}
				/>
				<Route path='/payment' component={PaymentPage} />
				<Route component={ErrorPage} />
			</Switch>
		</Router>
	);
};

export default App;