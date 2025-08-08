const fetch = require("node-fetch");

async function testMcpServer() {
  console.log("🚀 Testing MCP Scrape Tokopedia Server...\n");

  let sessionId = null;

  try {
    // 1. Initialize MCP session
    console.log("1. Initializing MCP session...");
    const initResponse = await fetch("http://localhost:4002/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {},
          },
          clientInfo: {
            name: "test-client",
            version: "1.0.0",
          },
        },
      }),
    });

    if (!initResponse.ok) {
      throw new Error(`HTTP error! status: ${initResponse.status}`);
    }

    sessionId = initResponse.headers.get("mcp-session-id");
    console.log("✅ Session initialized");
    console.log(`📋 Session ID: ${sessionId}\n`);

    // 2. List available tools
    console.log("2. Listing available tools...");
    const listResponse = await fetch("http://localhost:4002/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        "mcp-session-id": sessionId,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/list",
      }),
    });

    if (!listResponse.ok) {
      throw new Error(`HTTP error! status: ${listResponse.status}`);
    }

    const listData = await listResponse.json();
    const tools = listData.result?.tools || [];
    console.log(
      `✅ Available tools: [${tools.map((t) => t.name).join(", ")}]\n`
    );

    // 3. Test scrape Tokopedia tool
    console.log("3. Testing scrape Tokopedia tool...\n");

    const testKeyword = "case iphone 11";
    console.log(`   Testing: scrape_tokopedia with keyword "${testKeyword}"`);

    const scrapeResponse = await fetch("http://localhost:4002/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        "mcp-session-id": sessionId,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: {
          name: "scrape_tokopedia",
          arguments: {
            keyword: testKeyword,
          },
        },
      }),
    });

    if (!scrapeResponse.ok) {
      throw new Error(`HTTP error! status: ${scrapeResponse.status}`);
    }

    const scrapeData = await scrapeResponse.json();

    if (scrapeData.error) {
      console.log(`❌ Error: ${scrapeData.error.message}`);
    } else {
      const result = scrapeData.result?.content?.[0]?.text || "No result";
      console.log("✅ Result received:");
      console.log(result);
    }

    console.log("\n🎉 All tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

// Run the test
testMcpServer();
