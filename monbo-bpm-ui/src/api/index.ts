import axios from "axios";
import { useAuthStore } from '@/store/auth';

//创建axios实例
const instance = axios.create({
    baseURL: "http://101.126.89.23", //根路径
    timeout: 20000 //请求过期时间
})

//请求拦截器 - 添加token
instance.interceptors.request.use(
    config => {
        const token = useAuthStore.getState().token
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    err => Promise.reject(err)
)

//响应拦截器
instance.interceptors.response.use(
    res => res.data,
    err => Promise.reject(err)
)

export default instance
