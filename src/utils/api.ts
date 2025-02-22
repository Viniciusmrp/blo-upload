import axios from 'axios';

const BASE_URL = 'https://my-flask-app-service-309448793861.us-central1.run.app';

export const api = {
  checkVideoStatus: async (videoName: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/video-status/${videoName}`);
      return response.data;
    } catch (error) {
      console.error('Error checking video status:', error);
      return null;
    }
  },

  getExerciseAnalysis: async (videoId: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/exercise-analysis/${videoId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting exercise analysis:', error);
      return null;
    }
  },

  saveVideoInfo: async (data: any) => {
    try {
      const response = await axios.post(`${BASE_URL}/save-video-info`, data);
      return response.data;
    } catch (error) {
      console.error('Error saving video info:', error);
      return null;
    }
  },

  getSignedUrl: async (fileName: string) => {
    try {
      const response = await axios.post(`${BASE_URL}/generate-signed-url`, { file_name: fileName });
      return response.data;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }
  }
}; 