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
    web_media: [...data.web_media].sort((a, b) => a.order - b.order),
    web_students: [...data.web_students].sort((a, b) => a.order - b.order),
    web_teachers: [...data.web_teachers].sort((a, b) => a.order - b.order),
  };
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

      const response = await axios.post<WebData>(baseURL);
      if (response.status !== 201 || !response.data) {
        throw new Error("Invalid API response.");
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
