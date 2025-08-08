# Test Ario MCP Server

A Model Context Protocol (MCP) server framework for building custom tools and services.

## Features

The server provides a modular framework for MCP tools with:

- **Modular Architecture**: Clean separation of concerns with dedicated modules for tools, handlers, and utilities
- **Type Safety**: Full TypeScript support with Zod validation
- **Extensible Design**: Easy to add new tools and features
- **Production Ready**: Docker support with proper logging and error handling
- **Example Tools**: Currently includes a Tokopedia scraping tool as an example implementation

## Quick Start

### Using Docker Compose (Recommended)

1. **Build and run the server:**

   ```bash
   docker-compose up --build
   ```

2. **Test the MCP server:**

   ```bash
   # Using the Node.js test client (comprehensive tests)
   node test-client.js

   # Using curl (basic tests)
   ./test-curl.sh
   ```

### Manual Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Build the TypeScript code:**

   ```bash
   npm run build
   ```

3. **Start the server:**

   ```bash
   npm start
   ```

4. **Test the MCP server:**
   ```bash
   node test-client.js
   ```

## MCP Client Configuration

### Recommended: Direct HTTP Configuration

For most MCP clients, use this direct HTTP configuration:

```json
{
  "mcpServers": {
    "test-ario-fajar": {
      "type": "http",
      "url": "http://localhost:3000/mcp",
      "headers": {
        "Accept": "application/json, text/event-stream"
      }
    }
  }
}
```

### Testing Your MCP Client Connection

Once configured, you can test the connection by asking your MCP client to:

1. **List available tools:**

   ```
   What tools are available from the test-ario-mcp server?
   ```

2. **Test Tokopedia scraping:**

   ```
   Search for "case iphone 11" on Tokopedia
   ```

3. **Test error handling:**
   ```
   Try to scrape with an empty keyword
   ```

## Testing Your MCP Server

### How to Verify Results Are From Your MCP Server

1. **Check the server logs**: When you run tests, you'll see requests hitting your server in the Docker logs or console output.

2. **Use the test client**: The `test-client.js` provides comprehensive testing that shows:

   - Session initialization
   - Available tools listing
   - Individual operation results with validation
   - Error handling

3. **Manual verification**: You can manually test using curl or any HTTP client:

   ```bash
   # Initialize session
   curl -X POST http://localhost:3000/mcp \
     -H "Content-Type: application/json" \
     -H "Accept: application/json, text/event-stream" \
     -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{"tools":{}},"clientInfo":{"name":"test","version":"1.0.0"}}}'

   # Call scrape Tokopedia (replace SESSION_ID with actual session ID from headers)
   curl -X POST http://localhost:3000/mcp \
     -H "Content-Type: application/json" \
     -H "Accept: application/json, text/event-stream" \
     -H "mcp-session-id: SESSION_ID" \
     -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"scrape_tokopedia","arguments":{"keyword":"case iphone 11"}}}'
   ```

### Test Results You Should See

When running `node test-client.js`, you should see output like:

```
🚀 Testing MCP Scrape Tokopedia Server...

1. Initializing MCP session...
✅ Session initialized: 1
📋 Session ID: abc123-def456-ghi789

2. Listing available tools...
✅ Available tools: ['scrape_tokopedia']

3. Testing scrape Tokopedia tool...

   Testing: scrape_tokopedia with keyword "case iphone 11"
   ✅ Result: Found 5 products for keyword "case iphone 11"...
   ✅ Products with titles, prices, ratings, and links

🎉 All tests completed!
```

## API Reference

### Example Tool: Scrape Tokopedia

**Name:** `scrape_tokopedia`

**Description:** Scrape product listings from Tokopedia based on keyword searches

**Parameters:**

- `keyword` (string, required): Search keyword for products

**Example Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Found 5 products for keyword \"case iphone 11\":\n\n1. **Case iPhone 11 Premium**\n   💰 Price: Rp 150.000\n   ⭐ Rating: 4.8\n   🏪 Store: TechStore\n   🔗 Link: https://tokopedia.com/...\n   🖼️ Image: https://images.tokopedia.net/..."
      }
    ]
  }
}
```

## Error Handling

The server includes proper error handling for:

- Invalid tool requests
- Missing required parameters
- Tool-specific errors
- Network and server errors

## Development

### Project Structure

```
├── src/
│   └── index.ts          # Main MCP server implementation
├── test-client.js        # Comprehensive test client
├── test-curl.sh          # Basic curl-based tests
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile           # Docker build configuration
└── package.json         # Node.js dependencies
```

### Adding New Tools

To add new tools to the server:

1. Create a new tool file in `src/tools/`
2. Add types in `src/types/`
3. Register the tool in `src/core/mcp-server.ts`
4. Add tests in `test-client.js`

### Adding New Scraping Operations

To add new scraping operations (example):

1. Create a new scraping tool in `src/tools/`
2. Add the scraping logic and API integration
3. Register the tool in `src/core/mcp-server.ts`
4. Add tests in `test-client.js`

## Troubleshooting

### Common Issues

1. **Port already in use**: Make sure port 3000 is available or change it in `docker-compose.yml`
2. **Build errors**: Ensure all dependencies are installed with `npm install`
3. **Connection refused**: Verify the server is running and accessible on `http://localhost:3000`
4. **MCP client connection issues**: Ensure the client accepts both `application/json` and `text/event-stream` content types

### Debug Mode

To see detailed server logs, run:

```bash
docker-compose up --build
```

The server will log all incoming requests and responses, helping you verify that your scraping tools are being called correctly.
