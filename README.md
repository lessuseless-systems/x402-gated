# Circular Protocol x402 Gateway

A production-ready **x402 payment gateway** for Circular Protocol built on **Cloudflare Workers** using the **Agents SDK**. Enables AI agents and developers to pay for Circular Protocol API access using micropayments via the x402 protocol.

## 🌟 Features

- ✅ **x402 Payment Protocol** - Automatic micropayments for API access
- ✅ **MCP Integration** - Model Context Protocol for AI agents
- ✅ **Durable Objects** - Stateful sessions with SQLite storage
- ✅ **Edge Deployment** - Global distribution via Cloudflare
- ✅ **TypeScript** - Fully typed with modern tooling
- ✅ **Free & Paid Tools** - Flexible pricing model

## 🏗️ Architecture

```
AI Agent/Client
      ↓
Cloudflare Worker (Edge)
      ↓
   ┌──────────────┬──────────────┐
   │              │              │
MCP Server    Payment Agent   Circular
(Durable      (Durable        Protocol
 Object)       Object)         Client
   │              │              │
   └──────────────┴──────────────┘
         ↓              ↓
    x402 Facilitator  Circular
    (Base/Solana)     Blockchain
```

## 📦 Installation

```bash
# Clone the repository
cd x402-gated

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

## ⚙️ Configuration

### Environment Variables

Edit `wrangler.jsonc` or set via Wrangler secrets:

```jsonc
{
  "vars": {
    // Your wallet address that receives x402 payments
    "CIRCULAR_WALLET_ADDRESS": "0xYourWalletAddress",
    
    // Circular Protocol RPC endpoint
    "CIRCULAR_RPC_URL": "https://rpc.circular.protocol",
    
    // x402 facilitator URL
    "FACILITATOR_URL": "https://x402.org/facilitator",
    
    // Network: "base-sepolia" (testnet) or "base" (mainnet)
    "X402_NETWORK": "base-sepolia"
  }
}
```

### Secrets (Production)

```bash
# Set client wallet private key (for payment agent)
wrangler secret put CLIENT_WALLET_PK

# Override wallet address (optional)
wrangler secret put CIRCULAR_WALLET_ADDRESS
```

## 🛠️ Developer Experience

### Using Nix (Recommended)

This project includes a `flake.nix` for a reproducible development environment.

```bash
# Enter the dev shell
nix develop

# Or using direnv (if installed)
direnv allow
```

### Using Just

We use `just` as a command runner. Run `just` to see available commands.

```bash
just setup      # Install dependencies
just dev        # Run local server
just deploy     # Deploy to Cloudflare
just test       # Run tests
just clean      # Clean artifacts
```

## 🚀 Development

```bash
# Run locally
just dev
# or
npm run dev

# Access endpoints:
# - http://localhost:8787/mcp - MCP server
# - http://localhost:8787/agent - Payment agent (WebSocket)
# - http://localhost:8787/health - Health check
# - http://localhost:8787/pricing - Pricing info
```

## 📡 API Endpoints

### `/mcp` - MCP Server

JSON-RPC endpoint for Model Context Protocol.

**Available Tools:**

#### Free Tools
- `check_wallet` - Check if a wallet exists

#### Paid Tools
- `get_wallet` - Get wallet details ($0.001)
- `get_balance` - Get wallet balance ($0.0005)
- `get_transaction_history` - Get transaction history ($0.002)
- `get_analytics` - Get analytics data ($0.005)
- `send_transaction` - Send a transaction ($0.01)

### `/agent` - Payment Agent

WebSocket endpoint for AI agents with automatic payment handling.

**Message Format:**

```json
{
  "type": "call_tool",
  "tool": "get_wallet",
  "args": {
    "address": "0x..."
  }
}
```

### `/pricing` - Pricing Information

Returns current pricing for all tools.

### `/health` - Health Check

Returns service status.

## 💰 Pricing

| Tool | Price | Description |
|------|-------|-------------|
| `check_wallet` | **Free** | Check wallet existence |
| `get_balance` | $0.0005 | Get wallet balance |
| `get_wallet` | $0.001 | Get wallet details |
| `get_transaction_history` | $0.002 | Get transaction history |
| `get_analytics` | $0.005 | Get analytics data |
| `send_transaction` | $0.01 | Send transaction |

## 🧪 Testing

### Test with MCP Client

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client({
  name: "test-client",
  version: "1.0.0",
});

await client.connect(
  new StdioClientTransport({
    command: "curl",
    args: ["-X", "POST", "http://localhost:8787/mcp"],
  })
);

// Call free tool
const result = await client.callTool({
  name: "check_wallet",
  arguments: { address: "0x..." },
});

console.log(result);
```

### Test with WebSocket

```javascript
const ws = new WebSocket("ws://localhost:8787/agent");

ws.onopen = () => {
  // Call a tool
  ws.send(JSON.stringify({
    type: "call_tool",
    tool: "get_balance",
    args: { address: "0x..." }
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === "payment_required") {
    // Confirm payment
    ws.send(JSON.stringify({
      type: "confirm",
      confirmationId: data.confirmationId
    }));
  } else if (data.type === "tool_result") {
    console.log("Result:", data.result);
  }
};
```

## 🚢 Deployment

### Deploy to Cloudflare

```bash
# Deploy to production
npm run deploy

# Your worker will be available at:
# https://circular-x402-gateway.your-subdomain.workers.dev
```

### Custom Domain

Add a custom domain in Cloudflare Dashboard:
1. Go to Workers & Pages
2. Select your worker
3. Settings → Triggers → Custom Domains
4. Add your domain

## 🔐 Security

- **Private Keys**: Never commit private keys. Use Wrangler secrets.
- **Rate Limiting**: Consider adding rate limiting for production.
- **CORS**: Configure CORS headers as needed.
- **Validation**: All inputs are validated with Zod schemas.

## 📚 Resources

- [x402 Documentation](https://x402.gitbook.io/x402)
- [Cloudflare Agents SDK](https://github.com/cloudflare/agents)
- [Model Context Protocol](https://mcp.so)
- [Circular Protocol](https://circular.protocol)

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📄 License

MIT

## 🆘 Support

For issues or questions:
- GitHub Issues: [Create an issue](https://github.com/circular-protocol/x402-gated/issues)
- Discord: [Join our community](https://discord.gg/circular)
