### Stress Test Service

```typescript
class StressTestService {
  async runStressTest(config: StressTestConfig): Promise<StressTestResults> {
    const results: StageResult[] = [];
    let currentUsers = config.initialUsers;
    let systemBroken = false;
    let breakingPoint: number | null = null;

    while (currentUsers <= config.maxUsers && !systemBroken) {
      const stageResult = await this.executeStage(currentUsers, config);
      results.push(stageResult);

      // Check if system has reached breaking point
      if (this.isSystemBroken(stageResult, config.breakingPointCriteria)) {
        systemBroken = true;
        breakingPoint = currentUsers;
      } else {
        currentUsers += config.userIncrement;
      }

      // Recovery period between stages
      await this.sleep(config.recoveryPeriod * 1000);
    }

    return {
      stages: results,
      breakingPoint,
      maxSustainableLoad: breakingPoint 
        ? breakingPoint - config.userIncrement 
        : currentUsers - config.userIncrement,
      recommendations: this.generateRecommendations(results)
    };
  }

  private isSystemBroken(
    result: StageResult,
    criteria: BreakingPointCriteria
  ): boolean {
    return (
      result.errorRate > criteria.maxErrorRate ||
      result.responseTime.p95 > criteria.maxResponseTime ||
      result.throughput < criteria.minThroughput
    );
  }

  private generateRecommendations(results: StageResult[]): string[] {
    const recommendations: string[] = [];
    
    // Analyze response time degradation
    const responseTimeTrend = this.analyzeResponseTimeTrend(results);
    if (responseTimeTrend.degradationRate > 0.1) {
      recommendations.push(
        `Response time degrades ${(responseTimeTrend.degradationRate * 100).toFixed(1)}% per 100 users. ` +
        'Consider optimizing database queries or adding caching.'
      );
    }

    // Analyze error patterns
    const errorPatterns = this.analyzeErrorPatterns(results);
    if (errorPatterns.connectionErrors > 0.5) {
      recommendations.push(
        'High connection error rate detected. Consider increasing connection pool size.'
      );
    }

    return recommendations;
  }
}
```

### Scalability Test Service

```typescript
class ScalabilityTestService {
  async runScalabilityTest(config: ScalabilityTestConfig): Promise<ScalabilityResults> {
    const horizontalResults = await this.testHorizontalScaling(config);
    const verticalResults = await this.testVerticalScaling(config);
    
    return {
      horizontal: horizontalResults,
      vertical: verticalResults,
      scalabilityIndex: this.calculateScalabilityIndex(horizontalResults, verticalResults),
      costEfficiency: this.calculateCostEfficiency(horizontalResults, verticalResults),
      recommendations: this.generateScalabilityRecommendations(horizontalResults, verticalResults)
    };
  }

  private async testHorizontalScaling(
    config: ScalabilityTestConfig
  ): Promise<HorizontalScalingResults> {
    const results: InstanceScaleResult[] = [];
    
    for (let instances = 1; instances <= config.maxInstances; instances++) {
      // Scale infrastructure
      await this.scaleInstances(instances);
      await this.waitForHealthy(instances);
      
      // Run load test at each scale level
      const loadResult = await this.runLoadAtScale(config.baseLoad * instances);
      
      results.push({
        instances,
        throughput: loadResult.metrics.throughput,
        responseTime: loadResult.metrics.responseTime,
        efficiency: loadResult.metrics.throughput / (config.baseLoad * instances)
      });
    }

    return {
      results,
      linearScalingFactor: this.calculateLinearScalingFactor(results),
      optimalInstanceCount: this.findOptimalInstanceCount(results)
    };
  }

  private calculateScalabilityIndex(
    horizontal: HorizontalScalingResults,
    vertical: VerticalScalingResults
  ): number {
    // Scalability index: 1.0 = perfect linear scaling
    const horizontalEfficiency = horizontal.linearScalingFactor;
    const verticalEfficiency = vertical.linearScalingFactor;
    
    return (horizontalEfficiency + verticalEfficiency) / 2;
  }
}
```


