import axios from "axios";
import { toast } from "sonner";

// ============ 通用 ============
export function toastSuccess(message: string) {
  toast.success(message);
}

export function toastError(message: string) {
  toast.error(message);
}

export function toastInfo(message: string) {
  toast.info(message);
}

// ============ API 错误 ============
export function toastApiError(error: unknown, fallback = "操作失败") {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    // 后端 {code, message, data} 格式
    if (data?.message) {
      toast.error(data.message);
      return;
    }
    toast.error(error.message || fallback);
    return;
  }
  toast.error(fallback);
}

// ============ 异步操作封装 ============
export async function toastPromise<T>(
  promise: Promise<T>,
  messages: { loading: string; success: string; error: string }
): Promise<T> {
  // @ts-ignore - toast.promise 类型较复杂
  return toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
  }) as Promise<T>;
}
