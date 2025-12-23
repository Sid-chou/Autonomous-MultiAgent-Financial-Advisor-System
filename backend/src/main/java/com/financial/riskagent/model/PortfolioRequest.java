package com.financial.riskagent.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioRequest {
    private List<Holding> holdings;
    private String riskTolerance; // conservative, moderate, aggressive
}
