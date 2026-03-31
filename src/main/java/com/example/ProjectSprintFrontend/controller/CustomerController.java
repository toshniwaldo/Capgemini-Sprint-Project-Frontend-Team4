package com.example.ProjectSprintFrontend.controller;

import com.example.ProjectSprintFrontend.dto.requestdto.CustomerEditDTO;
import com.example.ProjectSprintFrontend.dto.responsedto.CustomerResponseDTO;
import com.example.ProjectSprintFrontend.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    // =========================
    // LIST PAGE
    // =========================
    @GetMapping("/customers")
    public String getCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) String keyword,
            Model model) {

        int size = 12;
        CustomerResponseDTO response;

        if (keyword != null && !keyword.isEmpty()) {
            response = customerService.searchCustomers(keyword, page, size);
            model.addAttribute("keyword", keyword);
        } else {
            response = customerService.getCustomersPage(page, size);
        }

        model.addAttribute("customers",
                response.getEmbedded().getCustomers());

        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages",
                response.getPage().getTotalPages());

        return "customers";
    }

    // =========================
    // EDIT PAGE
    // =========================
    @GetMapping("/customers/edit/{id}")
    public String showEditForm(@PathVariable Integer id, Model model) {

        CustomerEditDTO customer = customerService.getCustomerEditById(id);

        model.addAttribute("customer", customer);

        return "edit-customer";
    }
}