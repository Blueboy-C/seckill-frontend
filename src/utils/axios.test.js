import axios from 'axios';
import instance from './axios';

jest.mock('axios');

describe('axios instance', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock localStorage
        global.localStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn(),
        };
        // Mock window.location
        delete window.location;
        window.location = { href: '' };
    });

    it('should set baseURL, timeout, headers, and withCredentials', () => {
        expect(instance.defaults.baseURL).toBe('http://localhost:8080');
        expect(instance.defaults.timeout).toBe(10000);
        expect(instance.defaults.headers['Content-Type']).toBe('application/json');
        expect(instance.defaults.withCredentials).toBe(true);
    });

    it('should add Authorization header if token exists in localStorage', async () => {
        global.localStorage.getItem.mockReturnValue('test-token');
        const config = { headers: {} };
        const requestInterceptor = axios.create.mock.calls[0][0].transformRequest?.[0] || instance.interceptors.request.handlers[0].fulfilled;
        const newConfig = await requestInterceptor({ ...config });
        expect(newConfig.headers.Authorization).toBe('Bearer test-token');
    });

    it('should not add Authorization header if token does not exist', async () => {
        global.localStorage.getItem.mockReturnValue(null);
        const config = { headers: {} };
        const requestInterceptor = axios.create.mock.calls[0][0].transformRequest?.[0] || instance.interceptors.request.handlers[0].fulfilled;
        const newConfig = await requestInterceptor({ ...config });
        expect(newConfig.headers.Authorization).toBeUndefined();
    });

    it('should return response.data in response interceptor', async () => {
        const response = { data: { foo: 'bar' } };
        const responseInterceptor = instance.interceptors.response.handlers[0].fulfilled;
        expect(responseInterceptor(response)).toEqual({ foo: 'bar' });
    });

    it('should redirect to /login on 401 error', async () => {
        const error = { response: { status: 401 } };
        const responseErrorInterceptor = instance.interceptors.response.handlers[0].rejected;
        try {
            await responseErrorInterceptor(error);
        } catch (e) {
            // expected
        }
        expect(window.location.href).toBe('/login');
    });

    it('should reject promise for non-401 errors', async () => {
        const error = { response: { status: 500 } };
        const responseErrorInterceptor = instance.interceptors.response.handlers[0].rejected;
        await expect(responseErrorInterceptor(error)).rejects.toBe(error);
        expect(window.location.href).not.toBe('/login');
    });
});