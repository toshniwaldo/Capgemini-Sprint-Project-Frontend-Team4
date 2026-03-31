package com.example.ProjectSprintFrontend.dto.responsedto;

import com.example.ProjectSprintFrontend.dto.CustomerDTO;
import com.example.ProjectSprintFrontend.dto.PageDTO;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
public class CustomerResponseDTO {

    @JsonProperty("_embedded")   //IMPORTANT FIX
    private EmbeddedCustomers embedded;

    private PageDTO page;

    @Data
    public static class EmbeddedCustomers {

        @JsonProperty("customers")   //explicit mapping
        private List<CustomerDTO> customers;
    }
}