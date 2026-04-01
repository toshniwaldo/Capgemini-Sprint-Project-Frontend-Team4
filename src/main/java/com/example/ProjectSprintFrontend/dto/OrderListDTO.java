package com.example.ProjectSprintFrontend.dto;

import lombok.Data;
import lombok.Setter;

import java.time.LocalDate;

@Data
public class OrderListDTO {

    private LocalDate orderDate;
    private LocalDate requiredDate;
    private LocalDate shippedDate;

    private String status;
    private String comments;

    // NEW derived fields (if you add in backend)
    private String deliveryTimeline;

}
