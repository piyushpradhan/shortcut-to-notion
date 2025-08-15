# 🚀 Shortcut to Notion - Professional Browser Extension

> **Seamlessly sync your Shortcut (formerly Clubhouse) stories to Notion databases with a beautiful, intuitive interface.**

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Available-brightgreen?style=for-the-badge&logo=google-chrome)](https://chrome.google.com/webstore)
[![Firefox Add-ons](https://img.shields.io/badge/Firefox%20Add--ons-Available-brightgreen?style=for-the-badge&logo=firefox-browser)](https://addons.mozilla.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1+-blue?style=for-the-badge&logo=react)](https://reactjs.org/)

## ✨ Features

### 🎯 **Smart Data Extraction**
- **Automatic detection** of story details from Shortcut pages
- **Intelligent parsing** of titles, priorities, IDs, types, and status
- **Fallback handling** when auto-extraction isn't possible

### 🎨 **Professional UI/UX**
- **Modern, polished interface** with smooth animations
- **Responsive design** that works on all screen sizes
- **Dark/Light theme support** with system preference detection
- **Beautiful icons** and visual feedback for all actions
- **Accessibility-first** design with keyboard navigation support

### 🔄 **Seamless Notion Integration**
- **Upsert functionality** - creates new entries or updates existing ones
- **Smart duplicate detection** based on story IDs
- **Real-time status updates** with success/error feedback
- **Automatic URL tracking** for easy reference back to Shortcut

### 🚀 **Performance & Reliability**
- **Lightning-fast** data extraction and submission
- **Error handling** with user-friendly messages
- **Loading states** and progress indicators
- **Offline resilience** with graceful degradation

## 🖼️ Screenshots

![Extension Popup](https://via.placeholder.com/400x500/3B82F6/FFFFFF?text=Beautiful+Popup+Interface)
![Data Extraction](https://via.placeholder.com/400x500/10B981/FFFFFF?text=Smart+Data+Extraction)
![Notion Integration](https://via.placeholder.com/400x500/8B5CF6/FFFFFF?text=Seamless+Notion+Sync)

## 🛠️ Installation

### From Source
```bash
# Clone the repository
git clone https://github.com/yourusername/shortcut-to-notion.git
cd shortcut-to-notion

# Install dependencies
pnpm install

# Build the extension
pnpm build

# Load in Chrome/Firefox
# 1. Open chrome://extensions/ or about:addons
# 2. Enable Developer mode
# 3. Click "Load unpacked" and select the dist folder
```

### From Web Store
- **Chrome**: [Chrome Web Store](https://chrome.google.com/webstore)
- **Firefox**: [Firefox Add-ons](https://addons.mozilla.org)

## ⚙️ Configuration

### First-Time Setup
When you first install the extension, you'll need to configure your Notion integration:

1. **Click the settings icon** (⚙️) in the extension popup
2. **Enter your Notion API Token** - Get this from [Notion Integrations](https://www.notion.so/my-integrations)
3. **Enter your Database ID** - Found in your database URL after the last slash
4. **Click "Save Configuration"** - The extension will validate your credentials

### Notion Setup
1. **Create an integration** at [Notion Integrations](https://www.notion.so/my-integrations)
2. **Share your database** with the integration
3. **Copy the database ID** from the URL (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### Security
- Your API token is stored securely in your browser's local storage
- It's never sent to our servers or shared with third parties
- You can update your configuration anytime from the popup settings

## 🎯 Usage

### Basic Workflow
1. **Navigate** to a Shortcut story page
2. **Click** the extension icon in your browser
3. **Review** the auto-extracted data
4. **Modify** any fields if needed
5. **Click** "Save to Notion" to sync

### 🎹 Keyboard Shortcuts
- **`Ctrl+Shift+M`** (Windows/Linux) or **`Cmd+Shift+S`** (macOS) - Open the popup
- **`Enter`** - Submit the form when focused on any input field
- **`Escape`** - Close the popup (when supported by the browser)

### Supported Fields
- **Story Title** - Main story description
- **Priority** - Highest, High, Medium, Low, Lowest, or P5
- **Story ID** - Unique identifier (e.g., CH-123)
- **Type** - Feature, Bug, Story, Task, Epic
- **Status** - Ready for Development, In Progress, In Review, Done, Blocked

## 🏗️ Architecture

```
src/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── services/           # API and business logic
├── types/              # TypeScript type definitions
├── utils/              # Helper functions
└── styles/             # CSS and styling
```

### Tech Stack
- **Frontend**: React 19.1+ with TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Build**: Vite with hot module replacement
- **State**: React hooks with local storage
- **Icons**: Custom SVG icons with accessibility support

## 🔧 Development

### Prerequisites
- Node.js 22.15.1+
- pnpm 10.11.0+

### Available Scripts
```bash
# Development
pnpm dev              # Start development server
pnpm dev:firefox      # Firefox-specific development

# Building
pnpm build            # Production build
pnpm build:firefox    # Firefox-specific build

# Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix linting issues
pnpm type-check       # TypeScript type checking
pnpm format           # Format code with Prettier

# Testing
pnpm test             # Run test suite
pnpm test:e2e         # End-to-end testing
```

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

## 🧪 Testing

### Unit Tests
```bash
pnpm test
```

### End-to-End Tests
```bash
pnpm test:e2e
```

### Manual Testing
- Test on different Shortcut page types
- Verify Notion integration works correctly
- Check responsive design on various screen sizes
- Validate accessibility features

## 📦 Distribution

### Building for Production
```bash
# Create production build
pnpm build

# Package for distribution
pnpm zip
```

### Browser Store Submission
- **Chrome**: Submit to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- **Firefox**: Submit to [Firefox Add-ons Developer Hub](https://addons.mozilla.org/developers/)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Code Style
- **TypeScript** for type safety
- **ESLint** + **Prettier** for code formatting
- **Conventional Commits** for commit messages
- **Accessibility** as a first-class concern

### Pull Request Process
1. **Update** documentation if needed
2. **Add** tests for new functionality
3. **Ensure** all tests pass
4. **Update** version numbers appropriately

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Shortcut** team for the amazing project management platform
- **Notion** team for the powerful API and database features
- **React** and **Vite** communities for the excellent tooling
- **Open source contributors** who made this possible

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/shortcut-to-notion/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/shortcut-to-notion/discussions)
- **Email**: support@shortcut-to-notion.com

## 🔮 Roadmap

- [ ] **Bulk import** functionality
- [ ] **Custom field mapping** for different Notion databases
- [ ] **Template support** for common story types
- [ ] **Analytics dashboard** for sync statistics
- [ ] **Team collaboration** features
- [ ] **API rate limiting** and optimization
- [ ] **Offline mode** with sync queue
- [ ] **Multi-language** support

---

<div align="center">

**Made with ❤️ for developers who love productivity**

[![GitHub stars](https://img.shields.io/github/stars/yourusername/shortcut-to-notion?style=social)](https://github.com/yourusername/shortcut-to-notion)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/shortcut-to-notion?style=social)](https://github.com/yourusername/shortcut-to-notion)
[![GitHub issues](https://img.shields.io/github/issues/yourusername/shortcut-to-notion)](https://github.com/yourusername/shortcut-to-notion/issues)

</div>
