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

const HomePage = ({ match, history, sendMsg, msgs, toggleSidebar, isSidebarOpen }) => {
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

	const handleCloseSidebar = () => {
		if (isSidebarOpen) {
			toggleSidebar()
		}
	}

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
		setPromptVerification(
			localStorage.getItem('promptEmailVerfication') === 'true'
				? true
				: false
		);
	}, []);

	return (
		<>
			<div className='container' onMouseEnter={handleCloseSidebar} onClick={handleCloseSidebar}>
				<div className='chat-container'>
					<div class="chat-header">
						<h1>Neumorphic Chat</h1>
					</div>
					<div class="chat-messages" id="chatMessages">
						{msgs.map((msg, index) => (
							<div key={index} className={`message ${msg.type}`}>
								{msg.content}
							</div>
						))}
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