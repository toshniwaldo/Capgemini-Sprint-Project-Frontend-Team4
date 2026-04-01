package com.example.ProjectSprintFrontend.dto;

import lombok.Data;

@Data
public class OrderDetailDTO {
    private String productName;
    private int orderNumber;
    private int quantityOrdered;
    private double priceEach;
    private double totalPrice;
}