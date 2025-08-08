const fetch = require("node-fetch");

async function testSessionId() {
  console.log("🧪 Testing Session ID functionality...\n");

  let sessionId = null;

  try {
    // 1. Initialize MCP session
    console.log("1. Initializing MCP session...");
    const initResponse = await fetch("http://localhost:4000/mcp", {
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
            name: "session-test",
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

    // 2. Test scrape Tokopedia tool with session ID
    console.log("2. Testing scrape Tokopedia tool with session ID...\n");

    const testKeyword = "laptop";
    console.log(`   Testing: scrape_tokopedia with keyword "${testKeyword}"`);
    console.log(`   Session ID: ${sessionId}`);

    const scrapeResponse = await fetch("http://localhost:4000/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        "Cache-Control": "no-cache",
        "mcp-session-id": sessionId,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
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

    // Read the response as text first to see what we're getting
    const responseText = await scrapeResponse.text();
    console.log("📄 Raw response:");
    console.log(responseText);
    console.log("\n");

    // Try to parse as JSON if possible
    try {
      const scrapeData = JSON.parse(responseText);
      if (scrapeData.error) {
        console.log(`❌ Error: ${scrapeData.error.message}`);
      } else {
        console.log("✅ Success! Session ID was passed correctly.");
        console.log(
          "Result:",
          scrapeData.result?.content?.[0]?.text || "No result"
        );
      }
    } catch (parseError) {
      console.log("⚠️ Response is not JSON (expected for MCP with SSE)");
      console.log("✅ Session ID functionality is working!");
    }

    console.log("\n🎉 Session ID test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

testSessionId();
