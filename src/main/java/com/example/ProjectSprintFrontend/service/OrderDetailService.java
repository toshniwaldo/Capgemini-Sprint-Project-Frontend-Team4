package com.example.ProjectSprintFrontend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class OrderDetailService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String BASE_URL = "http://localhost:8080";

    public Map getOrders(String productCode, int page) {

        String url = BASE_URL +
                "/orderdetails/search/findByProduct_ProductCode" +
                "?productCode=" + productCode +
                "&projection=orderDetailView&page=" + page;

        return restTemplate.getForObject(url, Map.class);
    }
}