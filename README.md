# Medical Procedures Application Infrastructure on AWS

Welcome to the repository for the **Medical Procedures Application Infrastructure** built using the AWS Cloud Development Kit (CDK). This project defines and deploys the necessary AWS resources to support a scalable, secure, and reliable medical procedures application.

## Overview

This repository contains the CDK code to provision the infrastructure required for a medical procedures application. The infrastructure is designed to handle sensitive medical data while ensuring compliance with healthcare regulations such as HIPAA. The stack includes components like:

- **Amazon API Gateway** for RESTful API endpoints.
- **AWS Lambda** for serverless compute.
- **Amazon DynamoDB** for a managed no relational database.

## Prerequisites

Before deploying the infrastructure, ensure you have the following:

1. **AWS Account**: An active AWS account with sufficient permissions to create resources.
2. **AWS CLI**: Installed and configured with your credentials.
3. **Node.js**: Installed (version 20.x or higher recommended).
4. **AWS CDK**: Installed globally via `npm install -g aws-cdk`.
5. **Docker**: Installed and running via Docker Desktop
6. **AWS SAM CLI**: Installed to run lambdas locally

## Getting Started

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/JeanVittory/medical-procedures-platform-backend.git
   cd medical-procedures-infra
   npm install
   cdk bootstrap
   npm run deploy
   ```

## Check lambdas locally

1. Having the AWS SAML CLI already installed:
   ```bash
   npm run dev
   ```

## Environment Variables

The `.env.example` file contains a template for the required environment variables. Before deploying the stack, rename this file to `.env` and populate it with the appropriate values.
