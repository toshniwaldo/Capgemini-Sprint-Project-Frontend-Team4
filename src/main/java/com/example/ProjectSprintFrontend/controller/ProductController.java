package com.example.ProjectSprintFrontend.controller;

import com.example.ProjectSprintFrontend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public String products(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String line,
            @RequestParam(required = false) String vendor,
            Model model
    ) {

        Map<String, Object> data = productService.searchProducts(name, line, vendor, page);

        Map<String, Object> embedded = (Map<String, Object>) data.get("_embedded");
        List<Map<String, Object>> products = embedded != null
                ? (List<Map<String, Object>>) embedded.get("products")
                : new ArrayList<>();

        // extract productId from _links.self.href
        for (Map<String, Object> p : products) {

            Map<String, Object> links = (Map<String, Object>) p.get("_links");

            if (links != null && links.get("self") != null) {

                Map<String, Object> self = (Map<String, Object>) links.get("self");
                String href = (String) self.get("href");

                if (href != null && href.contains("/")) {
                    String id = href.substring(href.lastIndexOf("/") + 1);
                    p.put("productId", id);
                }
            }
        }

        model.addAttribute("products", products);
        model.addAttribute("pageData", data.get("page"));
        model.addAttribute("page", "Products");

        return "products";
    }

    @GetMapping("/update/{id}")
    public String updatePage(@PathVariable String id, Model model) {

        Map<String, Object> product = productService.getProduct(id);

        Map<String, Object> links = (Map<String, Object>) product.get("_links");
        Map<String, Object> productLineLink = (Map<String, Object>) links.get("productLine");

        String productLineName = "";

        if (productLineLink != null) {

            String href = (String) productLineLink.get("href");

            // ✅ CALL THIS URL
            Map<String, Object> productLineData = productService.getRaw(href);

            // 🔥 extract from returned link
            Map<String, Object> plLinks = (Map<String, Object>) productLineData.get("_links");
            Map<String, Object> self = (Map<String, Object>) plLinks.get("self");

            String selfHref = (String) self.get("href");

            String raw = selfHref.substring(selfHref.lastIndexOf("/") + 1);

            productLineName = java.net.URLDecoder.decode(raw, java.nio.charset.StandardCharsets.UTF_8);
        }

        model.addAttribute("product", product);
        model.addAttribute("productId", id);
        model.addAttribute("productLineName", productLineName);
        model.addAttribute("page", "Update Product");

        return "update-product";
    }

    @PostMapping("/update/{id}")
    public String update(@PathVariable String id, @RequestParam Map<String, String> form) {

        // 🔥 VALIDATION
        if (isEmpty(form.get("productName")) ||
            isEmpty(form.get("productVendor")) ||
            isEmpty(form.get("quantityInStock")) ||
            isEmpty(form.get("buyPrice")) ||
            isEmpty(form.get("MSRP"))) {

            throw new IllegalArgumentException("All fields are required");
        }

        Map<String, Object> original = productService.getProduct(id);
        original.remove("_links");

        original.put("productName", form.get("productName"));
        original.put("productVendor", form.get("productVendor"));
        original.put("quantityInStock", Integer.parseInt(form.get("quantityInStock")));
        original.put("buyPrice", Double.parseDouble(form.get("buyPrice")));
        original.put("MSRP", Double.parseDouble(form.get("MSRP")));

        String encoded = URLEncoder.encode(form.get("productLine"), StandardCharsets.UTF_8);
        original.put("productLine", "/productlines/" + encoded);

        productService.updateProduct(id, original);

        return "redirect:/products";
    }

    private boolean isEmpty(String s) {
        return s == null || s.trim().isEmpty();
    }

    @GetMapping("/add")
    public String addPage(Model model) {

        List<String> productLines = productService.getAllProductLines(); // create this

        model.addAttribute("productLines", productLines);
        model.addAttribute("page", "Add Product");

        return "add-product";
    }

    @PostMapping("/add")
    public String add(@RequestParam Map<String, String> form) {

        Map<String, Object> payload = new HashMap<>();

        payload.put("productName", form.get("productName"));
        payload.put("productVendor", form.get("productVendor"));
        payload.put("productScale", form.get("productScale"));
        payload.put("productDescription", form.get("productDescription"));

        payload.put("quantityInStock", Integer.parseInt(form.get("quantityInStock")));
        payload.put("buyPrice", Double.parseDouble(form.get("buyPrice")));
        payload.put("MSRP", Double.parseDouble(form.get("MSRP")));

        // 🔥 CRITICAL FIX (same as JS)
        String encoded = URLEncoder.encode(form.get("productLine"), StandardCharsets.UTF_8);

        payload.put("productLine", "/productlines/" + encoded);

        productService.addProduct(payload);

        return "redirect:/products";
    }
}