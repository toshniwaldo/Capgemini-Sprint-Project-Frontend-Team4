package com.example.ProjectSprintFrontend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/product-lines")
public class ProductLineController {
    // Serves the main Product Lines dashboard
    @GetMapping("")
    public String renderDashboard() {
        return "product-lines/index";
    }

    // Serves the View Products page
    @GetMapping("/products")
    public String renderProductsPage() {
        return "product/index";
    }
}
