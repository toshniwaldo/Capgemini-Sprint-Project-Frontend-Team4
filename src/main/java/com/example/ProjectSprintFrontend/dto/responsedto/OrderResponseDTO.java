package com.example.ProjectSprintFrontend.dto.responsedto;
import com.example.ProjectSprintFrontend.dto.OrderListDTO;
import com.example.ProjectSprintFrontend.dto.PageDTO;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class OrderResponseDTO {

    @JsonProperty("_embedded")
    private EmbeddedOrders embedded;

    private PageDTO page;

    @Data
    public static class EmbeddedOrders {
        @JsonProperty("orders")
        private List<OrderListDTO> orders;
    }
}
