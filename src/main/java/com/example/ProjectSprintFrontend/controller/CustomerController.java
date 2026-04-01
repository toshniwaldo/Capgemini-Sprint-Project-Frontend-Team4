package com.example.ProjectSprintFrontend.controller;

import com.example.ProjectSprintFrontend.dto.requestdto.CustomerEditDTO;
import com.example.ProjectSprintFrontend.dto.responsedto.CustomerResponseDTO;
import com.example.ProjectSprintFrontend.dto.responsedto.OrderResponseDTO;
import com.example.ProjectSprintFrontend.dto.responsedto.PaymentResponseDTO;
import com.example.ProjectSprintFrontend.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    //ADD PAGE

    @GetMapping("/customers/add")
    public String showAddForm(Model model) {

        model.addAttribute("customer", new CustomerEditDTO());

        model.addAttribute("employees",
                customerService.getAllEmployees()); // NEW

        return "add-customer";
    }

    @GetMapping("/customers/view/{id}")
    public String viewCustomerData(
            @PathVariable Integer id,
            @RequestParam(defaultValue = "orders") String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "desc") String sort,
            Model model) {

        int size = 10;

        if (type.equals("payments")) {

            PaymentResponseDTO response =
                    customerService.getPaymentsByCustomer(id, page, size);

            model.addAttribute("payments",
                    response.getEmbedded() != null ? response.getEmbedded().getPayments() : List.of());

            model.addAttribute("totalPages",
                    response.getPage() != null ? response.getPage().getTotalPages() : 1);

        } else {

            OrderResponseDTO response =
                    customerService.getOrdersByCustomer(id, page, size, sort);

            model.addAttribute("orders",
                    response.getEmbedded() != null ? response.getEmbedded().getOrders() : List.of());

            model.addAttribute("totalPages",
                    response.getPage() != null ? response.getPage().getTotalPages() : 1);
        }

        model.addAttribute("currentPage", page);   // ✅ CRITICAL FIX
        model.addAttribute("type", type);
        model.addAttribute("customerId", id);
        model.addAttribute("sort", sort);          // ✅ needed for UI state

        return "customer-data";
    }

}