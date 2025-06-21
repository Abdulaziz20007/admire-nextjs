import { useState, useCallback } from 'react';
import apiClient from '@/lib/api-client';

interface ApiState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

/**
 * Custom hook for making authenticated API requests with automatic token refresh
 */
export const useApi = <T = any>(options: UseApiOptions = {}) => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const { onSuccess, onError } = options;

  const execute = useCallback(
    async (
      method: 'get' | 'post' | 'put' | 'delete',
      url: string,
      data?: any,
      config?: any
    ) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        let response;
        
        switch (method) {
          case 'get':
            response = await apiClient.get<T>(url, config);
            break;
          case 'post':
            response = await apiClient.post<T>(url, data, config);
            break;
          case 'put':
            response = await apiClient.put<T>(url, data, config);
            break;
          case 'delete':
            response = await apiClient.delete<T>(url, config);
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }

        if (response.success) {
          setState({
            data: response.data || null,
            loading: false,
            error: null,
          });
          
          if (onSuccess) {
            onSuccess(response.data);
          }
          
          return response;
        } else {
          const errorMessage = response.error || 'Request failed';
          setState({
            data: null,
            loading: false,
            error: errorMessage,
          });
          
          if (onError) {
            onError(errorMessage);
          }
          
          return response;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });
        
        if (onError) {
          onError(errorMessage);
        }
        
        throw error;
      }
    },
    [onSuccess, onError]
  );

  // Convenience methods
  const get = useCallback((url: string, config?: any) => 
    execute('get', url, undefined, config), [execute]);
  
  const post = useCallback((url: string, data?: any, config?: any) => 
    execute('post', url, data, config), [execute]);
  
  const put = useCallback((url: string, data?: any, config?: any) => 
    execute('put', url, data, config), [execute]);
  
  const del = useCallback((url: string, config?: any) => 
    execute('delete', url, undefined, config), [execute]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    get,
    post,
    put,
    delete: del,
    reset,
  };
};

/**
 * Hook for making a single API request with loading state
 */
export const useApiCall = <T = any>(options: UseApiOptions = {}) => {
  const api = useApi<T>(options);
  
  return {
    ...api,
    call: api.execute,
  };
};

export default useApi;
