package com.monbo.bpm.common;

import lombok.Getter;

/**
 * 业务异常，带错误码。
 * 4xx: 客户端参数错误；5xx: 服务端内部错误。
 */
@Getter
public class BusinessException extends RuntimeException {

    private final int code;

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }

    public BusinessException(int code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }

    // ---- 快捷工厂方法 ----

    public static BusinessException bad(String message) {
        return new BusinessException(400, message);
    }

    public static BusinessException notFound(String message) {
        return new BusinessException(404, message);
    }

    public static BusinessException server(String message) {
        return new BusinessException(500, message);
    }

    public static BusinessException server(String message, Throwable cause) {
        return new BusinessException(500, message, cause);
    }
}
