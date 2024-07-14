import { useState, useEffect } from "react"
import HomePage from "../pages/HomePage"

const HomeController = ({ match, history }) => {
    const [msgs, setMsgs] = useState([])
    const [showSidebar, setShowSidebar] = useState(false)
    const [initial, setInitial] = useState(true)

    useEffect(() => {
        setInitial(false)
    }, [])

    const handleToggleSidebar = () => {
        setShowSidebar(prevShowSidebar => !prevShowSidebar)
    }

    const handleSendMsg = (msg) => {
        setMsgs([...msgs, msg])
    }

    return (
        <div>
            <div className={`sidebar ${showSidebar ? 'open' : ''} ${initial ? 'initial' : ''}`}>
                <h2>Sidebar</h2>
                <button className="neumorphic-button">Button 1</button>
                <button className="neumorphic-button">Button 2</button>
                <button className="neumorphic-button">Button 3</button>
            </div>
            <HomePage
                match={match}
                history={history}
                sendMsg={handleSendMsg}
                msgs={msgs}
                toggleSidebar={handleToggleSidebar}
                isSidebarOpen={showSidebar}
            />
        </div>
    )
}

export default HomeController
