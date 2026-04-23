package com.monbo.bpm.module.engine.service;

import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.BpmPlatform;
import org.camunda.bpm.engine.ProcessEngine;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Slf4j
@Service
public class CamundaEngineService {

    @PostConstruct
    public void init() {
        ProcessEngine engine = BpmPlatform.getDefaultProcessEngine();
        if (engine != null) {
            log.info("Camunda BPMN Engine 初始化完成");
        } else {
            log.warn("Camunda BPMN Engine 未找到默认实例");
        }
    }
}
