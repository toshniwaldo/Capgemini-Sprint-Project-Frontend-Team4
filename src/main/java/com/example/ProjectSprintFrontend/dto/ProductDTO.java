package com.example.ProjectSprintFrontend.dto;

import lombok.Data;

@Data
public class ProductDTO {
    private String productName;
    private String productVendor;
    private String productLine;
    private int quantityInStock;
    private double buyPrice;
    private double MSRP;
}