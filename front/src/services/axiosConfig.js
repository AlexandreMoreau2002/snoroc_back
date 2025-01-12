// front/src/services/axiosConfig.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // Nouveau nom pour l'URL de l'API
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Erreur API :', error);
        return Promise.reject(error);
    }
);

export default axiosInstance;
