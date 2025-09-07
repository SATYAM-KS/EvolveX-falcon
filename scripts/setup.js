#!/usr/bin/env node

/**
 * EVOLVEX BLOCKFREE Setup Script
 * 
 * This script helps set up the development environment
 * for the EVOLVEX BLOCKFREE project.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 EVOLVEX BLOCKFREE Setup Script');
console.log('=====================================\n');

// Check if Node.js version is compatible
function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 18) {
    console.error('❌ Node.js version 18 or higher is required');
    console.error(`   Current version: ${nodeVersion}`);
    process.exit(1);
  }
  
  console.log(`✅ Node.js version: ${nodeVersion}`);
}

// Check if required tools are installed
function checkRequiredTools() {
  const tools = ['npm', 'git'];
  
  for (const tool of tools) {
    try {
      execSync(`${tool} --version`, { stdio: 'ignore' });
      console.log(`✅ ${tool} is installed`);
    } catch (error) {
      console.error(`❌ ${tool} is not installed`);
      process.exit(1);
    }
  }
}

// Create .env file from .env.example
function createEnvFile() {
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  const envPath = path.join(__dirname, '..', '.env');
  
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file already exists');
    return;
  }
  
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from .env.example');
    console.log('   Please update the .env file with your configuration');
  } else {
    console.log('⚠️  .env.example file not found');
  }
}

// Install dependencies
function installDependencies() {
  console.log('\n📦 Installing dependencies...');
  
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');
  } catch (error) {
    console.error('❌ Failed to install dependencies');
    console.error(error.message);
    process.exit(1);
  }
}

// Create necessary directories
function createDirectories() {
  const directories = [
    'screenshots',
    'docs',
    'tests',
    'scripts'
  ];
  
  for (const dir of directories) {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  }
}

// Display next steps
function displayNextSteps() {
  console.log('\n🎉 Setup completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Update the .env file with your configuration');
  console.log('2. Install Petra Wallet: https://petra.app/');
  console.log('3. Start the development server: npm run dev');
  console.log('4. Open http://localhost:5173 in your browser');
  console.log('\nFor more information, see the README.md file');
}

// Main setup function
function main() {
  try {
    checkNodeVersion();
    checkRequiredTools();
    createDirectories();
    createEnvFile();
    installDependencies();
    displayNextSteps();
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
main();
