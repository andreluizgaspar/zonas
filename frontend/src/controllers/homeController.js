import { useState, useEffect } from "react";
import HomeModel from "../model/homeModel";
import HomePage from "../pages/HomePage";

const HomeController = ({ match, history }) => {
    const [msgs, setMsgs] = useState([{
        type: "system",
        content: 'Ola! Use o google maps para regiao blabla ou envie uma msg contendo a regiao',
    }]);
    const [showSidebar, setShowSidebar] = useState(false);
    const [initial, setInitial] = useState(true);

    useEffect(() => {
        setInitial(false);
    }, []);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo')
        if (!userInfo) {
            history.push('/login')
        } else {
            setInitial(false)
        }
    }, [history])

    const handleToggleSidebar = () => {
        setShowSidebar((prevShowSidebar) => !prevShowSidebar);
    };

    const formatResponseInfo = (data) => {
        return `Zone: ${data.zone}
                Data Mínima: ${data.dataMinima}
                Frente Mínima: ${data.frenteMinima}
                Profundidade Mínima: ${data.profundidadeMinima}
                Taxa Ocupação Máxima (Térreo): ${data.taxaOcupacaoMaxima.terreo}
                Taxa Ocupação Máxima (Demais Pavimentos): ${data.taxaOcupacaoMaxima.demaisPavimentos}
                Coeficiente Aproveitamento Mínimo: ${data.coeficienteAproveitamentoMinimo}
                Coeficiente Aproveitamento Máximo: ${data.coeficienteAproveitamentoMaximo}
                Coeficiente Aproveitamento Básico: ${data.coeficienteAproveitamentoBasico}
                Altura Máxima: ${data.alturaMaxima}
                Recuo Mínimo: ${data.recuoMinimo}
                Área Permeabilização: ${data.areaPermeabilizacao}`;
    }

    const handleSendMsg = (msg) => {
        const userMsg = { type: "user", content: msg };
        setMsgs((prevMsgs) => [...prevMsgs, userMsg]);

        if (!msg.toLocaleLowerCase().includes('londrina')) {
            msg += ', Londrina'
        }
        console.log(msg)

        const homeModel = new HomeModel();
        homeModel.sendQuery(msg).then((data) => {
            console.log('data')
            console.log(data)
            if (data.error === undefined) {
                const info = formatResponseInfo(data)
                const systemMsg = {
                    type: "system",
                    content: info,
                };
                setMsgs((prevMsgs) => [...prevMsgs, systemMsg]);
            } else {
                const errorMsg = { type: "system", content: data.error };
                setMsgs((prevMsgs) => [...prevMsgs, errorMsg]);
            }
        });
    };

    return (
        <div>
            <div
                className={`sidebar ${showSidebar ? "open" : ""} ${initial ? "initial" : ""
                    }`}
            >
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
    );
};

export default HomeController;