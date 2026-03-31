package com.example.ProjectSprintFrontend.dto.requestdto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CustomerEditDTO {

    private Integer customerNumber;
    private String customerName;

    private String contactFirstName;
    private String contactLastName;

    private String phone;

    private String addressLine1;
    private String addressLine2;

    private String city;
    private String country;

    private BigDecimal creditLimit;
}
