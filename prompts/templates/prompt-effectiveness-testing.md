# Prompt Effectiveness Testing Template

## Purpose
Test and validate the effectiveness of prompts in real-world scenarios to ensure they consistently produce high-quality, accurate, and useful results.

## Instructions
Use this template to systematically test prompt effectiveness across multiple dimensions including functionality, performance, consistency, and usability. Set up controlled testing environments, define clear success criteria, and implement automated testing pipelines to ensure prompts meet quality standards before deployment.

## Examples
```markdown
# Example: Testing a Code Generation Prompt

## Test Plan
**Prompt**: Generate React component for user authentication
**Test Scenarios**: 
- Basic login form
- Registration form with validation
- Password reset functionality
- Social login integration

## Test Results
- **Functional Success**: 94% (47/50 test cases passed)
- **Performance**: Average 2.3s execution time (within 3s target)
- **Consistency**: 96% similarity across runs
- **Usability**: 8.2/10 average user rating

## Issues Found
- Missing error handling in 3 test cases
- Inconsistent styling approach in 2 cases
- Performance degradation with complex validation rules

## Improvements Applied
- Added error handling examples
- Standardized styling guidelines
- Optimized validation logic patterns
```

## Effectiveness Testing Framework

### Testing Methodology
```markdown
## Comprehensive Testing Approach

### Test Categories
#### Functional Effectiveness Testing
**Objective**: Verify prompts achieve their intended functional outcomes
**Method**: Execute prompts with various inputs and validate outputs against requirements
**Success Criteria**: 95%+ success rate in achieving specified objectives

#### Performance Effectiveness Testing
**Objective**: Measure prompt execution efficiency and resource utilization
**Method**: Monitor execution time, token usage, and computational resources
**Success Criteria**: Execution within defined performance budgets

#### Consistency Effectiveness Testing
**Objective**: Ensure prompts produce consistent results across multiple executions
**Method**: Run identical prompts multiple times and measure result variance
**Success Criteria**: <5% variance in output quality and structure

#### Usability Effectiveness Testing
**Objective**: Validate prompts are easy to understand and follow
**Method**: User testing with target audience, feedback collection
**Success Criteria**: 8/10+ average usability rating

### Test Environment Setup
#### Controlled Testing Environment
```bash
#!/bin/bash
# Test environment setup script

# Create isolated testing environment
mkdir -p test_environment/{inputs,outputs,logs,reports}

# Set up test data
cp test_data/* test_environment/inputs/

# Configure logging
export TEST_LOG_LEVEL=DEBUG
export TEST_OUTPUT_DIR="test_environment/outputs"
export TEST_REPORT_DIR="test_environment/reports"

# Initialize test database
sqlite3 test_environment/test_results.db < schema.sql

echo "Test environment ready"
```

#### Test Data Management
- **Representative Data**: Real-world representative test cases
- **Edge Cases**: Boundary conditions and unusual scenarios
- **Error Conditions**: Invalid inputs and error scenarios
- **Performance Data**: Large datasets for performance testing
- **Regression Data**: Historical test cases for regression testing
```

### Automated Testing Framework
```markdown
## Automated Test Execution

### Test Runner Implementation
```python
#!/usr/bin/env python3
"""
Prompt Effectiveness Test Runner
Executes comprehensive effectiveness tests for prompt templates
"""

import json
import time
import sqlite3
import statistics
from typing import Dict, List, Any, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime
import subprocess
import logging

@dataclass
class TestResult:
    test_id: str
    prompt_id: str
    test_type: str
    success: bool
    execution_time: float
    token_usage: int
    output_quality_score: float
    error_message: str = ""
    timestamp: datetime = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()

class PromptEffectivenessTest:
    def __init__(self, config_path: str = "test_config.json"):
        with open(config_path, 'r') as f:
            self.config = json.load(f)
        
        self.db_connection = sqlite3.connect(self.config['database_path'])
        self.setup_database()
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
    
    def setup_database(self):
        """Initialize test results database"""
        cursor = self.db_connection.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS test_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                test_id TEXT,
                prompt_id TEXT,
                test_type TEXT,
                success BOOLEAN,
                execution_time REAL,
                token_usage INTEGER,
                output_quality_score REAL,
                error_message TEXT,
                timestamp DATETIME
            )
        ''')
        self.db_connection.commit()
    
    def run_functional_test(self, prompt_path: str, test_case: Dict) -> TestResult:
        """Execute functional effectiveness test"""
        start_time = time.time()
        
        try:
            # Execute prompt with test input
            result = self.execute_prompt(prompt_path, test_case['input'])
            
            # Validate output
            success = self.validate_output(result, test_case['expected_output'])
            quality_score = self.calculate_quality_score(result, test_case)
            
            execution_time = time.time() - start_time
            
            return TestResult(
                test_id=test_case['id'],
                prompt_id=prompt_path,
                test_type='functional',
                success=success,
                execution_time=execution_time,
                token_usage=result.get('token_usage', 0),
                output_quality_score=quality_score
            )
            
        except Exception as e:
            return TestResult(
                test_id=test_case['id'],
                prompt_id=prompt_path,
                test_type='functional',
                success=False,
                execution_time=time.time() - start_time,
                token_usage=0,
                output_quality_score=0.0,
                error_message=str(e)
            )
    
    def run_performance_test(self, prompt_path: str, test_case: Dict) -> TestResult:
        """Execute performance effectiveness test"""
        execution_times = []
        token_usages = []
        
        # Run multiple iterations for statistical significance
        for i in range(self.config['performance_test_iterations']):
            start_time = time.time()
            
            try:
                result = self.execute_prompt(prompt_path, test_case['input'])
                execution_time = time.time() - start_time
                
                execution_times.append(execution_time)
                token_usages.append(result.get('token_usage', 0))
                
            except Exception as e:
                self.logger.error(f"Performance test iteration {i} failed: {e}")
        
        if not execution_times:
            return TestResult(
                test_id=test_case['id'],
                prompt_id=prompt_path,
                test_type='performance',
                success=False,
                execution_time=0,
                token_usage=0,
                output_quality_score=0.0,
                error_message="All performance test iterations failed"
            )
        
        avg_execution_time = statistics.mean(execution_times)
        avg_token_usage = statistics.mean(token_usages)
        
        # Check against performance thresholds
        success = (
            avg_execution_time <= self.config['max_execution_time'] and
            avg_token_usage <= self.config['max_token_usage']
        )
        
        # Calculate performance score
        time_score = min(1.0, self.config['max_execution_time'] / avg_execution_time)
        token_score = min(1.0, self.config['max_token_usage'] / avg_token_usage)
        performance_score = (time_score + token_score) / 2
        
        return TestResult(
            test_id=test_case['id'],
            prompt_id=prompt_path,
            test_type='performance',
            success=success,
            execution_time=avg_execution_time,
            token_usage=int(avg_token_usage),
            output_quality_score=performance_score
        )
    
    def run_consistency_test(self, prompt_path: str, test_case: Dict) -> TestResult:
        """Execute consistency effectiveness test"""
        results = []
        
        # Run multiple executions with same input
        for i in range(self.config['consistency_test_iterations']):
            try:
                result = self.execute_prompt(prompt_path, test_case['input'])
                results.append(result)
            except Exception as e:
                self.logger.error(f"Consistency test iteration {i} failed: {e}")
        
        if len(results) < 2:
            return TestResult(
                test_id=test_case['id'],
                prompt_id=prompt_path,
                test_type='consistency',
                success=False,
                execution_time=0,
                token_usage=0,
                output_quality_score=0.0,
                error_message="Insufficient results for consistency analysis"
            )
        
        # Calculate consistency metrics
        consistency_score = self.calculate_consistency_score(results)
        avg_execution_time = statistics.mean([r.get('execution_time', 0) for r in results])
        avg_token_usage = statistics.mean([r.get('token_usage', 0) for r in results])
        
        success = consistency_score >= self.config['min_consistency_score']
        
        return TestResult(
            test_id=test_case['id'],
            prompt_id=prompt_path,
            test_type='consistency',
            success=success,
            execution_time=avg_execution_time,
            token_usage=int(avg_token_usage),
            output_quality_score=consistency_score
        )
    
    def execute_prompt(self, prompt_path: str, input_data: Dict) -> Dict:
        """Execute prompt with given input data"""
        # This would integrate with your actual prompt execution system
        # For now, this is a placeholder implementation
        
        command = [
            'python', 'prompt_executor.py',
            '--prompt', prompt_path,
            '--input', json.dumps(input_data)
        ]
        
        start_time = time.time()
        result = subprocess.run(command, capture_output=True, text=True)
        execution_time = time.time() - start_time
        
        if result.returncode != 0:
            raise Exception(f"Prompt execution failed: {result.stderr}")
        
        output = json.loads(result.stdout)
        output['execution_time'] = execution_time
        
        return output
    
    def validate_output(self, result: Dict, expected: Dict) -> bool:
        """Validate output against expected results"""
        # Implement your specific validation logic here
        required_fields = expected.get('required_fields', [])
        
        for field in required_fields:
            if field not in result:
                return False
        
        # Check output format
        if 'format' in expected:
            if not self.validate_format(result, expected['format']):
                return False
        
        # Check content quality
        if 'quality_criteria' in expected:
            if not self.validate_quality_criteria(result, expected['quality_criteria']):
                return False
        
        return True
    
    def calculate_quality_score(self, result: Dict, test_case: Dict) -> float:
        """Calculate output quality score"""
        score = 0.0
        criteria = test_case.get('quality_criteria', {})
        
        # Completeness score
        if 'completeness' in criteria:
            completeness = self.assess_completeness(result, criteria['completeness'])
            score += completeness * 0.3
        
        # Accuracy score
        if 'accuracy' in criteria:
            accuracy = self.assess_accuracy(result, criteria['accuracy'])
            score += accuracy * 0.4
        
        # Clarity score
        if 'clarity' in criteria:
            clarity = self.assess_clarity(result, criteria['clarity'])
            score += clarity * 0.3
        
        return min(1.0, score)
    
    def calculate_consistency_score(self, results: List[Dict]) -> float:
        """Calculate consistency score across multiple results"""
        if len(results) < 2:
            return 0.0
        
        # Compare structural consistency
        structure_scores = []
        for i in range(1, len(results)):
            structure_score = self.compare_structure(results[0], results[i])
            structure_scores.append(structure_score)
        
        # Compare content consistency
        content_scores = []
        for i in range(1, len(results)):
            content_score = self.compare_content(results[0], results[i])
            content_scores.append(content_score)
        
        avg_structure_consistency = statistics.mean(structure_scores)
        avg_content_consistency = statistics.mean(content_scores)
        
        return (avg_structure_consistency + avg_content_consistency) / 2
    
    def run_comprehensive_test_suite(self, prompt_path: str) -> Dict:
        """Run complete effectiveness test suite for a prompt"""
        test_cases = self.load_test_cases(prompt_path)
        results = []
        
        for test_case in test_cases:
            # Run functional tests
            if test_case['type'] == 'functional':
                result = self.run_functional_test(prompt_path, test_case)
                results.append(result)
                self.save_result(result)
            
            # Run performance tests
            elif test_case['type'] == 'performance':
                result = self.run_performance_test(prompt_path, test_case)
                results.append(result)
                self.save_result(result)
            
            # Run consistency tests
            elif test_case['type'] == 'consistency':
                result = self.run_consistency_test(prompt_path, test_case)
                results.append(result)
                self.save_result(result)
        
        return self.generate_test_report(prompt_path, results)
    
    def save_result(self, result: TestResult):
        """Save test result to database"""
        cursor = self.db_connection.cursor()
        cursor.execute('''
            INSERT INTO test_results 
            (test_id, prompt_id, test_type, success, execution_time, 
             token_usage, output_quality_score, error_message, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            result.test_id, result.prompt_id, result.test_type,
            result.success, result.execution_time, result.token_usage,
            result.output_quality_score, result.error_message, result.timestamp
        ))
        self.db_connection.commit()
    
    def generate_test_report(self, prompt_path: str, results: List[TestResult]) -> Dict:
        """Generate comprehensive test report"""
        total_tests = len(results)
        successful_tests = sum(1 for r in results if r.success)
        success_rate = successful_tests / total_tests if total_tests > 0 else 0
        
        avg_execution_time = statistics.mean([r.execution_time for r in results])
        avg_quality_score = statistics.mean([r.output_quality_score for r in results])
        
        # Group results by test type
        by_type = {}
        for result in results:
            if result.test_type not in by_type:
                by_type[result.test_type] = []
            by_type[result.test_type].append(result)
        
        type_summaries = {}
        for test_type, type_results in by_type.items():
            type_success_rate = sum(1 for r in type_results if r.success) / len(type_results)
            type_avg_quality = statistics.mean([r.output_quality_score for r in type_results])
            
            type_summaries[test_type] = {
                'total_tests': len(type_results),
                'success_rate': type_success_rate,
                'avg_quality_score': type_avg_quality
            }
        
        return {
            'prompt_path': prompt_path,
            'test_timestamp': datetime.now().isoformat(),
            'overall_summary': {
                'total_tests': total_tests,
                'successful_tests': successful_tests,
                'success_rate': success_rate,
                'avg_execution_time': avg_execution_time,
                'avg_quality_score': avg_quality_score
            },
            'by_test_type': type_summaries,
            'recommendations': self.generate_recommendations(success_rate, avg_quality_score),
            'detailed_results': [asdict(r) for r in results]
        }
    
    def generate_recommendations(self, success_rate: float, quality_score: float) -> List[str]:
        """Generate improvement recommendations"""
        recommendations = []
        
        if success_rate < 0.9:
            recommendations.append("Success rate below 90% - review and improve prompt clarity")
        
        if quality_score < 0.8:
            recommendations.append("Quality score below 80% - enhance prompt instructions and examples")
        
        if success_rate >= 0.95 and quality_score >= 0.9:
            recommendations.append("Excellent performance - prompt ready for production use")
        
        return recommendations

# Usage example
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 2:
        print("Usage: python effectiveness_test.py <prompt_path>")
        sys.exit(1)
    
    tester = PromptEffectivenessTest()
    report = tester.run_comprehensive_test_suite(sys.argv[1])
    
    print(json.dumps(report, indent=2))
```

### Test Configuration
```json
{
  "database_path": "test_results.db",
  "max_execution_time": 5.0,
  "max_token_usage": 2000,
  "min_consistency_score": 0.85,
  "performance_test_iterations": 10,
  "consistency_test_iterations": 5,
  "quality_thresholds": {
    "excellent": 0.9,
    "good": 0.8,
    "acceptable": 0.7,
    "poor": 0.5
  }
}
```
```

### Real-World Testing Scenarios
```markdown
## Scenario-Based Testing

### User Journey Testing
#### Complete Workflow Testing
**Scenario**: End-to-end user workflow execution
**Test Cases**:
- New user onboarding flow
- Core feature usage patterns
- Error recovery scenarios
- Edge case handling
- Integration point validation

```yaml
# Example user journey test case
test_case:
  id: "user_journey_001"
  name: "New User Onboarding"
  type: "functional"
  scenario: "First-time user completes full onboarding process"
  input:
    user_type: "new"
    platform: "web"
    device: "desktop"
    context: "first_visit"
  expected_output:
    required_fields:
      - "welcome_message"
      - "setup_steps"
      - "next_actions"
    format: "structured_json"
    quality_criteria:
      completeness: 0.9
      accuracy: 0.95
      clarity: 0.85
```

### Stress Testing
#### High-Load Scenario Testing
**Objective**: Validate prompt performance under stress conditions
**Method**: Execute prompts with large datasets, concurrent requests, resource constraints
**Metrics**: Response time degradation, error rates, resource utilization

#### Edge Case Testing
**Objective**: Test prompt behavior with unusual or extreme inputs
**Method**: Boundary value testing, invalid input handling, resource exhaustion
**Metrics**: Error handling quality, graceful degradation, recovery capability

### A/B Testing Framework
#### Comparative Effectiveness Testing
```python
class ABTestFramework:
    def __init__(self):
        self.test_groups = {}
        self.results = {}
    
    def setup_ab_test(self, test_name: str, prompt_a: str, prompt_b: str, test_cases: List[Dict]):
        """Setup A/B test between two prompt versions"""
        self.test_groups[test_name] = {
            'prompt_a': prompt_a,
            'prompt_b': prompt_b,
            'test_cases': test_cases,
            'results_a': [],
            'results_b': []
        }
    
    def run_ab_test(self, test_name: str) -> Dict:
        """Execute A/B test and compare results"""
        test_group = self.test_groups[test_name]
        
        # Run tests for both prompts
        for test_case in test_group['test_cases']:
            result_a = self.execute_prompt(test_group['prompt_a'], test_case)
            result_b = self.execute_prompt(test_group['prompt_b'], test_case)
            
            test_group['results_a'].append(result_a)
            test_group['results_b'].append(result_b)
        
        # Compare results
        comparison = self.compare_results(
            test_group['results_a'], 
            test_group['results_b']
        )
        
        return {
            'test_name': test_name,
            'winner': comparison['winner'],
            'confidence': comparison['confidence'],
            'metrics': comparison['metrics'],
            'recommendation': comparison['recommendation']
        }
    
    def compare_results(self, results_a: List[Dict], results_b: List[Dict]) -> Dict:
        """Statistical comparison of A/B test results"""
        # Calculate metrics for both groups
        metrics_a = self.calculate_group_metrics(results_a)
        metrics_b = self.calculate_group_metrics(results_b)
        
        # Determine statistical significance
        significance = self.calculate_statistical_significance(results_a, results_b)
        
        # Determine winner
        winner = 'A' if metrics_a['overall_score'] > metrics_b['overall_score'] else 'B'
        
        return {
            'winner': winner,
            'confidence': significance['confidence'],
            'metrics': {
                'group_a': metrics_a,
                'group_b': metrics_b
            },
            'recommendation': self.generate_ab_recommendation(winner, significance)
        }
```
```

## Performance Benchmarking

### Benchmark Framework
```markdown
## Performance Benchmarking System

### Benchmark Categories
#### Execution Speed Benchmarks
- **Cold Start Performance**: First execution time
- **Warm Start Performance**: Subsequent execution times
- **Batch Processing**: Multiple inputs processing time
- **Concurrent Execution**: Parallel processing capability
- **Resource Scaling**: Performance under different resource allocations

#### Quality Benchmarks
- **Output Accuracy**: Correctness of generated outputs
- **Consistency**: Variance in output quality across executions
- **Completeness**: Coverage of required output elements
- **Relevance**: Alignment with input requirements and context
- **Usability**: Ease of understanding and following outputs

#### Resource Utilization Benchmarks
- **Token Efficiency**: Tokens used per unit of output quality
- **Memory Usage**: Peak and average memory consumption
- **CPU Utilization**: Processing efficiency and optimization
- **Network Usage**: Data transfer requirements and optimization
- **Storage Requirements**: Temporary and persistent storage needs

### Benchmark Implementation
```python
class PromptBenchmark:
    def __init__(self, config: Dict):
        self.config = config
        self.results = {}
    
    def run_speed_benchmark(self, prompt_path: str, test_cases: List[Dict]) -> Dict:
        """Benchmark prompt execution speed"""
        times = {
            'cold_start': [],
            'warm_start': [],
            'batch_processing': [],
            'concurrent': []
        }
        
        # Cold start benchmark
        for test_case in test_cases[:5]:  # First 5 for cold start
            start_time = time.time()
            self.execute_prompt(prompt_path, test_case['input'])
            times['cold_start'].append(time.time() - start_time)
        
        # Warm start benchmark
        for test_case in test_cases[5:15]:  # Next 10 for warm start
            start_time = time.time()
            self.execute_prompt(prompt_path, test_case['input'])
            times['warm_start'].append(time.time() - start_time)
        
        # Batch processing benchmark
        batch_inputs = [tc['input'] for tc in test_cases[15:25]]
        start_time = time.time()
        self.execute_batch_prompt(prompt_path, batch_inputs)
        times['batch_processing'] = [time.time() - start_time]
        
        return {
            'cold_start_avg': statistics.mean(times['cold_start']),
            'warm_start_avg': statistics.mean(times['warm_start']),
            'batch_processing_time': times['batch_processing'][0],
            'performance_score': self.calculate_speed_score(times)
        }
    
    def run_quality_benchmark(self, prompt_path: str, test_cases: List[Dict]) -> Dict:
        """Benchmark prompt output quality"""
        quality_scores = {
            'accuracy': [],
            'consistency': [],
            'completeness': [],
            'relevance': []
        }
        
        results = []
        for test_case in test_cases:
            result = self.execute_prompt(prompt_path, test_case['input'])
            results.append(result)
            
            # Calculate individual quality metrics
            quality_scores['accuracy'].append(
                self.assess_accuracy(result, test_case['expected'])
            )
            quality_scores['completeness'].append(
                self.assess_completeness(result, test_case['requirements'])
            )
            quality_scores['relevance'].append(
                self.assess_relevance(result, test_case['context'])
            )
        
        # Calculate consistency across all results
        consistency_score = self.calculate_consistency_score(results)
        quality_scores['consistency'] = [consistency_score]
        
        return {
            'accuracy_avg': statistics.mean(quality_scores['accuracy']),
            'consistency_score': consistency_score,
            'completeness_avg': statistics.mean(quality_scores['completeness']),
            'relevance_avg': statistics.mean(quality_scores['relevance']),
            'overall_quality_score': self.calculate_overall_quality(quality_scores)
        }
    
    def generate_benchmark_report(self, prompt_path: str, test_cases: List[Dict]) -> Dict:
        """Generate comprehensive benchmark report"""
        speed_results = self.run_speed_benchmark(prompt_path, test_cases)
        quality_results = self.run_quality_benchmark(prompt_path, test_cases)
        resource_results = self.run_resource_benchmark(prompt_path, test_cases)
        
        overall_score = (
            speed_results['performance_score'] * 0.3 +
            quality_results['overall_quality_score'] * 0.5 +
            resource_results['efficiency_score'] * 0.2
        )
        
        return {
            'prompt_path': prompt_path,
            'benchmark_timestamp': datetime.now().isoformat(),
            'overall_score': overall_score,
            'speed_metrics': speed_results,
            'quality_metrics': quality_results,
            'resource_metrics': resource_results,
            'recommendations': self.generate_benchmark_recommendations(overall_score),
            'comparison_baseline': self.compare_to_baseline(overall_score)
        }
```
```

This comprehensive effectiveness testing framework ensures prompts consistently deliver high-quality results while maintaining optimal performance and usability across all scenarios.

## Usage Instructions

### Running Effectiveness Tests
```bash
# Run comprehensive test suite
python effectiveness_test.py prompts/templates/example.md

# Run specific test type
python effectiveness_test.py --type functional prompts/templates/example.md

# Run A/B test comparison
python ab_test.py --prompt-a v1.md --prompt-b v2.md --test-cases test_cases.json

# Generate benchmark report
python benchmark.py prompts/templates/example.md --output benchmark_report.json
```

### Integration with CI/CD
```yaml
# Effectiveness testing in CI/CD pipeline
- name: Run Effectiveness Tests
  run: |
    python effectiveness_test.py prompts/templates/*.md
    python generate_effectiveness_report.py --output effectiveness_report.json

- name: Upload Test Results
  uses: actions/upload-artifact@v3
  with:
    name: effectiveness-test-results
    path: effectiveness_report.json
```