# Contributing to HighwayLink

Thank you for your interest in contributing to HighwayLink! This document provides guidelines and information for developers working on this project.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Git Workflow](#git-workflow)
- [Viewing Repository Commits](#viewing-repository-commits)
- [Code Style Guidelines](#code-style-guidelines)
- [Submitting Changes](#submitting-changes)

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork locally
3. Set up the development environment (see README.md)
4. Create a new branch for your changes

## 🔄 Git Workflow

### Branch Naming Conventions

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation updates
- `hotfix/description` - Critical fixes

### Commit Message Guidelines

Follow conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Example:**
```
feat(rides): add real-time ride tracking

Implemented WebSocket connection for live ride updates.
Users can now see driver location in real-time.

Closes #123
```

## 📜 Viewing Repository Commits

### Method 1: Command Line (Git CLI)

#### View all commits
```bash
# View all commits with full details
git log

# View commits in one line format
git log --oneline

# View last 10 commits
git log -10

# View commits with graph visualization
git log --oneline --graph --all --decorate
```

#### View commits by author
```bash
# Commits by specific author
git log --author="Your Name"

# Commits by email
git log --author="email@example.com"
```

#### View commits by date range
```bash
# Commits since a specific date
git log --since="2024-01-01"

# Commits between dates
git log --since="2024-01-01" --until="2024-12-31"

# Commits in the last week
git log --since="1 week ago"
```

#### View commits for specific files
```bash
# Commits that modified a specific file
git log -- path/to/file

# Commits with patches for a file
git log -p -- path/to/file
```

#### View commit details
```bash
# Show specific commit details
git show <commit-hash>

# Show commit with file changes
git show <commit-hash> --stat

# Show commit with full diff
git show <commit-hash> -p
```

#### Search commits
```bash
# Search commits by message
git log --grep="bug fix"

# Search commits by code changes
git log -S "function name"

# Case-insensitive search
git log --grep="bug fix" -i
```

#### View commit statistics
```bash
# Show commit count by author
git shortlog -sn

# Show commit statistics
git log --stat

# Show files changed in each commit
git log --name-only
```

### Method 2: GitHub Web Interface

1. **Visit the Repository:**
   - Go to https://github.com/Jithnuka/highwaylink-app

2. **View Commits:**
   - Click on the "Commits" link (shows commit count, e.g., "123 commits")
   - Or click on the clock icon next to the branch dropdown
   - Browse through the commit history

3. **Filter Commits:**
   - Use the branch dropdown to view commits from different branches
   - Click on any commit to see detailed changes

4. **Search Commits:**
   - Use GitHub's search bar with commit-specific queries
   - Example: `author:username` or `committer-date:>=2024-01-01`

### Method 3: Using GitHub CLI (gh)

```bash
# Install GitHub CLI first (if not installed)
# https://cli.github.com/

# View repository commits
gh repo view Jithnuka/highwaylink-app --web

# List recent commits
gh api repos/Jithnuka/highwaylink-app/commits
```

### Method 4: Git GUI Tools

**Popular Git GUI applications:**
- **GitKraken**: Visual commit history with graphs
- **Sourcetree**: Free Git GUI by Atlassian
- **GitHub Desktop**: Simple interface for GitHub repos
- **GitLens** (VS Code extension): Powerful Git visualization in VS Code

### Quick Reference Commands

```bash
# Most commonly used commands for viewing commits

# Simple list of recent commits
git log --oneline -20

# Detailed view with graph
git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit

# See what changed in recent commits
git log -p -2

# View commits not yet pushed to remote
git log origin/main..HEAD

# View commits in current branch not in main
git log main..HEAD
```

## 🎨 Code Style Guidelines

### Frontend (React/JavaScript)

- Use functional components with hooks
- Follow ESLint configuration
- Use Tailwind CSS for styling
- Keep components small and focused
- Add PropTypes or TypeScript types

### Backend (Java/Spring Boot)

- Follow Java naming conventions
- Use meaningful variable and method names
- Add JavaDoc comments for public APIs
- Follow SOLID principles
- Write unit tests for business logic

## 📝 Submitting Changes

1. **Ensure your code is up to date:**
   ```bash
   git checkout main
   git pull origin main
   git checkout your-branch
   git rebase main
   ```

2. **Run tests:**
   - Frontend: `npm test` (in frontend directory)
   - Backend: `mvn test`

3. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: your descriptive message"
   ```

4. **Push to your fork:**
   ```bash
   git push origin your-branch
   ```

5. **Create a Pull Request:**
   - Go to GitHub and create a PR from your branch
   - Fill in the PR template
   - Link any related issues
   - Wait for code review

## 🧪 Testing

- Write tests for new features
- Ensure all existing tests pass
- Test on different browsers (for frontend changes)
- Test API endpoints (for backend changes)

## 📚 Additional Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev/)

## 🤝 Code Review Process

- All changes require at least one approval
- Address review comments promptly
- Keep PRs focused and reasonably sized
- Update documentation as needed

## ❓ Questions?

If you have any questions, feel free to:
- Open an issue for discussion
- Contact: jithnukaweerasingha@gmail.com
- Join our community discussions

---

Thank you for contributing to HighwayLink! 🚗✨
