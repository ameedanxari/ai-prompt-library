# Big Data Processing Template

<!-- INSTANTIATION RULES
When the drill-down engine (or any orchestrator) uses this template:
1. Every placeholder — including {{variables}}, <TBD>, [project name], and generic
   field/function/endpoint names — MUST be replaced with project-specific values
   before output is written to prompts/outputs/current/.
2. The template filename MUST NOT appear in task output. Dissolve the template
   into concrete content; do not reference its source.
3. No strings beginning with ".ai-prompts/prompts/" may appear in the output
   (validated by scripts/validate-instantiation.sh).
4. Outputs must contain real data shapes, real endpoints, real file paths, and
   real function signatures specific to the project.
-->


## Purpose

This template provides comprehensive patterns for implementing big data processing systems including distributed computing, parallel processing, job scheduling, and error handling. It covers frameworks like Apache Spark, Flink, and Hadoop for building scalable data processing pipelines that can handle petabyte-scale workloads.

## Context

Big data processing requires specialized architectures and frameworks to handle massive volumes of data efficiently. This template addresses the challenges of distributed computation, fault tolerance, resource management, and performance optimization when processing data at scale. It provides patterns for both batch and stream processing in distributed environments.

## Core Components

### Distributed Processing Service

## Examples

```typescript
interface DistributedProcessingService {
  // Job management
  submitJob(job: ProcessingJob): Promise<string>;
  getJobStatus(jobId: string): Promise<JobStatus>;
  cancelJob(jobId: string): Promise<void>;
  listJobs(filters?: JobFilters): Promise<ProcessingJob[]>;
  
  // Cluster management
  getClusterStatus(): Promise<ClusterStatus>;
  scaleCluster(config: ScaleConfig): Promise<void>;
  
  // Resource management
  allocateResources(requirements: ResourceRequirements): Promise<ResourceAllocation>;
  releaseResources(allocationId: string): Promise<void>;
}


interface ProcessingJob {
  id: string;
  name: string;
  type: JobType;
  config: JobConfig;
  schedule?: JobSchedule;
  resources: ResourceRequirements;
  dependencies?: string[];
  retryPolicy: RetryPolicy;
  timeout?: number;
  metadata?: Record<string, unknown>;
}

enum JobType {
  BATCH = 'batch',
  STREAMING = 'streaming',
  INTERACTIVE = 'interactive',
  ML_TRAINING = 'ml_training',
  ETL = 'etl'
}

interface JobConfig {
  framework: ProcessingFramework;
  entryPoint: string;
  arguments?: string[];
  sparkConfig?: SparkConfig;
  flinkConfig?: FlinkConfig;
  hadoopConfig?: HadoopConfig;
  environment?: Record<string, string>;
}

enum ProcessingFramework {
  SPARK = 'spark',
  FLINK = 'flink',
  HADOOP_MR = 'hadoop_mr',
  PRESTO = 'presto',
  DASK = 'dask',
  RAY = 'ray'
}

interface ResourceRequirements {
  executors: number;
  executorMemory: string;
  executorCores: number;
  driverMemory: string;
  driverCores: number;
  dynamicAllocation?: DynamicAllocationConfig;
}

interface ClusterStatus {
  state: 'running' | 'scaling' | 'degraded' | 'stopped';
  totalNodes: number;
  activeNodes: number;
  totalCores: number;
  availableCores: number;
  totalMemory: string;
  availableMemory: string;
  runningJobs: number;
  queuedJobs: number;
}
```

### Job Scheduler Service

```typescript
interface JobSchedulerService {
  // Scheduling operations
  scheduleJob(jobId: string, schedule: JobSchedule): Promise<string>;
  updateSchedule(scheduleId: string, schedule: JobSchedule): Promise<void>;
  deleteSchedule(scheduleId: string): Promise<void>;
  
  // Workflow management
  createWorkflow(workflow: Workflow): Promise<string>;
  triggerWorkflow(workflowId: string, params?: Record<string, unknown>): Promise<string>;
  getWorkflowStatus(runId: string): Promise<WorkflowStatus>;
  
  // Dependencies
  addDependency(jobId: string, dependsOn: string[]): Promise<void>;
  getDependencyGraph(workflowId: string): Promise<DependencyGraph>;
}

interface JobSchedule {
  type: ScheduleType;
  cronExpression?: string;
  interval?: number;
  intervalUnit?: TimeUnit;
  startTime?: Date;
  endTime?: Date;
  timezone?: string;
  catchUp?: boolean;
  maxConcurrentRuns?: number;
}

enum ScheduleType {
  CRON = 'cron',
  INTERVAL = 'interval',
  ONCE = 'once',
  EVENT_TRIGGERED = 'event_triggered'
}

interface Workflow {
  id: string;
  name: string;
  description?: string;
  tasks: WorkflowTask[];
  schedule?: JobSchedule;
  defaultArgs?: Record<string, unknown>;
  retryPolicy?: RetryPolicy;
  alertConfig?: AlertConfig;
}

interface WorkflowTask {
  id: string;
  name: string;
  type: TaskType;
  config: TaskConfig;
  dependencies?: string[];
  retries?: number;
  timeout?: number;
  onFailure?: FailureAction;
}

enum TaskType {
  SPARK_JOB = 'spark_job',
  PYTHON_SCRIPT = 'python_script',
  SQL_QUERY = 'sql_query',
  SHELL_COMMAND = 'shell_command',
  HTTP_REQUEST = 'http_request',
  SENSOR = 'sensor'
}

interface WorkflowStatus {
  runId: string;
  workflowId: string;
  state: WorkflowState;
  startTime: Date;
  endTime?: Date;
  taskStatuses: TaskStatus[];
  metrics: WorkflowMetrics;
}

enum WorkflowState {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  RETRY = 'retry'
}
```


### Parallel Processing Engine

```typescript
interface ParallelProcessingEngine {
  // Partitioning
  partitionData(data: DataSet, strategy: PartitionStrategy): Promise<Partition[]>;
  repartition(data: DataSet, numPartitions: number): Promise<DataSet>;
  coalesce(data: DataSet, numPartitions: number): Promise<DataSet>;
  
  // Parallel operations
  mapPartitions<T, R>(data: DataSet<T>, fn: (partition: T[]) => R[]): Promise<DataSet<R>>;
  reduceByKey<K, V>(data: DataSet<[K, V]>, fn: (a: V, b: V) => V): Promise<DataSet<[K, V]>>;
  aggregateByKey<K, V, U>(data: DataSet<[K, V]>, zeroValue: U, seqOp: (u: U, v: V) => U, combOp: (u1: U, u2: U) => U): Promise<DataSet<[K, U]>>;
  
  // Shuffle operations
  groupByKey<K, V>(data: DataSet<[K, V]>): Promise<DataSet<[K, V[]]>>;
  sortByKey<K, V>(data: DataSet<[K, V]>, ascending?: boolean): Promise<DataSet<[K, V]>>;
  join<K, V, W>(left: DataSet<[K, V]>, right: DataSet<[K, W]>): Promise<DataSet<[K, [V, W]]>>;
}

interface PartitionStrategy {
  type: PartitionType;
  numPartitions?: number;
  partitionColumn?: string;
  rangePartitions?: RangePartition[];
  hashColumns?: string[];
}

enum PartitionType {
  HASH = 'hash',
  RANGE = 'range',
  ROUND_ROBIN = 'round_robin',
  CUSTOM = 'custom'
}

interface Partition {
  id: number;
  size: number;
  location: string;
  preferredLocations?: string[];
}

interface RangePartition {
  start: unknown;
  end: unknown;
  partitionId: number;
}
```

### Error Handling Service

```typescript
interface ErrorHandlingService {
  // Error recovery
  handleJobFailure(jobId: string, error: JobError): Promise<RecoveryAction>;
  retryJob(jobId: string, config?: RetryConfig): Promise<string>;
  
  // Checkpointing
  createCheckpoint(jobId: string): Promise<string>;
  restoreFromCheckpoint(checkpointId: string): Promise<void>;
  listCheckpoints(jobId: string): Promise<Checkpoint[]>;
  
  // Dead letter handling
  sendToDeadLetter(record: FailedRecord): Promise<void>;
  reprocessDeadLetter(deadLetterId: string): Promise<void>;
  getDeadLetterStats(): Promise<DeadLetterStats>;
}

interface JobError {
  type: ErrorType;
  message: string;
  stackTrace?: string;
  taskId?: string;
  partition?: number;
  timestamp: Date;
  context?: Record<string, unknown>;
}

enum ErrorType {
  OOM = 'out_of_memory',
  TIMEOUT = 'timeout',
  DATA_ERROR = 'data_error',
  NETWORK = 'network',
  RESOURCE = 'resource',
  PERMISSION = 'permission',
  UNKNOWN = 'unknown'
}

interface RetryPolicy {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors?: ErrorType[];
}

interface Checkpoint {
  id: string;
  jobId: string;
  timestamp: Date;
  state: CheckpointState;
  size: number;
  location: string;
  metadata?: Record<string, unknown>;
}

enum CheckpointState {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired'
}

interface FailedRecord {
  id: string;
  sourceJob: string;
  data: unknown;
  error: string;
  failedAt: Date;
  retryCount: number;
  lastRetryAt?: Date;
}
```


## Implementation Patterns

### Spark Job Manager

```typescript
class SparkJobManager {
  private sparkSession: SparkSession;
  private jobStore: JobStore;

  async submitSparkJob(config: SparkJobConfig): Promise<string> {
    const jobId = this.generateJobId();

    // Configure Spark session
    const spark = this.configureSparkSession(config);

    // Submit job
    const job: ProcessingJob = {
      id: jobId,
      name: config.name,
      type: JobType.BATCH,
      config: {
        framework: ProcessingFramework.SPARK,
        entryPoint: config.mainClass,
        arguments: config.args,
        sparkConfig: config.sparkConfig
      },
      resources: config.resources,
      retryPolicy: config.retryPolicy || this.defaultRetryPolicy
    };

    await this.jobStore.save(job);

    // Execute job asynchronously
    this.executeSparkJob(spark, job).catch(error => {
      this.handleJobError(jobId, error);
    });

    return jobId;
  }

  private configureSparkSession(config: SparkJobConfig): SparkSession {
    const builder = SparkSession.builder()
      .appName(config.name)
      .config('spark.executor.memory', config.resources.executorMemory)
      .config('spark.executor.cores', config.resources.executorCores)
      .config('spark.executor.instances', config.resources.executors)
      .config('spark.driver.memory', config.resources.driverMemory);

    // Apply custom Spark configurations
    if (config.sparkConfig) {
      for (const [key, value] of Object.entries(config.sparkConfig)) {
        builder.config(key, value);
      }
    }

    // Enable dynamic allocation if configured
    if (config.resources.dynamicAllocation) {
      builder
        .config('spark.dynamicAllocation.enabled', 'true')
        .config('spark.dynamicAllocation.minExecutors', config.resources.dynamicAllocation.minExecutors)
        .config('spark.dynamicAllocation.maxExecutors', config.resources.dynamicAllocation.maxExecutors);
    }

    return builder.getOrCreate();
  }

  private async executeSparkJob(spark: SparkSession, job: ProcessingJob): Promise<void> {
    const startTime = Date.now();
    
    try {
      await this.updateJobStatus(job.id, 'running');

      // Execute the main job logic
      const result = await this.runJobLogic(spark, job);

      await this.updateJobStatus(job.id, 'completed', {
        duration: Date.now() - startTime,
        recordsProcessed: result.recordsProcessed,
        bytesProcessed: result.bytesProcessed
      });
    } catch (error) {
      await this.handleJobError(job.id, error);
      throw error;
    } finally {
      spark.stop();
    }
  }

  private async handleJobError(jobId: string, error: Error): Promise<void> {
    const job = await this.jobStore.get(jobId);
    const jobError = this.classifyError(error);

    if (this.shouldRetry(job, jobError)) {
      await this.scheduleRetry(job);
    } else {
      await this.updateJobStatus(jobId, 'failed', { error: jobError });
      await this.sendAlert(job, jobError);
    }
  }
}
```

### Workflow Orchestrator (Airflow-style)

```typescript
class WorkflowOrchestrator {
  private scheduler: JobSchedulerService;
  private executor: TaskExecutor;

  async executeWorkflow(workflow: Workflow, params?: Record<string, unknown>): Promise<string> {
    const runId = this.generateRunId();
    const context = this.createExecutionContext(workflow, params);

    // Build execution plan
    const executionPlan = this.buildExecutionPlan(workflow);

    // Execute tasks in topological order
    for (const taskBatch of executionPlan) {
      await Promise.all(
        taskBatch.map(task => this.executeTask(task, context, runId))
      );
    }

    return runId;
  }

  private buildExecutionPlan(workflow: Workflow): WorkflowTask[][] {
    // Topological sort of tasks based on dependencies
    const graph = this.buildDependencyGraph(workflow.tasks);
    const sorted: WorkflowTask[][] = [];
    const visited = new Set<string>();
    const inProgress = new Set<string>();

    const visit = (taskId: string, batch: WorkflowTask[]) => {
      if (visited.has(taskId)) return;
      if (inProgress.has(taskId)) {
        throw new Error(`Circular dependency detected at task ${taskId}`);
      }

      inProgress.add(taskId);
      const task = workflow.tasks.find(t => t.id === taskId)!;

      // Visit dependencies first
      for (const depId of task.dependencies || []) {
        visit(depId, batch);
      }

      inProgress.delete(taskId);
      visited.add(taskId);
      batch.push(task);
    };

    // Group tasks that can run in parallel
    let currentBatch: WorkflowTask[] = [];
    for (const task of workflow.tasks) {
      if (!visited.has(task.id)) {
        visit(task.id, currentBatch);
      }
    }

    // Organize into parallel batches
    return this.organizeIntoBatches(workflow.tasks);
  }

  private async executeTask(
    task: WorkflowTask,
    context: ExecutionContext,
    runId: string
  ): Promise<TaskResult> {
    const startTime = Date.now();

    try {
      await this.updateTaskStatus(runId, task.id, 'running');

      const result = await this.executor.execute(task, context);

      await this.updateTaskStatus(runId, task.id, 'success', {
        duration: Date.now() - startTime,
        output: result.output
      });

      return result;
    } catch (error) {
      if (task.retries && task.retries > 0) {
        return this.retryTask(task, context, runId, task.retries);
      }

      await this.handleTaskFailure(task, error, runId);
      throw error;
    }
  }
}
```


## Integration Points

### Apache Spark Integration

```typescript
// Native Spark integration for distributed processing
class SparkIntegration {
  async createSparkContext(config: SparkContextConfig): Promise<SparkContext> {
    const conf = new SparkConf()
      .setAppName(config.appName)
      .setMaster(config.master)
      .set('spark.sql.adaptive.enabled', 'true')
      .set('spark.sql.adaptive.coalescePartitions.enabled', 'true');

    return new SparkContext(conf);
  }

  async readData(spark: SparkSession, source: DataSource): Promise<DataFrame> {
    switch (source.format) {
      case 'parquet':
        return spark.read.parquet(source.path);
      case 'delta':
        return spark.read.format('delta').load(source.path);
      case 'jdbc':
        return spark.read.jdbc(source.url, source.table, source.properties);
      case 'kafka':
        return spark.readStream
          .format('kafka')
          .option('kafka.bootstrap.servers', source.bootstrapServers)
          .option('subscribe', source.topics)
          .load();
      default:
        throw new Error(`Unsupported format: ${source.format}`);
    }
  }

  async writeData(df: DataFrame, destination: DataDestination): Promise<void> {
    const writer = df.write.mode(destination.mode);

    if (destination.partitionBy) {
      writer.partitionBy(...destination.partitionBy);
    }

    switch (destination.format) {
      case 'parquet':
        await writer.parquet(destination.path);
        break;
      case 'delta':
        await writer.format('delta').save(destination.path);
        break;
      case 'jdbc':
        await writer.jdbc(destination.url, destination.table, destination.properties);
        break;
    }
  }
}
```

### Apache Airflow Integration

```typescript
// Airflow integration for workflow orchestration
class AirflowIntegration {
  private airflowClient: AirflowClient;

  async createDAG(workflow: Workflow): Promise<string> {
    const dag = this.convertToAirflowDAG(workflow);
    await this.airflowClient.createDAG(dag);
    return dag.dag_id;
  }

  async triggerDAG(dagId: string, conf?: Record<string, unknown>): Promise<string> {
    const response = await this.airflowClient.triggerDAGRun(dagId, { conf });
    return response.dag_run_id;
  }

  async getDAGRunStatus(dagId: string, runId: string): Promise<DAGRunStatus> {
    return this.airflowClient.getDAGRun(dagId, runId);
  }

  private convertToAirflowDAG(workflow: Workflow): AirflowDAG {
    return {
      dag_id: workflow.id,
      description: workflow.description,
      schedule_interval: workflow.schedule?.cronExpression,
      default_args: {
        owner: 'airflow',
        retries: workflow.retryPolicy?.maxRetries || 3,
        retry_delay: workflow.retryPolicy?.initialDelay || 300
      },
      tasks: workflow.tasks.map(task => this.convertToAirflowTask(task))
    };
  }
}
```

### Kubernetes Integration

```typescript
// Kubernetes integration for container orchestration
class KubernetesJobRunner {
  private k8sClient: KubernetesClient;

  async submitSparkOnK8s(job: SparkK8sJob): Promise<string> {
    const sparkApplication = {
      apiVersion: 'sparkoperator.k8s.io/v1beta2',
      kind: 'SparkApplication',
      metadata: {
        name: job.name,
        namespace: job.namespace
      },
      spec: {
        type: job.type,
        mode: 'cluster',
        image: job.image,
        mainClass: job.mainClass,
        mainApplicationFile: job.jarPath,
        sparkVersion: job.sparkVersion,
        driver: {
          cores: job.driverCores,
          memory: job.driverMemory,
          serviceAccount: job.serviceAccount
        },
        executor: {
          cores: job.executorCores,
          instances: job.executorInstances,
          memory: job.executorMemory
        }
      }
    };

    const result = await this.k8sClient.createCustomResource(sparkApplication);
    return result.metadata.name;
  }
}
```

## Security Considerations

### Authentication and Authorization
- Implement Kerberos authentication for Hadoop clusters
- Use service accounts with minimal required permissions
- Implement fine-grained access control for data and jobs
- Audit all job submissions and data access

### Data Protection
- Encrypt data at rest and in transit
- Implement data masking for sensitive fields in processing
- Use secure credential storage for connection strings
- Apply data classification during processing

### Network Security
- Use private networks for cluster communication
- Implement network policies for pod-to-pod communication
- Enable TLS for all service endpoints
- Use VPN or private endpoints for cloud resources

## Testing Considerations

### Unit Testing

```typescript
describe('SparkJobManager', () => {
  it('should submit and track Spark job', async () => {
    const manager = new SparkJobManager(mockConfig);
    const jobId = await manager.submitSparkJob({
      name: 'test-job',
      mainClass: 'com.example.TestJob',
      resources: { executors: 2, executorMemory: '2g', executorCores: 2 }
    });
    
    const status = await manager.getJobStatus(jobId);
    expect(status.state).toBe('running');
  });

  it('should handle job failures with retry', async () => {
    const manager = new SparkJobManager(mockConfig);
    const jobId = await manager.submitSparkJob(failingJobConfig);
    
    await waitForJobCompletion(jobId);
    const status = await manager.getJobStatus(jobId);
    
    expect(status.retryCount).toBeGreaterThan(0);
  });
});
```

### Property-Based Testing

```typescript
describe('Distributed Processing Properties', () => {
  it('should preserve data integrity through partitioning', () => {
    fc.assert(fc.property(
      fc.array(fc.record({ id: fc.integer(), value: fc.string() })),
      async (data) => {
        const partitioned = await engine.partitionData(data, { type: 'hash', numPartitions: 4 });
        const reassembled = await engine.coalesce(partitioned, 1);
        
        expect(reassembled.length).toBe(data.length);
        expect(new Set(reassembled.map(r => r.id))).toEqual(new Set(data.map(r => r.id)));
      }
    ));
  });
});
```
