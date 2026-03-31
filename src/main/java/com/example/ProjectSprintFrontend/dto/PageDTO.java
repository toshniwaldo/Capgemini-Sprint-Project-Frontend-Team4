package com.example.ProjectSprintFrontend.dto;

import lombok.Data;

@Data
public class PageDTO {
    private int size;
    private int totalElements;
    private int totalPages;
    private int number;
}
