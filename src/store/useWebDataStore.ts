import { WebData } from "@/types/web";
import data from "../../public/data.json";

interface WebDataState {
  webData: WebData | null;
  loading: boolean;
  error: string | null;
}

const useWebDataStore = (): WebDataState => {
  const sortedData = {
    ...data,
    web_media: [...data.web_media].sort((a, b) => a.order - b.order),
    web_students: [...data.web_students].sort((a, b) => a.order - b.order),
    web_teachers: [...data.web_teachers].sort((a, b) => a.order - b.order),
  };
  return { webData: sortedData as WebData, loading: false, error: null };
};

export default useWebDataStore;
