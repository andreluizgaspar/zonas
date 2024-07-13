import { useState, useEffect } from "react"
import HomePage from "../pages/HomePage"

const HomeController = ({ match, history }) => {
    const [msgs, setMsgs] = useState([])

    const handleSendMsg = (msg) => {
        setMsgs([...msgs, msg])
        console.log(msg)
    }

    useEffect(() => {
    }, [])

    return <HomePage match={match} history={history} sendMsg={handleSendMsg} msgs={msgs} />
}

export default HomeController