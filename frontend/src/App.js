import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ConfirmPage from './pages/ConfirmPage';
import ShippingPage from './pages/ShippingPage';
import PaymentPage from './pages/PaymentPage';
import PlaceOrderPage from './pages/PlaceOrderPage';
import OrderPage from './pages/OrderPage';
import PasswordResetPage from './pages/PasswordResetPage';
import UserListPage from './pages/UserListPage';
import UserEditPage from './pages/UserEditPage';
import ProductListPage from './pages/ProductListPage';
import ProductEditPage from './pages/ProductEditPage';
import OrderListPage from './pages/OrderListPage';
import ErrorPage from './pages/ErrorPage';
import ServiceWorkerWrapper from './ServiceWorkerWrapper';
import HomeController from './controllers/homeController';

const App = () => {
	return (
		<Router>
			<ServiceWorkerWrapper />
			<Switch>
				<Route path='/' component={HomeController} exact />
				<Route
					path='/search/:keyword'
					component={HomePage}
					exact
				/>
				<Route
					path='/page/:pageNumber'
					component={HomePage}
					exact
				/>
				<Route
					path='/search/:keyword/page/:pageNumber'
					exact
					component={HomePage}
				/>
				<Route path='/login' component={LoginPage} />
				<Route path='/register' component={RegisterPage} />
				<Route
					path='/user/password/reset/:token'
					component={PasswordResetPage}
				/>
				<Route path='/profile' component={ProfilePage} />
				<Route path='/product/:id' component={ProductPage} />
				<Route path='/cart/:id?' component={CartPage} />
				<Route
					path='/user/confirm/:token'
					component={ConfirmPage}
					exact
				/>
				<Route path='/shipping' component={ShippingPage} />
				<Route path='/payment' component={PaymentPage} />
				<Route path='/placeorder' component={PlaceOrderPage} />
				<Route path='/order/:id' component={OrderPage} />
				<Route
					path='/admin/userlist'
					component={UserListPage}
					exact
				/>
				<Route
					path='/admin/userlist/:pageNumber'
					component={UserListPage}
					exact
				/>
				<Route
					path='/admin/user/:id/edit'
					component={UserEditPage}
				/>
				<Route
					path='/admin/productlist'
					exact
					component={ProductListPage}
				/>
				<Route
					path='/admin/productlist/:pageNumber'
					component={ProductListPage}
					exact
				/>
				<Route
					path='/admin/product/:id/edit'
					component={ProductEditPage}
				/>
				<Route
					path='/admin/orderlist'
					component={OrderListPage}
					exact
				/>
				<Route
					path='/admin/orderlist/:pageNumber'
					component={OrderListPage}
					exact
				/>
				<Route component={ErrorPage} />
			</Switch>
		</Router>
	);
};

export default App;
