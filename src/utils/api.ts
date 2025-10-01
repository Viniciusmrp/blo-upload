import apiClient from './apiClient';

export const api = {
  checkVideoStatus: async (videoName: string) => {
    try {
      const response = await apiClient.get(`/video-status/${videoName}`);
      return response.data;
    } catch (error) {
      console.error('Error checking video status:', error);
      return null;
    }
  },

  getExerciseAnalysis: async (videoId: string) => {
    try {
      const response = await apiClient.get(`/exercise-analysis/${videoId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting exercise analysis:', error);
      return null;
    }
  },

  saveVideoInfo: async (data: any) => {
    try {
      const response = await apiClient.post(`/save-video-info`, data);
      return response.data;
    } catch (error) {
      console.error('Error saving video info:', error);
      return null;
    }
  },

  getSignedUrl: async (fileName: string) => {
    try {
      const response = await apiClient.post(`/generate-signed-url`, { file_name: fileName });
      return response.data;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }
  },

  getUserVideos: async () => {
    try {
      const response = await apiClient.get(`/get-user-videos`);
      return response.data;
    } catch (error) {
      console.error('Error getting user videos:', error);
      return null;
    }
  }
};