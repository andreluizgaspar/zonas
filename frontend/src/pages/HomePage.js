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
import './home.css'

const HomePage = ({ match, history, sendMsg, msgs }) => {
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

	const handleSendMsg = () => {
		setQuery('')
		sendMsg(query)
	}

	const handleKeyPress = (event) => {
		if (event.key === 'Enter') {
			handleSendMsg()
		}
	}

	const handleInputOnChange = (value) => {
		setQuery(value)
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
	const [query, setQuery] = useState('');
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
		console.log(msgs)
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
		setPromptVerification(
			localStorage.getItem('promptEmailVerfication') === 'true'
				? true
				: false
		);
	}, []);

	return (
		<>
			<div className='container'>
				<div class="sidebar">
					<h2>Sidebar</h2>
					<button class="neumorphic-button">Button 1</button>
					<button class="neumorphic-button">Button 2</button>
					<button class="neumorphic-button">Button 3</button>
				</div>
				<div class="chat-container">
					<div class="chat-header">
						<h1>Neumorphic Chat</h1>
						<div class="control-panel">
							<button class="neumorphic-button" id="micButton" aria-label="Toggle Voice Input">
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
							</button>
							<button class="neumorphic-button" id="darkModeToggle" aria-label="Toggle Dark Mode">
								<svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
								<svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
							</button>
						</div>
					</div>
					<div class="chat-messages" id="chatMessages">
						{
							msgs.map(msg => {
								return <p>{msg}</p>
							}
							)
						}
					</div>
					<div class="chat-input">
						<input type="text" id="messageInput" onKeyPress={handleKeyPress} onChange={(e) => { handleInputOnChange(e.target.value) }} value={query} placeholder="Type your message..." />
						<button class="neumorphic-button send-button" onClick={handleSendMsg}>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default HomePage;

//			<GoogleMapReact
//				bootstrapURLKeys={{ key: "AIzaSyAr1Yvl5beQkFsjeA4tYOq4uCNP4b3f1bQ" }}
//				defaultCenter={center}
//				defaultZoom={zoom}
//			>
//				<button
//					lat={59.955413}
//					lng={30.337844}
//					text="My Marker"
//				>test</button>
//			</GoogleMapReact>