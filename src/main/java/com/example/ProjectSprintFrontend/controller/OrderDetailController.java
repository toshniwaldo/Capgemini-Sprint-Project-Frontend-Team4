package com.example.ProjectSprintFrontend.controller;

import com.example.ProjectSprintFrontend.service.OrderDetailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@Controller
public class OrderDetailController {

    @Autowired
    private OrderDetailService orderService;

    @GetMapping("/orderdetails")
    public String orders(
            @RequestParam String productCode,
            @RequestParam(defaultValue = "0") int page,
            Model model
    ) {

        Map<String, Object> data = orderService.getOrders(productCode, page);

        List<Map<String, Object>> orders = (List<Map<String, Object>>) ((Map) data.get("_embedded")).values().iterator().next();

        model.addAttribute("orders", orders);
        model.addAttribute("pageData", data.get("page"));
        model.addAttribute("productCode", productCode);
        model.addAttribute("totalOrders", ((Map)data.get("page")).get("totalElements"));

        model.addAttribute("page", "Order Details");

        return "orderdetails";
    }
}
