/**
 * Circular Protocol MCP Server with x402 Payments
 * 
 * Provides MCP tools for interacting with Circular Protocol.
 * Free tools: check_wallet
 * Paid tools: get_wallet, get_balance, send_transaction, get_analytics
 */

import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withX402, type X402Config } from "agents/x402";
import { z } from "zod";
import { CircularClient } from "./circular/client";

export class CircularMCP extends McpAgent<Env> {
    server!: McpServer;
    circularClient!: CircularClient;

    async init() {
        // Initialize Circular Protocol client
        this.circularClient = new CircularClient(this.env.CIRCULAR_RPC_URL);

        // Configure x402 payment requirements
        const x402Config: X402Config = {
            network: this.env.X402_NETWORK,
            recipient: this.env.CIRCULAR_WALLET_ADDRESS as `0x${string}`,
            facilitator: { url: this.env.FACILITATOR_URL },
        };

        // Create MCP server with x402 wrapper
        this.server = withX402(
            new McpServer({
                name: "CircularProtocolMCP",
                version: "1.0.0",
            }),
            x402Config
        );

        // ========================================
        // FREE TOOLS (No payment required)
        // ========================================

        this.server.tool(
            "check_wallet",
            "Check if a wallet exists on Circular Protocol",
            {
                address: z.string().describe("Wallet address to check"),
            },
            async ({ address }) => {
                try {
                    const exists = await this.circularClient.checkWallet(address);
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({ exists, address }, null, 2),
                            },
                        ],
                    };
                } catch (error) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                            },
                        ],
                        isError: true,
                    };
                }
            }
        );

        // ========================================
        // PAID TOOLS (Require x402 payment)
        // ========================================

        this.server.paidTool(
            "get_wallet",
            "Get detailed wallet information from Circular Protocol",
            0.001, // $0.001 USD
            {
                address: z.string().describe("Wallet address"),
            },
            {},
            async ({ address }) => {
                try {
                    const wallet = await this.circularClient.getWallet(address);
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(wallet, null, 2),
                            },
                        ],
                    };
                } catch (error) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                            },
                        ],
                        isError: true,
                    };
                }
            }
        );

        this.server.paidTool(
            "get_balance",
            "Get wallet balance on Circular Protocol",
            0.0005, // $0.0005 USD
            {
                address: z.string().describe("Wallet address"),
            },
            {},
            async ({ address }) => {
                try {
                    const balance = await this.circularClient.getBalance(address);
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Balance for ${address}: ${balance}`,
                            },
                        ],
                    };
                } catch (error) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                            },
                        ],
                        isError: true,
                    };
                }
            }
        );

        this.server.paidTool(
            "send_transaction",
            "Send a transaction on Circular Protocol",
            0.01, // $0.01 USD (higher price for state-changing operations)
            {
                from: z.string().describe("Sender wallet address"),
                to: z.string().describe("Recipient wallet address"),
                amount: z.string().describe("Amount to send"),
                memo: z.string().optional().describe("Optional transaction memo"),
            },
            {},
            async ({ from, to, amount, memo }) => {
                try {
                    const tx = await this.circularClient.sendTransaction({
                        from,
                        to,
                        amount,
                        memo,
                    });
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(tx, null, 2),
                            },
                        ],
                    };
                } catch (error) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                            },
                        ],
                        isError: true,
                    };
                }
            }
        );

        this.server.paidTool(
            "get_analytics",
            "Get analytics data from Circular Protocol",
            0.005, // $0.005 USD
            {
                metric: z
                    .enum(["transactions", "volume", "users"])
                    .describe("Type of metric to retrieve"),
                timeframe: z
                    .enum(["24h", "7d", "30d"])
                    .describe("Time period for analytics"),
            },
            {},
            async ({ metric, timeframe }) => {
                try {
                    const analytics = await this.circularClient.getAnalytics(
                        metric,
                        timeframe
                    );
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(analytics, null, 2),
                            },
                        ],
                    };
                } catch (error) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                            },
                        ],
                        isError: true,
                    };
                }
            }
        );

        this.server.paidTool(
            "get_transaction_history",
            "Get transaction history for a wallet",
            0.002, // $0.002 USD
            {
                address: z.string().describe("Wallet address"),
                limit: z.number().optional().default(10).describe("Number of transactions to retrieve"),
            },
            {},
            async ({ address, limit }) => {
                try {
                    const history = await this.circularClient.getTransactionHistory(
                        address,
                        limit
                    );
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(history, null, 2),
                            },
                        ],
                    };
                } catch (error) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                            },
                        ],
                        isError: true,
                    };
                }
            }
        );
    }
}
