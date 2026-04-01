package com.example.ProjectSprintFrontend.dto;

public class AnalyticsDto {

    private String productLine;
    private long totalSold;
    private String color;
    private double percentage;

    public AnalyticsDto() {}

    public AnalyticsDto(String productLine, long totalSold, String color, double percentage) {
        this.productLine = productLine;
        this.totalSold = totalSold;
        this.color = color;
        this.percentage = percentage;
    }

    public String getProductLine() { return productLine; }
    public void setProductLine(String productLine) { this.productLine = productLine; }

    public long getTotalSold() { return totalSold; }
    public void setTotalSold(long totalSold) { this.totalSold = totalSold; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public double getPercentage() { return percentage; }
    public void setPercentage(double percentage) { this.percentage = percentage; }
}
