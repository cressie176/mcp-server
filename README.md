# MCP Server

A Model Context Protocol (MCP) server that provides access to resources and prompts from different repository sources. This allows you to share coding standards, documentation, and reusable prompts across your team by storing them in a GitHub repository, making them accessible to Claude and other MCP-compatible AI tools.

## Quick Start

The fastest way to get started is using a GitHub repository. First, create a repository with this structure:

```
your-repo/
├── index.json
├── resources/
│   └── your-resource.md
└── prompts/
    └── your-prompt.md
```

Create an `index.json` file that declares what resources and prompts are available:

```json
{
  "resources": [
    {
      "name": "your-resource",
      "description": "Description of your resource"
    }
  ],
  "prompts": [
    {
      "name": "your-prompt",
      "description": "Description of your prompt"
    }
  ]
}
```

Add this to your Claude configuration:

```json
{
  "mcpServers": {
    "mcp-server": {
      "command": "npx",
      "args": [
        "--yes",
        "github:cressie176/mcp-server",
        "--repository-type", "github",
        "--user", "your-username",
        "--repository", "your-repo"
      ]
    }
  }
}
```

Restart Claude and your resources and prompts will be available. You can confirm using the `/mcp` command.

## Example Prompts and Resources
See my [prompts](https://github.com/cressie176/prompts) repository

## Usage

### GitHub Repository

Access resources and prompts from a GitHub repository:

```bash
npx --yes github:cressie176/mcp-server --repository-type github --user your-user --repository your-repo
```

**GitHub Options:**
- `--user`: GitHub username
- `--organisation`: GitHub organisation name
- `--repository`: Repository name
- `--ref`: Git reference (default: `heads/main`)
- `--path`: Path within the repository (optional)
- `--log-level`: Logging level (debug, info, warn, error, off)
- `--log-file`: Log file path (default: debug.log)

### Local File System

Access resources and prompts from a local directory (useful for testing):

```bash
npx --yes github:cressie176/mcp-server --repository-type filesystem --path ./path/to/folder
```

**File System Options:**
- `--path`: Path to the directory containing your resources and prompts
- `--log-level`: Logging level (debug, info, warn, error, off)
- `--log-file`: Log file path (default: debug.log)

## Repository Structure

Your repository (whether GitHub or local file system) should follow this structure:

```
├── index.json          # Defines available resources and prompts
├── resources/          # Directory containing resource files
│   └── *.md           # Markdown resource files
└── prompts/           # Directory containing prompt files
    └── *.md           # Markdown prompt files
```

### index.json Format

```json
{
  "resources": [
    {
      "name": "code-standards",
      "description": "Coding standards and guidelines"
    }
  ],
  "prompts": [
    {
      "name": "code-review",
      "description": "Perform a comprehensive code review"
    }
  ]
}
```

## Claude Configuration

Add the following to your claude configuration file:

```json
{
  "mcpServers": {
    "mcp-server": {
      "command": "npx",
      "args": [
        "--yes",
        "github:cressie176/mcp-server",
        "--repository-type",
        "filesystem",
        "--path",
        "/path/to/your/data"
      ]
    }
  }
}
```

For GitHub repositories:

```json
{
  "mcpServers": {
    "mcp-server": {
      "command": "npx",
      "args": [
        "--yes",
        "github:cressie176/mcp-server"
        "--repository-type", "github",
        "--user", "your-username",
        "--repository", "your-repo"
      ]
    }
  }
}
```

## Development

### Debugging with MCP Inspector

Use the MCP Inspector to debug and test your server:

```bash
npx @modelcontextprotocol/inspector node index.js --repository-type filesystem --path ./test/data
```

This will open a web interface where you can:
- Test resource and prompt listings
- Inspect server responses
- Debug communication between client and server

### Running Tests

```bash
npm test
```

### Code Style

```bash
npm run lint
npm run format
```

## License

ISC
