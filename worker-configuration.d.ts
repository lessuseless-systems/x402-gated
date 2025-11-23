// Environment bindings for Cloudflare Workers
interface Env {
    // Durable Object bindings
    CIRCULAR_MCP: DurableObjectNamespace;
    CIRCULAR_AGENT: DurableObjectNamespace;

    // Environment variables
    CIRCULAR_WALLET_ADDRESS: string;
    CIRCULAR_RPC_URL: string;
    FACILITATOR_URL: string;
    X402_NETWORK: "base" | "base-sepolia" | "solana" | "solana-devnet";

    // Secrets (set via wrangler secret put)
    CLIENT_WALLET_PK?: string;
}
