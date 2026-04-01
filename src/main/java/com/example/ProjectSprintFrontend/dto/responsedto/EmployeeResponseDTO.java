package com.example.ProjectSprintFrontend.dto.responsedto;

import com.example.ProjectSprintFrontend.dto.EmployeeListDTO;
import com.example.ProjectSprintFrontend.dto.PageDTO;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class EmployeeResponseDTO {

    @JsonProperty("_embedded")
    private EmbeddedEmployees embedded;

    private PageDTO page;

    @Data
    public static class EmbeddedEmployees {

        @JsonProperty("employees")
        private List<EmployeeListDTO> employees;
    }
}