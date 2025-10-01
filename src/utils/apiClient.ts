import axios from 'axios';
import { auth } from '../firebase/config';

const apiClient = axios.create({
  baseURL: 'https://my-flask-app-service-309448793861.us-central1.run.app',
});

apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
