terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  default = "us-east-1"
}

variable "environment" {
  default = "production"
}

# ECS Cluster for running the Agentic Runtime
resource "aws_ecs_cluster" "agentic_runtime" {
  name = "agentic-runtime-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "runtime_logs" {
  name              = "/ecs/agentic-runtime-${var.environment}"
  retention_in_days = 30
}

# ECR Repository for container images
resource "aws_ecr_repository" "runtime" {
  name                 = "agentic-runtime"
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

output "cluster_arn" {
  value = aws_ecs_cluster.agentic_runtime.arn
}

output "ecr_url" {
  value = aws_ecr_repository.runtime.repository_url
}
