import { create } from "zustand";
import { WebData } from "@/types/web";
import axios from "axios";

interface WebDataState {
  webData: WebData | null;
  loading: boolean;
  error: string | null;
  fetchWebData: () => Promise<void>;
}

const sortWebData = (data: WebData) => {
  return {
    ...data,
    web_media: data.web_media
      ? [...data.web_media].sort((a, b) => a.order - b.order)
      : [],
    web_students: data.web_students
      ? [...data.web_students].sort((a, b) => a.order - b.order)
      : [],
    web_teachers: data.web_teachers
      ? [...data.web_teachers].sort((a, b) => a.order - b.order)
      : [],
  } as WebData;
};

const useWebDataStore = create<WebDataState>((set) => ({
  webData: null,
  loading: true,
  error: null,
  fetchWebData: async () => {
    set({ loading: true, error: null });

    try {
      const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
      if (!baseURL) {
        throw new Error("Base URL is not configured.");
      }

      // Use GET instead of POST to fetch the data
      const response = await axios.get<WebData>(baseURL);

      // Treat any 2xx status code as a successful response
      if (response.status < 200 || response.status >= 300 || !response.data) {
        throw new Error(`Unexpected API response. Status: ${response.status}`);
      }

      const result = sortWebData(response.data);
      set({ webData: result, loading: false });
    } catch (error) {
      console.error("Failed to fetch web data:", error);
      set({ webData: null, loading: false, error: String(error) });
    }
  },
}));

export default useWebDataStore;
