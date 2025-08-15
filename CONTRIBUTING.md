# 🤝 Contributing to Shortcut to Notion

Thank you for your interest in contributing to Shortcut to Notion! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch
4. **Make** your changes
5. **Test** thoroughly
6. **Submit** a pull request

## 📋 Prerequisites

- **Node.js** 22.15.1 or higher
- **pnpm** 10.11.0 or higher
- **Git** for version control
- **Chrome/Firefox** for testing

## 🛠️ Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/shortcut-to-notion.git
cd shortcut-to-notion

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## 🎯 Development Workflow

### 1. **Choose an Issue**
- Check the [Issues](https://github.com/yourusername/shortcut-to-notion/issues) page
- Look for issues labeled `good first issue`, `help wanted`, or `enhancement`
- Comment on the issue to let others know you're working on it

### 2. **Create a Branch**
```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/your-bug-description
```

### 3. **Make Your Changes**
- Write clean, readable code
- Follow the existing code style
- Add tests for new functionality
- Update documentation if needed

### 4. **Test Your Changes**
```bash
# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Type checking
pnpm type-check

# Build the extension
pnpm build

# Test in browser
# Load the dist folder in Chrome/Firefox
```

### 5. **Commit Your Changes**
```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "feat: add new feature description

- Detailed description of changes
- Any breaking changes
- Closes #123"
```

### 6. **Push and Create PR**
```bash
# Push your branch
git push origin feature/your-feature-name

# Create a pull request on GitHub
```

## 📝 Code Style Guidelines

### **TypeScript**
- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### **React Components**
- Use functional components with hooks
- Prefer composition over inheritance
- Keep components focused and single-purpose
- Use proper prop types and validation

### **CSS/Styling**
- Use Tailwind CSS utility classes
- Follow BEM methodology for custom CSS
- Ensure responsive design
- Support both light and dark themes

### **Accessibility**
- Use semantic HTML elements
- Provide proper ARIA labels
- Ensure keyboard navigation
- Test with screen readers

## 🧪 Testing Guidelines

### **Unit Tests**
- Write tests for all new functionality
- Aim for high test coverage
- Use descriptive test names
- Mock external dependencies

### **Manual Testing**
- Test on different browsers (Chrome, Firefox)
- Test on various screen sizes
- Verify accessibility features
- Test error scenarios

### **End-to-End Tests**
- Test complete user workflows
- Verify Notion integration
- Test data extraction accuracy
- Validate error handling

## 📚 Documentation

### **Code Documentation**
- Document complex algorithms
- Explain business logic
- Add examples for API usage
- Keep documentation up-to-date

### **User Documentation**
- Update README.md for new features
- Add screenshots for UI changes
- Document configuration options
- Provide troubleshooting guides

## 🔄 Pull Request Process

### **Before Submitting**
- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] No console.log statements
- [ ] No sensitive data in code

### **PR Description Template**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing done

## Screenshots
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

### **Review Process**
- Maintainers will review your PR
- Address any feedback or requested changes
- Keep discussions constructive and respectful
- Be patient during the review process

## 🐛 Bug Reports

### **Bug Report Template**
```markdown
## Bug Description
Clear description of the issue

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Browser: Chrome/Firefox version
- OS: Windows/macOS/Linux version
- Extension version: X.X.X

## Additional Information
Screenshots, console logs, etc.
```

## 💡 Feature Requests

### **Feature Request Template**
```markdown
## Feature Description
Clear description of the requested feature

## Use Case
Why this feature would be useful

## Proposed Solution
How you think it should work

## Alternatives Considered
Other approaches you've thought about

## Additional Context
Any other relevant information
```

## 🏷️ Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority: high` - High priority issue
- `priority: low` - Low priority issue

## 📞 Getting Help

### **Discussions**
- Use [GitHub Discussions](https://github.com/yourusername/shortcut-to-notion/discussions) for questions
- Ask for help with implementation
- Share ideas and suggestions

### **Issues**
- Create an issue for bugs
- Use discussions for questions
- Be specific and provide context

### **Community**
- Join our community channels
- Help other contributors
- Share your experience

## 🎉 Recognition

### **Contributor Types**
- **Code Contributors** - Write code, fix bugs, add features
- **Documentation Contributors** - Improve docs, add examples
- **Testing Contributors** - Test features, report bugs
- **Community Contributors** - Help others, answer questions

### **Contributor Benefits**
- Recognition in README
- Contributor badge on profile
- Early access to new features
- Direct influence on project direction

## 📄 License

By contributing to Shortcut to Notion, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You

Thank you for contributing to Shortcut to Notion! Every contribution, no matter how small, helps make this extension better for everyone.

---

**Questions?** Feel free to ask in [GitHub Discussions](https://github.com/yourusername/shortcut-to-notion/discussions) or create an issue. 