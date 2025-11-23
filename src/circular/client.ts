/**
 * Circular Protocol Client
 * 
 * Wrapper around Circular Protocol API for use in Cloudflare Workers.
 * Provides methods for wallet operations, transactions, and analytics.
 */

export interface Wallet {
    address: string;
    balance: string;
    nonce: number;
    created_at: string;
}

export interface Transaction {
    hash: string;
    from: string;
    to: string;
    amount: string;
    memo?: string;
    status: "pending" | "confirmed" | "failed";
    timestamp: string;
}

export interface Analytics {
    metric: string;
    timeframe: string;
    data: Record<string, any>;
}

export class CircularClient {
    private rpcUrl: string;

    constructor(rpcUrl: string) {
        this.rpcUrl = rpcUrl;
    }

    /**
     * Check if a wallet exists on Circular Protocol
     */
    async checkWallet(address: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.rpcUrl}/wallet/${address}/exists`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data.exists ?? false;
        } catch (error) {
            console.error("Error checking wallet:", error);
            return false;
        }
    }

    /**
     * Get detailed wallet information
     */
    async getWallet(address: string): Promise<Wallet> {
        const response = await fetch(`${this.rpcUrl}/wallet/${address}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            throw new Error(`Failed to get wallet: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get wallet balance
     */
    async getBalance(address: string): Promise<string> {
        const response = await fetch(`${this.rpcUrl}/wallet/${address}/balance`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            throw new Error(`Failed to get balance: ${response.statusText}`);
        }

        const data = await response.json();
        return data.balance;
    }

    /**
     * Send a transaction on Circular Protocol
     */
    async sendTransaction(tx: {
        from: string;
        to: string;
        amount: string;
        memo?: string;
    }): Promise<Transaction> {
        const response = await fetch(`${this.rpcUrl}/transaction`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tx),
        });

        if (!response.ok) {
            throw new Error(`Failed to send transaction: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get analytics data from Circular Protocol
     */
    async getAnalytics(
        metric: "transactions" | "volume" | "users",
        timeframe: "24h" | "7d" | "30d"
    ): Promise<Analytics> {
        const response = await fetch(
            `${this.rpcUrl}/analytics?metric=${metric}&timeframe=${timeframe}`,
            {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to get analytics: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get transaction history for a wallet
     */
    async getTransactionHistory(
        address: string,
        limit: number = 10
    ): Promise<Transaction[]> {
        const response = await fetch(
            `${this.rpcUrl}/wallet/${address}/transactions?limit=${limit}`,
            {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to get transaction history: ${response.statusText}`);
        }

        const data = await response.json();
        return data.transactions ?? [];
    }
}
