# Claude Code Usage Monitor for macOS

Real-time monitoring app for Claude Code token usage in macOS menu bar.

## Key Features

- **Real-time Monitoring**: Display current session token usage in menu bar
- **5-hour Period Tracking**: Track usage within Claude's 5-hour reset cycle
- **Usage Percentage**: Visual representation of usage against maximum tokens
- **Customizable**: Adjust maximum token limits based on your plan

## Token Limit Guide

Default is set to 88,000 tokens (Max 5x plan). Adjustable based on your plan:

| Plan | Monthly Cost | Estimated Token Limit* |
|------|-------------|----------------------|
| Pro | $20/month | ~44,000 tokens |
| Max 5x | $100/month | ~88,000 tokens |
| Max 20x | $200/month | ~220,000 tokens |

*Reference: [Source](https://hostbor.com/claude-ai-max-plan-explained/) (unofficial estimates)

## Screenshots

### Menu Bar Display
<img width="232" height="24" alt="Menu bar screenshot" src="https://github.com/user-attachments/assets/83f8db90-1f5b-4e19-ac10-a87255f14352" />

### Details Window
<img width="401" height="600" alt="Details window screenshot" src="https://github.com/user-attachments/assets/832eb79b-0965-412e-a5e4-c6560949c608" />

## Installation

### Quick Install (DMG File)

1. Clone and build the project:
```bash
git clone https://github.com/your-username/claude-usage-macos.git
cd claude-usage-macos
npm install
npm run build
```

2. Open and install the generated `Claude Code Usage Monitor-x.x.x-arm64.dmg` file from the `dist` folder.

### Development Setup

1. Install dependencies:
```bash
npm install
```

2. Run in development mode:
```bash
npm run dev
```

## Usage

### Basic Usage
1. Launch the app to see token usage displayed in the menu bar
2. Click the menu bar icon to open the options menu

### Menu Options
- **Show Details**: Open detailed usage information window
- **Refresh**: Manually refresh data
- **Quit**: Exit the application

### Details Window
The "Show Details" option displays:
- Current session token usage and cost
- Today's total usage
- Model-specific detailed information
- Auto-refresh (1-minute intervals)

## Tech Stack

- **Electron**: Cross-platform desktop app framework
- **ccusage**: Claude Code usage data collection ([GitHub](https://github.com/ryoppippi/ccusage))
- **Node.js**: JavaScript runtime

## License

MIT License

## Contributing

Issues and pull requests are always welcome!