package com.example.ProjectSprintFrontend.service;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ProductService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String BASE_URL = "http://localhost:8080";

    public Map getProducts(int page) {
        return restTemplate.getForObject(
                BASE_URL + "/products?projection=productView&page=" + page,
                Map.class
        );
    }

    public Map searchProducts(String name, String line, String vendor, int page) {
        name = (name != null && !name.isBlank()) ? name : null;
        line = (line != null && !line.isBlank()) ? line : null;
        vendor = (vendor != null && !vendor.isBlank()) ? vendor : null;

        String url;

        if (name != null && line != null) {
            url = BASE_URL + "/products/search/searchByNameOrLine?name=" + name + "&line=" + line + "&projection=productView&page=" + page;

        } else if (name != null) {
            url = BASE_URL + "/products/search/searchByNameOrLine?name=" + name + "&projection=productView&page=" + page;

        } else if (line != null) {
            url = BASE_URL + "/products/search/searchByNameOrLine?line=" + line + "&projection=productView&page=" + page;

        } else if (vendor != null) {
            url = BASE_URL + "/products/search/searchByVendor?vendor=" + vendor + "&projection=productView&page=" + page;

        } else {
            url = BASE_URL + "/products?projection=productView&page=" + page;
        }

        return restTemplate.getForObject(url, Map.class);
    }

    public Map getProduct(String id) {
        return restTemplate.getForObject(BASE_URL + "/products/" + id, Map.class);
    }

    public void updateProduct(String id, Map<String, Object> payload) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        restTemplate.exchange(
                BASE_URL + "/products/" + id,
                HttpMethod.PUT,
                entity,
                Void.class
        );
    }

    public void addProduct(Map<String, Object> payload) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        restTemplate.exchange(
                BASE_URL + "/products",
                HttpMethod.POST,
                entity,
                Void.class
        );
    }

    public Map getRaw(String url) {
        return restTemplate.getForObject(url, Map.class);
    }

    public List<String> getAllProductLines() {
        Map data = restTemplate.getForObject(BASE_URL + "/productlines", Map.class);

        List<Map<String, Object>> list =
                (List<Map<String, Object>>) ((Map) data.get("_embedded")).get("productLines");

        List<String> result = new ArrayList<>();

        for (Map<String, Object> p : list) {
            Map links = (Map) p.get("_links");
            Map self = (Map) links.get("self");

            String href = (String) self.get("href");
            String raw = href.substring(href.lastIndexOf("/") + 1);

            result.add(java.net.URLDecoder.decode(raw, java.nio.charset.StandardCharsets.UTF_8));
        }

        return result;
    }
}