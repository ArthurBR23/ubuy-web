import axios from 'axios';
import helpers from '../utils/helpers'
const API_URL = helpers.get_url();

const auth = async (user, pass) => {
    const response = await axios.post(`${API_URL}/api/login`, { user, pass }, {
        withCredentials: true,
    });
    return response;
}
const verify2fa = async (tempToken, token) => {
    const user = localStorage.getItem('user');
    const response = await axios.post(`${API_URL}/api/verify-2fa`, { user, token }, {
        withCredentials: true,
    });
    return response;
}
const gerarNovo2FA = async () => {
    const user = localStorage.getItem('user');
    const response = await axios.post(`${API_URL}/api/recuperar-2fa`, { user }, {
        withCredentials: true,
    });
    return response;
}
export default {
    auth,
    verify2fa,
    gerarNovo2FA
};

