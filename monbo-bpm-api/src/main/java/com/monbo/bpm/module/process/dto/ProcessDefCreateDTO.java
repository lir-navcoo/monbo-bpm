package com.monbo.bpm.module.process.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProcessDefCreateDTO {

    @NotBlank(message = "流程Key不能为空")
    private String processKey;

    @NotBlank(message = "流程名称不能为空")
    private String processName;

    private String description;

    private String category;

    @NotBlank(message = "BPMN XML不能为空")
    private String bpmnXml;

    private String svgXml;
}
