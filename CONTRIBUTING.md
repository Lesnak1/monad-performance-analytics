# 🤝 Contributing to MPAS

We're thrilled that you want to contribute to the **Monad Performance Analytics Suite**! This guide will help you get started.

## 🌟 **Ways to Contribute**

- 🐛 **Bug Reports**: Found an issue? Let us know!
- ✨ **Feature Requests**: Have ideas for new features?
- 💻 **Code Contributions**: Submit pull requests
- 📖 **Documentation**: Improve our docs
- 🧪 **Testing**: Help test new features
- 💡 **Ideas**: Share feedback and suggestions

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Basic knowledge of TypeScript/React

### Development Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/monad-performance-analytics.git
   cd monad-performance-analytics
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Visit http://localhost:3000**

## 📋 **Development Workflow**

### 1. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Your Changes
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes
```bash
# Run the development server
npm run dev

# Check for TypeScript errors
npm run type-check

# Test build process
npm run build
```

### 4. Commit Your Changes
```bash
git add .
git commit -m "✨ Add your feature description"
```

**Commit Message Format:**
- ✨ `:sparkles:` - New features
- 🐛 `:bug:` - Bug fixes
- 📖 `:books:` - Documentation
- 🔧 `:wrench:` - Configuration changes
- 🚀 `:rocket:` - Performance improvements
- 🎨 `:art:` - UI/UX improvements

### 5. Push and Create PR
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub!

## 🎯 **Contribution Areas**

### **🔥 High Priority**
- Real Foundry integration
- Database persistence (PostgreSQL)
- Advanced analytics features
- Performance optimizations

### **📊 Data & Analytics**
- New benchmark types
- Chart improvements
- Data export features
- Historical data analysis

### **🎨 Frontend**
- UI/UX improvements
- Mobile responsiveness
- Accessibility features
- Animation enhancements

### **⚙️ Backend**
- API optimizations
- Database improvements
- Error handling
- Security enhancements

### **🧪 Testing**
- Unit tests
- Integration tests
- E2E testing
- Performance testing

## 📝 **Code Style Guidelines**

### **TypeScript/React**
- Use TypeScript for all new code
- Follow existing naming conventions
- Use functional components with hooks
- Add proper TypeScript types

### **Styling**
- Use TailwindCSS classes
- Follow existing design patterns
- Maintain glassmorphism theme
- Ensure mobile responsiveness

### **File Structure**
```
frontend/
├── components/          # Reusable UI components
├── pages/              # Next.js pages
├── lib/                # Utility functions
├── styles/             # Global styles
└── types/              # TypeScript definitions
```

## 🐛 **Bug Reports**

**Before submitting a bug report:**
- Check existing issues
- Make sure it's reproducible
- Test with latest version

**Include in your bug report:**
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser/OS information

## ✨ **Feature Requests**

**Good feature requests include:**
- Clear problem description
- Proposed solution
- Use cases and benefits
- Mockups/wireframes (if UI related)

## 🔍 **Code Review Process**

1. **All PRs require review**
2. **Automated checks must pass**
3. **Maintain test coverage**
4. **Update documentation**
5. **Address reviewer feedback**

## 📚 **Resources**

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Monad Documentation](https://docs.monad.xyz/)

## 🤔 **Questions?**

- 💬 [GitHub Discussions](https://github.com/Lesnak1/monad-performance-analytics/discussions)
- 🐛 [Issues](https://github.com/Lesnak1/monad-performance-analytics/issues)
- 🐦 [Twitter: @Lesnak1](https://twitter.com/Lesnak1)

## 🙏 **Recognition**

Contributors will be:
- Listed in our README
- Mentioned in release notes
- Credited in documentation

## 📄 **License**

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for helping make MPAS better! 🚀** 