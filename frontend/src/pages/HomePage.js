import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Product from '../components/Product';
import Paginate from '../components/Paginate';
import { Row, Col } from 'react-bootstrap';
import ProductCarousel from '../components/ProductCarousel';
import Meta from '../components/Meta';
import { listProducts } from '../actions/productActions';
import { refreshLogin, getUserDetails } from '../actions/userActions';
import Message from '../components/Message';
import SearchBox from '../components/SearchBox';
import ProductSkeleton from '../components/ProductSkeleton';
import GoogleMapReact from 'google-map-react';

const HomePage = ({ match, history }) => {
	function getUserLocation() {
		return new Promise((resolve, reject) => {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					(position) => {
						const { latitude, longitude } = position.coords;
						resolve({ lat: latitude, lng: longitude });
					},
					(error) => reject(error)
				);
			} else {
				reject(new Error("Geolocation not supported by this browser."));
			}
		});
	}

	const defaultProps = {
		center: {
			lat: 10.99835602,
			lng: 77.01502627
		},
		zoom: 11
	};
	const keyword = match.params.keyword;
	const pageNumber = Number(match.params.pageNumber) || 1;
	const [promptVerfication, setPromptVerification] = useState(false);
	const [products, setProducts] = useState(null);
	const [productAvailable, setProductAvailable] = useState(false);
	const dispatch = useDispatch();

	const productList = useSelector((state) => state.productList);
	let { loading, error, pages } = productList;

	const userLogin = useSelector((state) => state.userLogin);
	const { userInfo } = userLogin;

	const userDetails = useSelector((state) => state.userDetails);
	const { error: userInfoError } = userDetails;

	const [center, setCenter] = useState({ lat: 0, lng: 0 });
	const [zoom, setZoom] = useState(11);

	useEffect(() => {
		getUserLocation()
			.then((coords) => {
				setCenter(coords);
			})
			.catch((error) => {
				console.error("Error fetching user location:", error);
				setCenter({ lat: 37.7749, lng: -122.4194 });
			});
	}, []);

	useEffect(() => {
		userInfo
			? userInfo.isSocialLogin
				? dispatch(getUserDetails(userInfo.id))
				: dispatch(getUserDetails('profile'))
			: dispatch(getUserDetails('profile'));
	}, [userInfo, dispatch]);

	useEffect(() => {
		if (userInfoError && userInfo && !userInfo.isSocialLogin) {
			const user = JSON.parse(localStorage.getItem('userInfo'));
			dispatch(refreshLogin(user?.email));
		}
	}, [userInfoError, dispatch, userInfo]);

	useEffect(() => {
		if (products) {
			products.length
				? setProductAvailable(true)
				: setProductAvailable(false);
		}
	}, [products]);

	useEffect(() => {
		if (productList) {
			if (productList.products) setProducts([...productList.products]);
		}
	}, [productList]);

	useEffect(() => {
		dispatch(listProducts(keyword, pageNumber));
	}, [dispatch, keyword, pageNumber]);

	useEffect(() => {
		setPromptVerification(
			localStorage.getItem('promptEmailVerfication') === 'true'
				? true
				: false
		);
	}, []);

	return (
		<>
			<Meta />
			<div className='d-block d-md-none'>
				<SearchBox history={history} />
			</div>

			{promptVerfication ? (
				<Message dismissible variant='info' duration={10}>
					Account Created! Please check your email to verify your
					account and start shopping.
				</Message>
			) : null}

			{error ? (
				<Message dismissible variant='danger' duration={10}>
					{error}
				</Message>
			) : !loading &&
			<div style={{ height: '100vh', width: '100%' }}>
				<GoogleMapReact
					bootstrapURLKeys={{ key: "AIzaSyAr1Yvl5beQkFsjeA4tYOq4uCNP4b3f1bQ" }}
					defaultCenter={center}
					defaultZoom={zoom}
				>
					<button
						lat={59.955413}
						lng={30.337844}
						text="My Marker"
					>test</button>
				</GoogleMapReact>
			</div>
			}
		</>
	);
};

export default HomePage;
