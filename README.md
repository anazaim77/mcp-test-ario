# MCP Test Ario

A Model Context Protocol (MCP) server that provides tools for scraping Tokopedia products and performing calculations. This project includes both an MCP server and a web scraper service.

## 🚀 Quick Start

### Self-Hosted Setup

1.  **Clone the repository:**

```bash

git clone https://github.com/anazaim77/mcp-test-ario

cd mcp-test-ario

```

2.  **Start the services using Docker Compose:**

```bash

docker compose up -d --build

```

This will start:

- MCP Server on port 4002

- Scraper Service on port 4004

3.  **Verify the services are running:**

```bash

docker compose ps

```

## 🔧 MCP Client Configuration

### Self-Hosted Configuration

For local development and testing:

```json
{
  "mcpServers": {
    "mcp-ario-test": {
      "url": "http://localhost:4002/mcp"
    }
  }
}
```

### Public Hosted Configuration

For production use:

```json
{
  "mcpServers": {
    "mcp-ario-test": {
      "url": "https://mcp-ario-test.fajaryae.my.id/mcp"
    }
  }
}
```

## 🛠️ Available Tools

### Scrape Tokopedia Tool

Scrapes product listings from Tokopedia based on keyword searches. Returns product information including titles, prices, images, links, ratings, and store information.

**Example prompts:**

- "Search for 'case iphone 11' on Tokopedia"

- "Find laptop products on Tokopedia"

- "Scrape Tokopedia for 'playstation 5'"

- "Get the top 5 products for 'smartphone' from Tokopedia"

**Sample Response:**

```

Found 5 products for keyword "case iphone 11":



1. **Case iPhone 11 Premium**

💰 Price: Rp 150.000

⭐ Rating: 4.8

🏪 Store: TechStore

🔗 Link: https://tokopedia.com/...

🖼️ Image: https://images.tokopedia.net/...



2. **Case iPhone 11 Transparan**

💰 Price: Rp 89.000

⭐ Rating: 4.5

🏪 Store: GadgetMart

🔗 Link: https://tokopedia.com/...

🖼️ Image: https://images.tokopedia.net/...

```

## 📚 API Documentation

The complete API documentation can be accessed here:

**https://web-ario-test.fajaryae.my.id/api-docs**

This includes detailed information about:

- Available endpoints

- Request/response schemas

- Authentication methods

- Error handling

## 🔐 Authentication Concept

### Get User Purchase History with Authentication

The authentication concept for retrieving user purchase history can be found in the UML diagram:

**`get_purchase_uml.png`**

This diagram illustrates:

- User authentication flow

- Session management

- Purchase history retrieval process

- Data security measures

## 🎥 Demo Video

A demonstration video showcasing the MCP server capabilities will be available here:

**https://photos.app.goo.gl/1fjr6qzjwhCfKhSx9**

The demo will cover:

- Setting up the MCP client

- Scraping Tokopedia products

- Real-world usage scenarios

## 🏗️ Architecture

The project consists of two main services:

### MCP Server (`apps/mcp-app`)

- Built with TypeScript and Express

- Implements the Model Context Protocol

- Provides tools for calculations and web scraping

- Runs on port 4002

### Scraper Service (`apps/scraper-app`)

- Built with NestJS

- Handles web scraping operations

- Uses Puppeteer for browser automation

- Runs on port 4004
