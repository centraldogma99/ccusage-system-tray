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

### Prerequisites: Install Bun

This app requires Bun to be installed to work properly.

For installation instructions, please refer to the [Bun documentation](https://bun.com/).

Alternatively, you can use the provided bun_install_script.sh for easy installation:

```shell
sh bun_install_script.sh
```

### Method 1: Download from GitHub Releases (Recommended)
1. Visit the [Releases page](https://github.com/centraldogma99/claude-usage-macos/releases) for the latest version
2. Download the Apple Silicon Mac file: `Claude-Code-Usage-Monitor-x.x.x-arm64.dmg`
3. Open the DMG file and drag the app to your Applications folder

> **Note**: Currently only supports Apple Silicon (M1/M2/M3) Macs.

### Method 2: Build from Source
Build from the project root:
```bash
npm install
npm run build
```

Open and install the generated DMG file from the `dist` folder.

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