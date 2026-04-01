package com.example.ProjectSprintFrontend.dto.responsedto;

import com.example.ProjectSprintFrontend.dto.PaymentDTO;
import com.example.ProjectSprintFrontend.dto.PageDTO;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class PaymentResponseDTO {

    @JsonProperty("_embedded")
    private EmbeddedPayments embedded;

    private PageDTO page;

    @Data
    public static class EmbeddedPayments {

        @JsonProperty("payments")  // VERY IMPORTANT (matches SDR response)
        private List<PaymentDTO> payments;
    }
}