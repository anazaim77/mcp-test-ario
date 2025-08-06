# Test Ario MCP Server

A Model Context Protocol (MCP) server framework for building custom tools and services.

## Features

The server provides a modular framework for MCP tools with:

- **Modular Architecture**: Clean separation of concerns with dedicated modules for tools, handlers, and utilities
- **Type Safety**: Full TypeScript support with Zod validation
- **Extensible Design**: Easy to add new tools and features
- **Production Ready**: Docker support with proper logging and error handling
- **Example Tools**: Currently includes a calculator tool as an example implementation

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

2. **Test example calculations:**

   ```
   Calculate 15 + 27 using the calculator tool
   ```

3. **Test error handling:**
   ```
   Try to divide 10 by 0 using the calculator tool
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

   # Call calculator (replace SESSION_ID with actual session ID from headers)
   curl -X POST http://localhost:3000/mcp \
     -H "Content-Type: application/json" \
     -H "Accept: application/json, text/event-stream" \
     -H "mcp-session-id: SESSION_ID" \
     -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"calculator","arguments":{"operation":"add","a":5,"b":3}}}'
   ```

### Test Results You Should See

When running `node test-client.js`, you should see output like:

```
🚀 Testing MCP Calculator Server...

1. Initializing MCP session...
✅ Session initialized: 1
📋 Session ID: abc123-def456-ghi789

2. Listing available tools...
✅ Available tools: ['calculator']

3. Testing calculator operations...

   Testing: add(5, 3)
   ✅ Result: Calculation result: 5 + 3 = 8
   ✅ Validation: Expected 8, got 8

   Testing: multiply(6, 7)
   ✅ Result: Calculation result: 6 × 7 = 42
   ✅ Validation: Expected 42, got 42

   Testing: sqrt(16)
   ✅ Result: Calculation result: √16 = 4
   ✅ Validation: Expected 4, got 4

4. Testing error cases...

   Testing: Division by zero
   ✅ Error handled: Error: Division by zero is not allowed

🎉 All tests completed!
```

## API Reference

### Example Tool: Calculator

**Name:** `calculator`

**Description:** Example calculator tool that performs basic arithmetic operations

**Parameters:**

- `operation` (string, required): One of "add", "subtract", "multiply", "divide", "power", "sqrt"
- `a` (number, required): First number for the operation
- `b` (number, optional): Second number for the operation (required for all operations except sqrt)

**Example Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Calculation result: 5 + 3 = 8"
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

### Adding New Calculator Operations

To add new calculator operations (example):

1. Add the operation to the `calculatorFunctions` object in `src/tools/calculator.ts`
2. Add the operation to the enum in the tool schema
3. Add a case in the switch statement in the tool callback
4. Update tests in `test-client.js`

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

The server will log all incoming requests and responses, helping you verify that your calculator tools are being called correctly.
