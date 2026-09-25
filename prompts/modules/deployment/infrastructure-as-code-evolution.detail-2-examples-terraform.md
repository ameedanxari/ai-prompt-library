### Example 2: Advanced Terraform with AI Optimization
```hcl
# terraform/intelligent-infrastructure/main.tf
terraform {
  required_version = ">= 1.6"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
  }
  
  backend "s3" {
    bucket         = "intelligent-infrastructure-state"
    key            = "terraform/state"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}

# AI-driven infrastructure optimization module
module "intelligent_infrastructure" {
  source = "./modules/intelligent-infrastructure"
  
  # AI optimization configuration
  ai_optimization = {
    enabled = true
    objectives = ["cost", "performance", "reliability"]
    learning_mode = "continuous"
    optimization_frequency = "daily"
  }
  
  # Resource optimization parameters
  resource_optimization = {
    cpu_target_utilization = 70
    memory_target_utilization = 80
    cost_optimization_enabled = true
    performance_optimization_enabled = true
  }
  
  # Self-healing configuration
  self_healing = {
    enabled = true
    auto_remediation = true
    learning_enabled = true
    mttr_target = 300 # 5 minutes
  }
  
  # Compliance and security
  compliance = {
    frameworks = ["CIS", "NIST", "SOC2"]
    automated_remediation = true
    continuous_monitoring = true
  }
  
  # Environment configuration
  environment = var.environment
  region = var.region
  availability_zones = var.availability_zones
  
  tags = {
    Environment = var.environment
    ManagedBy = "intelligent-terraform"
    AIOptimized = "true"
  }
}

# Intelligent compute resources with AI optimization
resource "aws_launch_template" "intelligent_compute" {
  name_prefix = "intelligent-compute-"
  
  # AI-optimized instance configuration
  image_id = data.aws_ami.optimized.id
  instance_type = local.ai_optimized_instance_type
  
  vpc_security_group_ids = [aws_security_group.intelligent_compute.id]
  
  user_data = base64encode(templatefile("${path.module}/user-data/intelligent-bootstrap.sh", {
    ai_optimization_enabled = var.ai_optimization.enabled
    self_healing_enabled = var.self_healing.enabled
    monitoring_endpoint = aws_cloudwatch_log_group.intelligent_monitoring.name
  }))
  
  # AI-driven resource optimization
  monitoring {
    enabled = true
  }
  
  metadata_options {
    http_endpoint = "enabled"
    http_tokens = "required"
    http_put_response_hop_limit = 2
  }
  
  tag_specifications {
    resource_type = "instance"
    tags = merge(var.tags, {
      Name = "intelligent-compute-instance"
      AIOptimized = "true"
      SelfHealing = "enabled"
    })
  }
  
  lifecycle {
    create_before_destroy = true
  }
}

# Auto Scaling Group with intelligent scaling policies
resource "aws_autoscaling_group" "intelligent_asg" {
  name = "intelligent-asg-${var.environment}"
  
  vpc_zone_identifier = var.private_subnet_ids
  target_group_arns = [aws_lb_target_group.intelligent_app.arn]
  health_check_type = "ELB"
  health_check_grace_period = 300
  
  min_size = local.ai_calculated_min_size
  max_size = local.ai_calculated_max_size
  desired_capacity = local.ai_calculated_desired_capacity
  
  launch_template {
    id = aws_launch_template.intelligent_compute.id
    version = "$Latest"
  }
  
  # AI-driven scaling policies
  enabled_metrics = [
    "GroupMinSize",
    "GroupMaxSize",
    "GroupDesiredCapacity",
    "GroupInServiceInstances",
    "GroupTotalInstances"
  ]
  
  tag {
    key = "Name"
    value = "intelligent-asg-instance"
    propagate_at_launch = true
  }
  
  tag {
    key = "AIOptimized"
    value = "true"
    propagate_at_launch = true
  }
  
  tag {
    key = "SelfHealing"
    value = "enabled"
    propagate_at_launch = true
  }
  
  lifecycle {
    create_before_destroy = true
  }
}

# Intelligent scaling policies with ML predictions
resource "aws_autoscaling_policy" "intelligent_scale_up" {
  name = "intelligent-scale-up-${var.environment}"
  scaling_adjustment = local.ai_calculated_scale_up_adjustment
  adjustment_type = "ChangeInCapacity"
  cooldown = local.ai_calculated_cooldown
  autoscaling_group_name = aws_autoscaling_group.intelligent_asg.name
  
  policy_type = "StepScaling"
  
  step_adjustment {
    scaling_adjustment = local.ai_calculated_step_adjustment_1
    metric_interval_lower_bound = 0
    metric_interval_upper_bound = 50
  }
  
  step_adjustment {
    scaling_adjustment = local.ai_calculated_step_adjustment_2
    metric_interval_lower_bound = 50
  }
}

resource "aws_autoscaling_policy" "intelligent_scale_down" {
  name = "intelligent-scale-down-${var.environment}"
  scaling_adjustment = local.ai_calculated_scale_down_adjustment
  adjustment_type = "ChangeInCapacity"
  cooldown = local.ai_calculated_cooldown
  autoscaling_group_name = aws_autoscaling_group.intelligent_asg.name
  
  policy_type = "StepScaling"
  
  step_adjustment {
    scaling_adjustment = local.ai_calculated_step_adjustment_down_1
    metric_interval_upper_bound = 0
    metric_interval_lower_bound = -50
  }
  
  step_adjustment {
    scaling_adjustment = local.ai_calculated_step_adjustment_down_2
    metric_interval_upper_bound = -50
  }
}

# CloudWatch alarms with intelligent thresholds
resource "aws_cloudwatch_metric_alarm" "intelligent_cpu_high" {
  alarm_name = "intelligent-cpu-high-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods = local.ai_calculated_evaluation_periods
  metric_name = "CPUUtilization"
  namespace = "AWS/EC2"
  period = local.ai_calculated_period
  statistic = "Average"
  threshold = local.ai_calculated_cpu_threshold_high
  alarm_description = "AI-optimized CPU utilization alarm"
  alarm_actions = [aws_autoscaling_policy.intelligent_scale_up.arn]
  
  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.intelligent_asg.name
  }
  
  tags = {
    Name = "intelligent-cpu-high-alarm"
    AIOptimized = "true"
  }
}

resource "aws_cloudwatch_metric_alarm" "intelligent_cpu_low" {
  alarm_name = "intelligent-cpu-low-${var.environment}"
  comparison_operator = "LessThanThreshold"
  evaluation_periods = local.ai_calculated_evaluation_periods
  metric_name = "CPUUtilization"
  namespace = "AWS/EC2"
  period = local.ai_calculated_period
  statistic = "Average"
  threshold = local.ai_calculated_cpu_threshold_low
  alarm_description = "AI-optimized CPU utilization alarm for scale down"
  alarm_actions = [aws_autoscaling_policy.intelligent_scale_down.arn]
  
  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.intelligent_asg.name
  }
  
  tags = {
    Name = "intelligent-cpu-low-alarm"
    AIOptimized = "true"
  }
}

# AI optimization data sources and calculations
data "external" "ai_optimization" {
  program = ["python3", "${path.module}/scripts/ai-optimization.py"]
  
  query = {
    environment = var.environment
    current_utilization = data.aws_cloudwatch_metric_statistics.current_cpu.maximum
    historical_data_days = 30
    optimization_objectives = jsonencode(var.ai_optimization.objectives)
  }
}

locals {
  # AI-calculated optimal values
  ai_optimized_instance_type = data.external.ai_optimization.result.optimal_instance_type
  ai_calculated_min_size = tonumber(data.external.ai_optimization.result.optimal_min_size)
  ai_calculated_max_size = tonumber(data.external.ai_optimization.result.optimal_max_size)
  ai_calculated_desired_capacity = tonumber(data.external.ai_optimization.result.optimal_desired_capacity)
  ai_calculated_cpu_threshold_high = tonumber(data.external.ai_optimization.result.optimal_cpu_threshold_high)
  ai_calculated_cpu_threshold_low = tonumber(data.external.ai_optimization.result.optimal_cpu_threshold_low)
  ai_calculated_scale_up_adjustment = tonumber(data.external.ai_optimization.result.optimal_scale_up_adjustment)
  ai_calculated_scale_down_adjustment = tonumber(data.external.ai_optimization.result.optimal_scale_down_adjustment)
  ai_calculated_cooldown = tonumber(data.external.ai_optimization.result.optimal_cooldown)
  ai_calculated_evaluation_periods = tonumber(data.external.ai_optimization.result.optimal_evaluation_periods)
  ai_calculated_period = tonumber(data.external.ai_optimization.result.optimal_period)
  ai_calculated_step_adjustment_1 = tonumber(data.external.ai_optimization.result.optimal_step_adjustment_1)
  ai_calculated_step_adjustment_2 = tonumber(data.external.ai_optimization.result.optimal_step_adjustment_2)
  ai_calculated_step_adjustment_down_1 = tonumber(data.external.ai_optimization.result.optimal_step_adjustment_down_1)
  ai_calculated_step_adjustment_down_2 = tonumber(data.external.ai_optimization.result.optimal_step_adjustment_down_2)
}
```

