package com.financial.riskagent.model;

/**
 * Asset Allocation Model
 * Percentage allocation across different asset classes
 */
public class AssetAllocation {
    private Double equity; // Stocks/Mutual Funds
    private Double debt; // Bonds/FD
    private Double gold; // Gold/Commodities
    private Double cash; // Cash/Liquid funds

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private AssetAllocation allocation = new AssetAllocation();

        public Builder equity(Double equity) {
            allocation.equity = equity;
            return this;
        }

        public Builder debt(Double debt) {
            allocation.debt = debt;
            return this;
        }

        public Builder gold(Double gold) {
            allocation.gold = gold;
            return this;
        }

        public Builder cash(Double cash) {
            allocation.cash = cash;
            return this;
        }

        public AssetAllocation build() {
            return allocation;
        }
    }

    // Getters and Setters
    public Double getEquity() {
        return equity;
    }

    public void setEquity(Double equity) {
        this.equity = equity;
    }

    public Double getDebt() {
        return debt;
    }

    public void setDebt(Double debt) {
        this.debt = debt;
    }

    public Double getGold() {
        return gold;
    }

    public void setGold(Double gold) {
        this.gold = gold;
    }

    public Double getCash() {
        return cash;
    }

    public void setCash(Double cash) {
        this.cash = cash;
    }
}
