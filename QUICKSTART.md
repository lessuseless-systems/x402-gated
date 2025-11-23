# Quick Start Guide

## Prerequisites

- Node.js 20+ and npm
- Cloudflare account (free tier works)
- Wrangler CLI (`npm install -g wrangler`)

## Setup (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and set your values:

```bash
# Your wallet address that receives x402 payments
CIRCULAR_WALLET_ADDRESS=0xYourWalletAddress

# Circular Protocol RPC endpoint
CIRCULAR_RPC_URL=https://rpc.circular.protocol

# For testing, use the testnet facilitator
FACILITATOR_URL=https://x402.org/facilitator
X402_NETWORK=base-sepolia
```

### 3. Run Locally

```bash
npm run dev
```

The server will start at `http://localhost:8787`

### 4. Test Endpoints

```bash
# Health check
curl http://localhost:8787/health

# Pricing information
curl http://localhost:8787/pricing

# API documentation
curl http://localhost:8787/docs
```

## Testing MCP Tools

### Free Tool (No Payment)

```bash
curl -X POST http://localhost:8787/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "check_wallet",
      "arguments": {
        "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
      }
    },
    "id": 1
  }'
```

### Paid Tool (Requires x402 Payment)

For paid tools, you'll need an x402-enabled client. The server will respond with `402 Payment Required` and payment details.

## Deploy to Cloudflare

### 1. Login to Cloudflare

```bash
wrangler login
```

### 2. Set Production Secrets

```bash
# Set your wallet private key (for payment agent)
wrangler secret put CLIENT_WALLET_PK

# Optionally override other values
wrangler secret put CIRCULAR_WALLET_ADDRESS
```

### 3. Deploy

```bash
npm run deploy
```

Your worker will be available at:
`https://circular-x402-gateway.your-subdomain.workers.dev`

## Next Steps

- **Add Custom Domain**: Configure in Cloudflare Dashboard
- **Monitor Logs**: `wrangler tail`
- **Update Pricing**: Edit `src/mcp-server.ts`
- **Add More Tools**: Extend `CircularMCP` class

## Troubleshooting

### "agents" package not found

The Cloudflare Agents SDK is currently in beta. If you encounter issues:

1. Check the [official repository](https://github.com/cloudflare/agents)
2. Ensure you're using the latest Wrangler version
3. Try: `npm install agents@latest`

### Payment verification fails

- Verify `FACILITATOR_URL` is correct
- Check `X402_NETWORK` matches your wallet network
- Ensure wallet has sufficient USDC balance

### Durable Objects errors

- Run `wrangler dev` to test locally first
- Check migrations in `wrangler.jsonc`
- Verify Durable Objects are enabled in your Cloudflare account

## Support

- [x402 Documentation](https://x402.gitbook.io/x402)
- [Cloudflare Agents SDK](https://github.com/cloudflare/agents)
- [Circular Protocol Docs](https://docs.circular.protocol)
