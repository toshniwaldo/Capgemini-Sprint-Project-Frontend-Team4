package com.example.ProjectSprintFrontend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CustomerDTO {

    private Integer customerNumber;
    private String customerName;
    private String contactName;
    private String phone;
    private String address;
    private String city;
    private String country;
    private BigDecimal creditLimit;
}
