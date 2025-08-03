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

      // Make a POST request to fetch the data (the backend is implemented on POST)
      const response = await axios.post<WebData | WebData[]>(baseURL);

      // Treat any 2xx status code as a successful response
      if (response.status < 200 || response.status >= 300 || !response.data) {
        throw new Error(`Unexpected API response. Status: ${response.status}`);
      }

      // The API sometimes wraps the payload in an array – unwrap if needed
      const payload: WebData = Array.isArray(response.data)
        ? (response.data[0] as WebData)
        : (response.data as WebData);

      let result = sortWebData(payload);

      // Fallback: if media / students / teachers / socials are missing, load static JSON from /data.json
      const needsFallback =
        !result.web_media ||
        result.web_media.length === 0 ||
        !result.web_students ||
        result.web_students.length === 0 ||
        !result.web_teachers ||
        result.web_teachers.length === 0 ||
        !result.web_socials ||
        result.web_socials.length === 0;

      if (needsFallback) {
        try {
          const staticRes = await axios.get<WebData>("/data.json");
          if (
            staticRes.status >= 200 &&
            staticRes.status < 300 &&
            staticRes.data
          ) {
            // merge arrays from static data if they're missing
            const staticData = staticRes.data;
            result = {
              ...result,
              web_media:
                result.web_media && result.web_media.length > 0
                  ? result.web_media
                  : staticData.web_media,
              web_students:
                result.web_students && result.web_students.length > 0
                  ? result.web_students
                  : staticData.web_students,
              web_teachers:
                result.web_teachers && result.web_teachers.length > 0
                  ? result.web_teachers
                  : staticData.web_teachers,
              web_socials:
                result.web_socials && result.web_socials.length > 0
                  ? result.web_socials
                  : staticData.web_socials,
            } as WebData;
          }
        } catch (e) {
          console.warn("Failed to load static fallback data", e);
        }
      }

      set({ webData: result, loading: false });
    } catch (error) {
      console.error("Failed to fetch web data:", error);
      set({ webData: null, loading: false, error: String(error) });
    }
  },
}));

export default useWebDataStore;
