class HomeModel {
    constructor() {

    }

    sendQuery(query) {
        return fetch('http://localhost:3001/api/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: query })
        })
            .then(response => {
                return response.json();
            })
    }
}

export default HomeModel