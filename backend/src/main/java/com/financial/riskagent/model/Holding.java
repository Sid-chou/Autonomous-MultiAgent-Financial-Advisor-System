package com.financial.riskagent.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Holding {
    private String symbol;
    private double quantity;
    private double purchasePrice;
    private double currentPrice;
}
