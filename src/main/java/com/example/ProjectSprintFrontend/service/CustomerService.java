package com.example.ProjectSprintFrontend.service;

import com.example.ProjectSprintFrontend.dto.CustomerDTO;
import com.example.ProjectSprintFrontend.dto.requestdto.CustomerEditDTO;
import com.example.ProjectSprintFrontend.dto.responsedto.CustomerResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final RestTemplate restTemplate;

    @Value("${backend.base-url}")
    private String BASE_URL;

    public CustomerResponseDTO getCustomersPage(int page, int size) {

        String url = BASE_URL +
                "/customer?page=" + page +
                "&size=" + size +
                "&projection=customerView";

        return restTemplate.getForObject(url, CustomerResponseDTO.class);
    }

    public CustomerResponseDTO searchCustomers(String keyword, int page, int size) {

        String url = BASE_URL +
                "/customer/search/findCustomers?keyword=" + keyword +
                "&page=" + page +
                "&size=" + size +
                "&projection=customerView";

        return restTemplate.getForObject(url, CustomerResponseDTO.class);
    }

    // For LIST / VIEW
    public CustomerDTO getCustomerViewById(Integer id) {

        String url = BASE_URL +
                "/customer/" + id + "?projection=customerView";

        return restTemplate.getForObject(url, CustomerDTO.class);
    }

    public void updateCustomer(Integer id, CustomerEditDTO dto) {

        String url = BASE_URL + "/customer/update/" + id;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<CustomerEditDTO> request = new HttpEntity<>(dto, headers);

        restTemplate.exchange(url, HttpMethod.PATCH, request, Void.class);
    }

    // For EDIT PAGE
    public CustomerEditDTO getCustomerEditById(Integer id) {

        String url = BASE_URL +
                "/customer/" + id + "?projection=customerEdit";

        return restTemplate.getForObject(url, CustomerEditDTO.class);
    }
}
