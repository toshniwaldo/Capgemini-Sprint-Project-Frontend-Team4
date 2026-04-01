package com.example.ProjectSprintFrontend.service;

import com.example.ProjectSprintFrontend.dto.CustomerDTO;
import com.example.ProjectSprintFrontend.dto.EmployeeListDTO;
import com.example.ProjectSprintFrontend.dto.OrderListDTO;
import com.example.ProjectSprintFrontend.dto.requestdto.CustomerEditDTO;
import com.example.ProjectSprintFrontend.dto.responsedto.CustomerResponseDTO;
import com.example.ProjectSprintFrontend.dto.responsedto.EmployeeResponseDTO;
import com.example.ProjectSprintFrontend.dto.responsedto.OrderResponseDTO;
import com.example.ProjectSprintFrontend.dto.responsedto.PaymentResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

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

    // For EDIT PAGE
    public CustomerEditDTO getCustomerEditById(Integer id) {

        String url = BASE_URL +
                "/customer/" + id + "?projection=customerEdit";

        return restTemplate.getForObject(url, CustomerEditDTO.class);
    }

    public void createCustomer(CustomerEditDTO dto) {

        String url = BASE_URL + "/customer";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<CustomerEditDTO> request = new HttpEntity<>(dto, headers);

        restTemplate.postForEntity(url, request, Void.class);
    }

    public void updateCustomer(Integer id, CustomerEditDTO dto) {

        String url = BASE_URL + "/customer/update/" + id;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<CustomerEditDTO> request = new HttpEntity<>(dto, headers);

        restTemplate.exchange(url, HttpMethod.PATCH, request, Void.class);
    }

    public List<EmployeeListDTO> getAllEmployees() {

        String url = BASE_URL +
                "/employees?projection=employeeList&size=100";

        EmployeeResponseDTO response =
                restTemplate.getForObject(url, EmployeeResponseDTO.class);

        if (response == null || response.getEmbedded() == null) {
            return List.of(); // empty list instead of crash
        }

        return response.getEmbedded().getEmployees();
    }

    public OrderResponseDTO getOrdersByCustomer(Integer customerNumber, int page, int size, String sortDir) {

        String url = BASE_URL +
                "/orders/search/byCustomer?customerNumber=" + customerNumber +
                "&page=" + page +
                "&size=" + size +
                "&projection=orderListView" +
                "&sort=orderDate," + sortDir;

        OrderResponseDTO response =
                restTemplate.getForObject(url, OrderResponseDTO.class);

        //APPLY YOUR LOGIC HERE
        if (response != null && response.getEmbedded() != null) {

            response.getEmbedded().getOrders().forEach(order -> {
                order.setDeliveryTimeline(computeDeliveryTimeline(order));
            });
        }

        return response;
    }

    public PaymentResponseDTO getPaymentsByCustomer(Integer customerNumber, int page, int size) {

        String url = BASE_URL +
                "/payment/search/by-customer?customerNumber=" + customerNumber +
                "&page=" + page +
                "&size=" + size +
                "&projection=paymentView";

        return restTemplate.getForObject(url, PaymentResponseDTO.class);
    }

    private String computeDeliveryTimeline(OrderListDTO o) {

        LocalDate today = LocalDate.now();

        // ✅ If shipped → just show shipped
        if (o.getShippedDate() != null) {
            return "Shipped";
        }

        // ✅ No required date
        if (o.getRequiredDate() == null) {
            return "-";
        }

        long days = ChronoUnit.DAYS.between(today, o.getRequiredDate());

        // ✅ Future delivery
        if (days > 0) {
            return days + " days left";
        }

        // ✅ Overdue cases
        long overdueDays = Math.abs(days);

        if (overdueDays <= 7) {
            return "Overdue by " + overdueDays + " days";
        } else if (overdueDays <= 30) {
            return "Delayed";
        } else {
            return "Stale Order";
        }
    }
}
