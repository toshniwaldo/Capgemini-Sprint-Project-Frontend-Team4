package com.example.ProjectSprintFrontend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PaymentDTO {

    private LocalDate paymentDate;
    private BigDecimal amount;
}
