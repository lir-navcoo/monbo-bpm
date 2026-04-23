package com.monbo.bpm;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.monbo.bpm.module.*.mapper")
public class MonboBpmApplication {

    public static void main(String[] args) {
        SpringApplication.run(MonboBpmApplication.class, args);
    }
}
