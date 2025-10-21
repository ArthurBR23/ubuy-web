const get_url = () => {
    const PROTOCOL = window.location.protocol;
    const HOSTNAME = window.location.hostname;
    const PORT = "5983";
    const BASE_URL = `${PROTOCOL}//${HOSTNAME}`;
    const SERVER_URL = `${BASE_URL}:${PORT}`;
    return SERVER_URL;
}


export default {
    get_url,
};
