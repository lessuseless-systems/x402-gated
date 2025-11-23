/**
 * Payment Agent for AI Clients
 * 
 * Handles x402 payment flows for AI agents connecting to the MCP server.
 * Manages payment confirmations and WebSocket communication.
 */

import { Agent, type Connection, type WSMessage } from "agents";
import { withX402Client } from "agents/x402";
import { privateKeyToAccount } from "viem/accounts";
import type { PaymentRequirements } from "x402/types";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export class CircularPayAgent extends Agent<Env> {
    // Store pending payment confirmations
    confirmations: Record<string, (res: boolean) => void> = {};

    // x402 client wrapper for automatic payments
    x402Client?: ReturnType<typeof withX402Client>;

    /**
     * Called when a paid tool requires payment
     * Broadcasts payment request to connected clients and waits for confirmation
     */
    async onPaymentRequired(
        paymentRequirements: PaymentRequirements[]
    ): Promise<boolean> {
        const confirmationId = crypto.randomUUID().slice(0, 8);

        // Broadcast payment request to all connected clients
        this.broadcast(
            JSON.stringify({
                type: "payment_required",
                confirmationId,
                requirements: paymentRequirements,
                timestamp: Date.now(),
            })
        );

        // Wait for user confirmation
        return new Promise<boolean>((resolve) => {
            this.confirmations[confirmationId] = resolve;

            // Timeout after 60 seconds
            setTimeout(() => {
                if (this.confirmations[confirmationId]) {
                    delete this.confirmations[confirmationId];
                    resolve(false);
                }
            }, 60000);
        });
    }

    /**
     * Initialize agent on startup
     */
    async onStart() {
        // Get wallet private key from environment
        const privateKey = this.env.CLIENT_WALLET_PK;

        if (!privateKey) {
            console.error("CLIENT_WALLET_PK not set - agent cannot make payments");
            return;
        }

        // Create account from private key
        const account = privateKeyToAccount(privateKey as `0x${string}`);
        console.log("Agent will pay from address:", account.address);

        // Connect to MCP server
        const mcpUrl = `${this.env.CIRCULAR_RPC_URL || "http://localhost:8787"}/mcp`;
        const { id } = await this.mcp.connect(mcpUrl);

        // Wrap MCP client with x402 payment handler
        this.x402Client = withX402Client(this.mcp.mcpConnections[id].client, {
            network: this.env.X402_NETWORK,
            account,
        });

        console.log("Agent initialized and connected to MCP server");
    }

    /**
     * Handle incoming WebSocket messages
     */
    async onMessage(conn: Connection, message: WSMessage) {
        if (typeof message !== "string") return;

        try {
            const parsed = JSON.parse(message);

            switch (parsed.type) {
                // User confirmed payment
                case "confirm":
                    this.confirmations[parsed.confirmationId]?.(true);
                    delete this.confirmations[parsed.confirmationId];
                    break;

                // User cancelled payment
                case "cancel":
                    this.confirmations[parsed.confirmationId]?.(false);
                    delete this.confirmations[parsed.confirmationId];
                    break;

                // Call MCP tool (with automatic payment if required)
                case "call_tool":
                    if (!this.x402Client) {
                        conn.send(
                            JSON.stringify({
                                type: "error",
                                error: "Agent not initialized - missing CLIENT_WALLET_PK",
                            })
                        );
                        return;
                    }

                    try {
                        // Call tool with payment confirmation callback
                        // Set to null for automatic payments without confirmation
                        const result = (await this.x402Client.callTool(
                            this.onPaymentRequired.bind(this),
                            {
                                name: parsed.tool,
                                arguments: parsed.args || {},
                            }
                        )) as CallToolResult;

                        conn.send(
                            JSON.stringify({
                                type: result.isError ? "tool_error" : "tool_result",
                                tool: parsed.tool,
                                result: result.content[0]?.text ?? "",
                                timestamp: Date.now(),
                            })
                        );
                    } catch (error) {
                        conn.send(
                            JSON.stringify({
                                type: "error",
                                error: error instanceof Error ? error.message : "Unknown error",
                            })
                        );
                    }
                    break;

                // List available tools
                case "list_tools":
                    if (!this.x402Client) {
                        conn.send(
                            JSON.stringify({
                                type: "error",
                                error: "Agent not initialized",
                            })
                        );
                        return;
                    }

                    try {
                        const tools = await this.x402Client.listTools();
                        conn.send(
                            JSON.stringify({
                                type: "tools_list",
                                tools,
                            })
                        );
                    } catch (error) {
                        conn.send(
                            JSON.stringify({
                                type: "error",
                                error: error instanceof Error ? error.message : "Unknown error",
                            })
                        );
                    }
                    break;

                default:
                    console.log("Unknown message type:", parsed.type);
            }
        } catch (error) {
            console.error("Error handling message:", error);
            conn.send(
                JSON.stringify({
                    type: "error",
                    error: "Failed to parse message",
                })
            );
        }
    }

    /**
     * Handle client disconnect
     */
    async onClose(conn: Connection) {
        console.log("Client disconnected");
    }
}
