import { useState, useEffect } from "react";
import LoginPage from "../pages/LoginPage";

const LoginController = ({ location, history }) => {
    useEffect(() => {
    }, []);

    return (
        <LoginPage
            location={location}
            history={history}
        />
    );
};

export default LoginController;