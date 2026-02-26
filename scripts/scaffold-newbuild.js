const fs = require('fs');
const path = require('path');
const readline = require('readline');

const buildsDir = path.join(__dirname, '../content/publish/builds');

const template = (title, year) => `---
id: "${title.toLowerCase().replace(/\s+/g, '-')}"
title: "${title}"
date: "${year}-01-01"
type: "build"
tags: []
abstract: "Brief description of what this build was about"
publish: true
---

## Context

What was the situation? What prompted this build?

## Problem

What specific problem were you trying to solve?

## Hypothesis

What did you expect to happen?

## Architecture

Describe the system architecture.

## Stack Decisions

- **Framework**: Why you chose it
- **Database**: What you used and why
- **Hosting**: Where it's deployed

## What Broke

What challenges or failures did you encounter?

## Metrics

What success metrics did you track?

## Cost

What were the costs (time, money, resources)?

## Lessons

What did you learn?

## Next Iteration

What would you do differently?

## Links

- [Demo](https://example.com)
- [Repo](https://github.com/username/repo)
`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  const year = new Date().getFullYear();
  
  const title = await prompt('Build title: ');
  if (!title.trim()) {
    console.error('Title is required');
    process.exit(1);
  }
  
  const slug = title.toLowerCase().replace(/\s+/g, '-');
  const yearDir = path.join(buildsDir, year.toString());
  
  if (!fs.existsSync(yearDir)) {
    fs.mkdirSync(yearDir, { recursive: true });
  }
  
  const filePath = path.join(yearDir, `${slug}.md`);
  
  if (fs.existsSync(filePath)) {
    console.error(`File already exists: ${filePath}`);
    process.exit(1);
  }
  
  fs.writeFileSync(filePath, template(title, year));
  console.log(`Created: ${filePath}`);
  
  rl.close();
}

main();
