### Example 3: Zero-Trust Infrastructure as Code
```hcl
# terraform/zero-trust/main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
}

# Zero-trust VPC with micro-segmentation
resource "aws_vpc" "zero_trust" {
  cidr_block = "10.0.0.0/16"
  
  enable_dns_hostnames = true
  enable_dns_support = true
  
  tags = {
    Name = "zero-trust-vpc"
    SecurityModel = "zero-trust"
    MicroSegmentation = "enabled"
  }
}

# Private subnets for zero-trust architecture
resource "aws_subnet" "zero_trust_private" {
  count = 3
  
  vpc_id = aws_vpc.zero_trust.id
  cidr_block = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  tags = {
    Name = "zero-trust-private-${count.index + 1}"
    Type = "private"
    SecurityZone = "restricted"
  }
}

# Security groups with least privilege access
resource "aws_security_group" "zero_trust_web" {
  name_prefix = "zero-trust-web-"
  vpc_id = aws_vpc.zero_trust.id
  
  # Ingress rules - only allow specific sources
  ingress {
    from_port = 443
    to_port = 443
    protocol = "tcp"
    security_groups = [aws_security_group.zero_trust_alb.id]
    description = "HTTPS from ALB only"
  }
  
  # Egress rules - only allow specific destinations
  egress {
    from_port = 443
    to_port = 443
    protocol = "tcp"
    security_groups = [aws_security_group.zero_trust_database.id]
    description = "HTTPS to database only"
  }
  
  egress {
    from_port = 443
    to_port = 443
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS to external APIs"
  }
  
  tags = {
    Name = "zero-trust-web-sg"
    SecurityModel = "zero-trust"
    Principle = "least-privilege"
  }
}

resource "aws_security_group" "zero_trust_database" {
  name_prefix = "zero-trust-database-"
  vpc_id = aws_vpc.zero_trust.id
  
  # Only allow access from web tier
  ingress {
    from_port = 5432
    to_port = 5432
    protocol = "tcp"
    security_groups = [aws_security_group.zero_trust_web.id]
    description = "PostgreSQL from web tier only"
  }
  
  # No outbound internet access
  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    self = true
    description = "Internal communication only"
  }
  
  tags = {
    Name = "zero-trust-database-sg"
    SecurityModel = "zero-trust"
    Principle = "no-internet-access"
  }
}

# Identity and Access Management
resource "aws_iam_role" "zero_trust_application" {
  name = "zero-trust-application-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
        Condition = {
          StringEquals = {
            "aws:RequestedRegion" = var.aws_region
          }
          IpAddress = {
            "aws:SourceIp" = aws_vpc.zero_trust.cidr_block
          }
        }
      }
    ]
  })
  
  tags = {
    Name = "zero-trust-application-role"
    SecurityModel = "zero-trust"
    Principle = "least-privilege"
  }
}

resource "aws_iam_policy" "zero_trust_application" {
  name = "zero-trust-application-policy"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/zero-trust/*"
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = "arn:aws:secretsmanager:${var.aws_region}:${data.aws_caller_identity.current.account_id}:secret:zero-trust/*"
        Condition = {
          StringEquals = {
            "secretsmanager:ResourceTag/Application" = "zero-trust"
          }
        }
      }
    ]
  })
  
  tags = {
    Name = "zero-trust-application-policy"
    SecurityModel = "zero-trust"
  }
}

resource "aws_iam_role_policy_attachment" "zero_trust_application" {
  role = aws_iam_role.zero_trust_application.name
  policy_arn = aws_iam_policy.zero_trust_application.arn
}

# WAF for application protection
resource "aws_wafv2_web_acl" "zero_trust" {
  name = "zero-trust-waf"
  scope = "REGIONAL"
  
  default_action {
    block {}
  }
  
  # Allow only authenticated requests
  rule {
    name = "AllowAuthenticatedRequests"
    priority = 1
    
    action {
      allow {}
    }
    
    statement {
      and_statement {
        statement {
          byte_match_statement {
            search_string = "Bearer "
            field_to_match {
              single_header {
                name = "authorization"
              }
            }
            text_transformation {
              priority = 0
              type = "NONE"
            }
            positional_constraint = "STARTS_WITH"
          }
        }
        statement {
          size_constraint_statement {
            field_to_match {
              single_header {
                name = "authorization"
              }
            }
            comparison_operator = "GT"
            size = 50
            text_transformation {
              priority = 0
              type = "NONE"
            }
          }
        }
      }
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name = "AllowAuthenticatedRequests"
      sampled_requests_enabled = true
    }
  }
  
  # Block suspicious patterns
  rule {
    name = "BlockSuspiciousPatterns"
    priority = 2
    
    action {
      block {}
    }
    
    statement {
      or_statement {
        statement {
          sqli_match_statement {
            field_to_match {
              all_query_arguments {}
            }
            text_transformation {
              priority = 0
              type = "URL_DECODE"
            }
            text_transformation {
              priority = 1
              type = "HTML_ENTITY_DECODE"
            }
          }
        }
        statement {
          xss_match_statement {
            field_to_match {
              all_query_arguments {}
            }
            text_transformation {
              priority = 0
              type = "URL_DECODE"
            }
            text_transformation {
              priority = 1
              type = "HTML_ENTITY_DECODE"
            }
          }
        }
      }
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name = "BlockSuspiciousPatterns"
      sampled_requests_enabled = true
    }
  }
  
  tags = {
    Name = "zero-trust-waf"
    SecurityModel = "zero-trust"
    Component = "application-protection"
  }
  
  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name = "ZeroTrustWAF"
    sampled_requests_enabled = true
  }
}

# CloudTrail for comprehensive auditing
resource "aws_cloudtrail" "zero_trust" {
  name = "zero-trust-audit-trail"
  s3_bucket_name = aws_s3_bucket.zero_trust_audit.bucket
  
  include_global_service_events = true
  is_multi_region_trail = true
  enable_logging = true
  
  event_selector {
    read_write_type = "All"
    include_management_events = true
    
    data_resource {
      type = "AWS::S3::Object"
      values = ["${aws_s3_bucket.zero_trust_audit.arn}/*"]
    }
  }
  
  insight_selector {
    insight_type = "ApiCallRateInsight"
  }
  
  tags = {
    Name = "zero-trust-audit-trail"
    SecurityModel = "zero-trust"
    Component = "audit-logging"
  }
}

# S3 bucket for audit logs
resource "aws_s3_bucket" "zero_trust_audit" {
  bucket = "zero-trust-audit-logs-${random_id.bucket_suffix.hex}"
  
  tags = {
    Name = "zero-trust-audit-logs"
    SecurityModel = "zero-trust"
    Component = "audit-storage"
  }
}

resource "aws_s3_bucket_encryption" "zero_trust_audit" {
  bucket = aws_s3_bucket.zero_trust_audit.id
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
      bucket_key_enabled = true
    }
  }
}

resource "aws_s3_bucket_public_access_block" "zero_trust_audit" {
  bucket = aws_s3_bucket.zero_trust_audit.id
  
  block_public_acls = true
  block_public_policy = true
  ignore_public_acls = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "zero_trust_audit" {
  bucket = aws_s3_bucket.zero_trust_audit.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

# GuardDuty for threat detection
resource "aws_guardduty_detector" "zero_trust" {
  enable = true
  
  datasources {
    s3_logs {
      enable = true
    }
    kubernetes {
      audit_logs {
        enable = true
      }
    }
    malware_protection {
      scan_ec2_instance_with_findings {
        ebs_volumes {
          enable = true
        }
      }
    }
  }
  
  tags = {
    Name = "zero-trust-guardduty"
    SecurityModel = "zero-trust"
    Component = "threat-detection"
  }
}

# Random ID for unique resource naming
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}
```

