/**
 * Main Worker Entry Point
 * 
 * Routes requests to:
 * - /mcp - MCP server endpoint
 * - /agent - Payment agent WebSocket
 * - /health - Health check
 * - /pricing - Pricing information
 * - / - Welcome message
 */

import { getAgentByName } from "agents";
import { CircularMCP } from "./mcp-server";
import { CircularPayAgent } from "./agent";

// Export Durable Object classes
export { CircularMCP, CircularPayAgent };

export default {
    async fetch(
        request: Request,
        env: Env,
        ctx: ExecutionContext
    ): Promise<Response> {
        const url = new URL(request.url);

        // MCP server endpoint
        if (url.pathname === "/mcp") {
            return CircularMCP.serve("/mcp").fetch(request, env, ctx);
        }

        // Payment agent WebSocket endpoint
        if (url.pathname === "/agent") {
            const agent = await getAgentByName(env.CIRCULAR_AGENT, "default");
            return agent.fetch(request);
        }

        // Health check endpoint
        if (url.pathname === "/health") {
            return new Response(
                JSON.stringify({
                    status: "ok",
                    service: "circular-x402-gateway",
                    version: "1.0.0",
                    timestamp: new Date().toISOString(),
                }),
                {
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // Pricing information endpoint
        if (url.pathname === "/pricing") {
            return new Response(
                JSON.stringify({
                    currency: "USD",
                    network: env.X402_NETWORK,
                    facilitator: env.FACILITATOR_URL,
                    tools: {
                        // Free tools
                        check_wallet: {
                            price: "free",
                            description: "Check if a wallet exists",
                        },

                        // Paid tools
                        get_wallet: {
                            price: "$0.001",
                            description: "Get detailed wallet information",
                        },
                        get_balance: {
                            price: "$0.0005",
                            description: "Get wallet balance",
                        },
                        get_transaction_history: {
                            price: "$0.002",
                            description: "Get transaction history",
                        },
                        get_analytics: {
                            price: "$0.005",
                            description: "Get analytics data",
                        },
                        send_transaction: {
                            price: "$0.01",
                            description: "Send a transaction (state-changing)",
                        },
                    },
                }),
                {
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // API documentation endpoint
        if (url.pathname === "/docs") {
            return new Response(
                JSON.stringify({
                    name: "Circular Protocol x402 Gateway",
                    version: "1.0.0",
                    description:
                        "x402-enabled MCP server for Circular Protocol operations",
                    endpoints: {
                        "/mcp": {
                            method: "POST",
                            description: "MCP server endpoint (JSON-RPC)",
                            protocol: "Model Context Protocol",
                        },
                        "/agent": {
                            method: "GET",
                            description: "Payment agent WebSocket endpoint",
                            protocol: "WebSocket",
                        },
                        "/health": {
                            method: "GET",
                            description: "Health check",
                        },
                        "/pricing": {
                            method: "GET",
                            description: "Tool pricing information",
                        },
                        "/docs": {
                            method: "GET",
                            description: "API documentation",
                        },
                    },
                    tools: {
                        free: ["check_wallet"],
                        paid: [
                            "get_wallet",
                            "get_balance",
                            "get_transaction_history",
                            "get_analytics",
                            "send_transaction",
                        ],
                    },
                    payment: {
                        protocol: "x402",
                        network: env.X402_NETWORK,
                        facilitator: env.FACILITATOR_URL,
                        recipient: env.CIRCULAR_WALLET_ADDRESS,
                    },
                }),
                {
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // Root endpoint - welcome message
        return new Response(
            JSON.stringify({
                message: "Circular Protocol x402 Gateway",
                version: "1.0.0",
                endpoints: {
                    mcp: "/mcp",
                    agent: "/agent",
                    health: "/health",
                    pricing: "/pricing",
                    docs: "/docs",
                },
                documentation: "https://x402.gitbook.io/x402",
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            }
        );
    },
};
