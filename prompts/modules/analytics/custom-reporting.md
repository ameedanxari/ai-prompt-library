# Custom Reporting Template

## Purpose

This template provides comprehensive patterns for implementing custom reporting and data visualization systems that enable users to create, customize, and share interactive reports and dashboards. It covers report builders, data visualization engines, export capabilities, and collaborative reporting workflows for business intelligence and analytics applications.

## Context

Custom reporting empowers users to create tailored reports and visualizations that meet their specific analytical needs without requiring technical expertise. Modern applications require flexible reporting systems that support drag-and-drop interfaces, real-time data connections, and collaborative features. This template addresses the complexity of building user-friendly report builders while maintaining performance, security, and scalability across diverse data sources and visualization requirements.

## Instructions

1. **Setup Report Builder**: Configure drag-and-drop report creation interface
2. **Implement Data Connectors**: Build connections to various data sources
3. **Add Visualization Engine**: Create interactive charts and visualization components
4. **Configure Export System**: Enable report export in multiple formats
5. **Enable Collaboration**: Add sharing, commenting, and collaborative editing
6. **Add Scheduling**: Implement automated report generation and distribution
7. **Test Report Accuracy**: Validate data accuracy and visualization correctness

## Examples

### Example 1: Report Builder Service
```typescript
interface ReportBuilderService {
  createReport(config: ReportConfig): Promise<Report>;
  updateReport(reportId: string, updates: ReportUpdate): Promise<Report>;
  addVisualization(reportId: string, visualization: VisualizationConfig): Promise<Visualization>;
  connectDataSource(reportId: string, dataSource: DataSourceConfig): Promise<DataConnection>;
  generateReport(reportId: string, parameters?: ReportParameters): Promise<GeneratedReport>;
}

const reportBuilder = new ReportBuilderService();
const salesReport = await reportBuilder.createReport({
  name: 'Monthly Sales Dashboard',
  description: 'Comprehensive sales performance analysis',
  layout: 'dashboard',
  dataSources: ['sales_db', 'crm_api'],
  visualizations: [
    { type: 'bar_chart', title: 'Sales by Region', dataQuery: 'SELECT region, SUM(amount) FROM sales GROUP BY region' },
    { type: 'line_chart', title: 'Sales Trend', dataQuery: 'SELECT date, SUM(amount) FROM sales GROUP BY date ORDER BY date' }
  ]
});
```

### Example 2: Visualization Engine
```typescript
interface VisualizationEngine {
  createChart(type: ChartType, data: ChartData, config: ChartConfig): Promise<Chart>;
  updateChart(chartId: string, data: ChartData): Promise<Chart>;
  exportChart(chartId: string, format: ExportFormat): Promise<ExportResult>;
  addInteractivity(chartId: string, interactions: InteractionConfig[]): Promise<Chart>;
}

const vizEngine = new VisualizationEngine();
const chart = await vizEngine.createChart('bar_chart', salesData, {
  title: 'Quarterly Revenue',
  xAxis: { field: 'quarter', label: 'Quarter' },
  yAxis: { field: 'revenue', label: 'Revenue ($)' },
  colors: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12'],
  responsive: true,
  animations: true
});
```

### Example 3: Report Scheduler
```typescript
interface ReportScheduler {
  scheduleReport(reportId: string, schedule: ScheduleConfig): Promise<ScheduledReport>;
  executeScheduledReport(scheduleId: string): Promise<ReportExecution>;
  distributeReport(reportId: string, distribution: DistributionConfig): Promise<DistributionResult>;
  getScheduleHistory(scheduleId: string): Promise<ExecutionHistory[]>;
}

const scheduler = new ReportScheduler();
const scheduledReport = await scheduler.scheduleReport('monthly-sales', {
  frequency: 'monthly',
  dayOfMonth: 1,
  time: '09:00',
  timezone: 'UTC',
  recipients: ['manager@company.com', 'team@company.com'],
  format: 'pdf',
  parameters: { region: 'all', includeDetails: true }
});
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| enableDragDropBuilder | Enable drag-and-drop report builder | boolean | No | true |
| enableRealTimeData | Enable real-time data connections | boolean | No | true |
| enableCollaboration | Enable collaborative report editing | boolean | No | true |
| enableScheduling | Enable automated report scheduling | boolean | No | true |
| maxReportSize | Maximum report size in MB | number | No | 100 |
| cacheReportMinutes | Minutes to cache generated reports | number | No | 60 |
| enableCustomVisualizations | Enable custom visualization plugins | boolean | No | false |
| enableDataGovernance | Enable data governance and access controls | boolean | No | true |

## Expected Output

This template will produce:
- **Report Builder Interface**: Drag-and-drop report creation and editing
- **Data Connection System**: Flexible connections to multiple data sources
- **Visualization Library**: Comprehensive chart and visualization components
- **Export Engine**: Multi-format report export capabilities
- **Collaboration Tools**: Sharing, commenting, and collaborative editing features
- **Scheduling System**: Automated report generation and distribution
- **Template Library**: Pre-built report templates and components
- **Performance Optimization**: Efficient data processing and rendering

## Implementation Patterns

### Custom Reporting Architecture

```typescript
// Core Custom Reporting Architecture
interface CustomReportingSystem {
  reportBuilder: ReportBuilder;
  dataConnector: DataConnector;
  visualizationEngine: VisualizationEngine;
  exportEngine: ExportEngine;
  collaborationManager: CollaborationManager;
  scheduler: ReportScheduler;
  templateManager: TemplateManager;
}

interface Report {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  
  // Report structure
  layout: ReportLayout;
  sections: ReportSection[];
  visualizations: Visualization[];
  
  // Data configuration
  dataSources: DataSource[];
  dataQueries: DataQuery[];
  parameters: ReportParameter[];
  
  // Styling and formatting
  theme: ReportTheme;
  styling: ReportStyling;
  
  // Access control
  visibility: 'private' | 'shared' | 'public';
  permissions: ReportPermission[];
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
  version: number;
  tags: string[];
}

interface Visualization {
  id: string;
  type: VisualizationType;
  title: string;
  
  // Data binding
  dataQuery: DataQuery;
  dataMapping: DataMapping;
  
  // Visual configuration
  chartConfig: ChartConfig;
  styling: VisualizationStyling;
  
  // Interactivity
  interactions: Interaction[];
  filters: Filter[];
  
  // Layout
  position: Position;
  size: Size;
  
  // Metadata
  createdAt: Date;
  lastUpdated: Date;
}

interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  
  // Connection configuration
  connectionConfig: ConnectionConfig;
  credentials: DataSourceCredentials;
  
  // Schema information
  schema: DataSchema;
  tables: TableInfo[];
  
  // Performance settings
  cachingEnabled: boolean;
  refreshInterval: number;
  
  // Security
  accessControls: DataAccessControl[];
  
  // Metadata
  createdAt: Date;
  lastConnected: Date;
  status: ConnectionStatus;
}
```

**Report Builder Implementation**
```typescript
class ReportBuilder {
  private dataConnector: DataConnector;
  private visualizationEngine: VisualizationEngine;
  private templateManager: TemplateManager;
  private reportStore: ReportStore;

  async createReport(config: ReportConfig): Promise<Report> {
    // Validate report configuration
    await this.validateReportConfig(config);

    // Create report structure
    const report: Report = {
      id: this.generateReportId(),
      name: config.name,
      description: config.description || '',
      type: config.type || 'dashboard',
      layout: config.layout || this.getDefaultLayout(config.type),
      sections: [],
      visualizations: [],
      dataSources: [],
      dataQueries: [],
      parameters: config.parameters || [],
      theme: config.theme || 'default',
      styling: config.styling || {},
      visibility: config.visibility || 'private',
      permissions: config.permissions || [],
      createdBy: config.createdBy,
      createdAt: new Date(),
      lastModified: new Date(),
      version: 1,
      tags: config.tags || []
    };

    // Add data sources
    if (config.dataSources) {
      for (const dataSourceConfig of config.dataSources) {
        const dataSource = await this.dataConnector.connectDataSource(dataSourceConfig);
        report.dataSources.push(dataSource);
      }
    }

    // Add visualizations
    if (config.visualizations) {
      for (const vizConfig of config.visualizations) {
        const visualization = await this.createVisualization(vizConfig, report.dataSources);
        report.visualizations.push(visualization);
      }
    }

    // Save report
    await this.reportStore.save(report);

    return report;
  }

  async updateReport(reportId: string, updates: ReportUpdate): Promise<Report> {
    const report = await this.reportStore.findById(reportId);
    if (!report) throw new Error('Report not found');

    // Update report properties
    if (updates.name) report.name = updates.name;
    if (updates.description) report.description = updates.description;
    if (updates.layout) report.layout = updates.layout;
    if (updates.theme) report.theme = updates.theme;
    if (updates.styling) report.styling = { ...report.styling, ...updates.styling };

    // Update visualizations
    if (updates.visualizations) {
      for (const vizUpdate of updates.visualizations) {
        if (vizUpdate.action === 'add') {
          const newViz = await this.createVisualization(vizUpdate.config, report.dataSources);
          report.visualizations.push(newViz);
        } else if (vizUpdate.action === 'update') {
          const vizIndex = report.visualizations.findIndex(v => v.id === vizUpdate.id);
          if (vizIndex >= 0) {
            report.visualizations[vizIndex] = await this.updateVisualization(
              report.visualizations[vizIndex],
              vizUpdate.config
            );
          }
        } else if (vizUpdate.action === 'remove') {
          report.visualizations = report.visualizations.filter(v => v.id !== vizUpdate.id);
        }
      }
    }

    // Update version and timestamp
    report.version++;
    report.lastModified = new Date();

    await this.reportStore.update(report);
    return report;
  }

  private async createVisualization(
    config: VisualizationConfig,
    dataSources: DataSource[]
  ): Promise<Visualization> {
    // Validate visualization configuration
    await this.validateVisualizationConfig(config);

    // Find appropriate data source
    const dataSource = dataSources.find(ds => ds.id === config.dataSourceId);
    if (!dataSource) {
      throw new Error(`Data source not found: ${config.dataSourceId}`);
    }

    // Create data query
    const dataQuery = await this.buildDataQuery(config.query, dataSource);

    // Validate data query
    await this.dataConnector.validateQuery(dataQuery, dataSource);

    const visualization: Visualization = {
      id: this.generateVisualizationId(),
      type: config.type,
      title: config.title,
      dataQuery,
      dataMapping: config.dataMapping,
      chartConfig: config.chartConfig || this.getDefaultChartConfig(config.type),
      styling: config.styling || {},
      interactions: config.interactions || [],
      filters: config.filters || [],
      position: config.position || { x: 0, y: 0 },
      size: config.size || { width: 6, height: 4 },
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    return visualization;
  }

  async generateReport(reportId: string, parameters?: ReportParameters): Promise<GeneratedReport> {
    const report = await this.reportStore.findById(reportId);
    if (!report) throw new Error('Report not found');

    const startTime = Date.now();
    const generatedSections: GeneratedSection[] = [];

    try {
      // Apply parameters to queries
      const parameterizedQueries = this.applyParameters(report.dataQueries, parameters);

      // Execute data queries
      const dataResults = await Promise.all(
        parameterizedQueries.map(query => 
          this.dataConnector.executeQuery(query, report.dataSources)
        )
      );

      // Generate visualizations
      const generatedVisualizations = await Promise.all(
        report.visualizations.map(async (viz, index) => {
          const data = dataResults[index];
          return await this.visualizationEngine.renderVisualization(viz, data);
        })
      );

      // Build report sections
      for (const section of report.sections) {
        const sectionVisualizations = generatedVisualizations.filter(
          viz => section.visualizationIds.includes(viz.id)
        );

        generatedSections.push({
          id: section.id,
          title: section.title,
          content: section.content,
          visualizations: sectionVisualizations,
          generatedAt: new Date()
        });
      }

      const generatedReport: GeneratedReport = {
        id: this.generateGeneratedReportId(),
        reportId: report.id,
        reportName: report.name,
        sections: generatedSections,
        visualizations: generatedVisualizations,
        parameters: parameters || {},
        generatedAt: new Date(),
        generationTime: Date.now() - startTime,
        dataFreshness: this.calculateDataFreshness(dataResults),
        format: 'interactive'
      };

      return generatedReport;

    } catch (error) {
      throw new Error(`Report generation failed: ${error.message}`);
    }
  }

  private applyParameters(queries: DataQuery[], parameters?: ReportParameters): DataQuery[] {
    if (!parameters) return queries;

    return queries.map(query => {
      let parameterizedQuery = query.sql;
      
      for (const [key, value] of Object.entries(parameters)) {
        const placeholder = `{{${key}}}`;
        parameterizedQuery = parameterizedQuery.replace(
          new RegExp(placeholder, 'g'),
          this.sanitizeParameter(value)
        );
      }

      return {
        ...query,
        sql: parameterizedQuery,
        parameters: parameters
      };
    });
  }

  private sanitizeParameter(value: any): string {
    // Implement SQL injection prevention
    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "''")}'`;
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    if (value instanceof Date) {
      return `'${value.toISOString()}'`;
    }
    return `'${String(value)}'`;
  }
}
```

### Visualization Engine Implementation

```typescript
class VisualizationEngine {
  private chartLibrary: ChartLibrary;
  private renderingEngine: RenderingEngine;
  private interactionManager: InteractionManager;

  async renderVisualization(visualization: Visualization, data: QueryResult): Promise<RenderedVisualization> {
    // Validate data compatibility
    this.validateDataCompatibility(visualization, data);

    // Transform data for visualization
    const transformedData = await this.transformData(data, visualization.dataMapping);

    // Create chart configuration
    const chartConfig = this.buildChartConfig(visualization, transformedData);

    // Render visualization
    const renderedChart = await this.chartLibrary.createChart(
      visualization.type,
      transformedData,
      chartConfig
    );

    // Add interactivity
    if (visualization.interactions.length > 0) {
      await this.interactionManager.addInteractions(renderedChart, visualization.interactions);
    }

    // Apply styling
    const styledChart = await this.applyVisualizationStyling(renderedChart, visualization.styling);

    return {
      id: visualization.id,
      type: visualization.type,
      title: visualization.title,
      chart: styledChart,
      data: transformedData,
      config: chartConfig,
      renderedAt: new Date(),
      renderTime: Date.now() - Date.now() // This would be calculated properly
    };
  }

  private async transformData(data: QueryResult, mapping: DataMapping): Promise<ChartData> {
    const transformedData: ChartData = {
      labels: [],
      datasets: []
    };

    // Extract labels
    if (mapping.labelField) {
      transformedData.labels = data.rows.map(row => row[mapping.labelField]);
    }

    // Extract datasets
    for (const datasetMapping of mapping.datasets) {
      const dataset = {
        label: datasetMapping.label,
        data: data.rows.map(row => row[datasetMapping.field]),
        backgroundColor: datasetMapping.backgroundColor,
        borderColor: datasetMapping.borderColor,
        borderWidth: datasetMapping.borderWidth || 1
      };

      transformedData.datasets.push(dataset);
    }

    // Apply data transformations
    if (mapping.transformations) {
      for (const transformation of mapping.transformations) {
        await this.applyDataTransformation(transformedData, transformation);
      }
    }

    return transformedData;
  }

  private buildChartConfig(visualization: Visualization, data: ChartData): ChartConfig {
    const baseConfig = {
      type: visualization.type,
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: !!visualization.title,
            text: visualization.title
          },
          legend: {
            display: visualization.chartConfig.showLegend !== false,
            position: visualization.chartConfig.legendPosition || 'top'
          }
        },
        scales: this.buildScalesConfig(visualization.chartConfig),
        animation: {
          duration: visualization.chartConfig.animationDuration || 1000
        }
      }
    };

    // Merge with custom chart configuration
    return this.mergeConfigs(baseConfig, visualization.chartConfig);
  }

  private buildScalesConfig(chartConfig: ChartConfig): ScalesConfig {
    const scales: ScalesConfig = {};

    if (chartConfig.xAxis) {
      scales.x = {
        display: chartConfig.xAxis.display !== false,
        title: {
          display: !!chartConfig.xAxis.label,
          text: chartConfig.xAxis.label
        },
        type: chartConfig.xAxis.type || 'category'
      };
    }

    if (chartConfig.yAxis) {
      scales.y = {
        display: chartConfig.yAxis.display !== false,
        title: {
          display: !!chartConfig.yAxis.label,
          text: chartConfig.yAxis.label
        },
        type: chartConfig.yAxis.type || 'linear',
        beginAtZero: chartConfig.yAxis.beginAtZero !== false
      };
    }

    return scales;
  }

  async exportVisualization(
    visualization: RenderedVisualization,
    format: ExportFormat
  ): Promise<ExportResult> {
    switch (format) {
      case 'png':
        return await this.exportToPNG(visualization);
      case 'svg':
        return await this.exportToSVG(visualization);
      case 'pdf':
        return await this.exportToPDF(visualization);
      case 'json':
        return await this.exportToJSON(visualization);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private async exportToPNG(visualization: RenderedVisualization): Promise<ExportResult> {
    const canvas = await this.renderingEngine.renderToCanvas(visualization.chart);
    const pngBuffer = canvas.toBuffer('image/png');
    
    return {
      format: 'png',
      data: pngBuffer,
      filename: `${visualization.title || 'chart'}.png`,
      mimeType: 'image/png',
      size: pngBuffer.length
    };
  }

  private async exportToSVG(visualization: RenderedVisualization): Promise<ExportResult> {
    const svgString = await this.renderingEngine.renderToSVG(visualization.chart);
    const svgBuffer = Buffer.from(svgString, 'utf-8');
    
    return {
      format: 'svg',
      data: svgBuffer,
      filename: `${visualization.title || 'chart'}.svg`,
      mimeType: 'image/svg+xml',
      size: svgBuffer.length
    };
  }
}
```

### Export Engine Implementation

```typescript
class ExportEngine {
  private pdfGenerator: PDFGenerator;
  private excelGenerator: ExcelGenerator;
  private csvGenerator: CSVGenerator;
  private htmlGenerator: HTMLGenerator;

  async exportReport(report: GeneratedReport, format: ExportFormat): Promise<ExportResult> {
    switch (format) {
      case 'pdf':
        return await this.exportToPDF(report);
      case 'excel':
        return await this.exportToExcel(report);
      case 'csv':
        return await this.exportToCSV(report);
      case 'html':
        return await this.exportToHTML(report);
      case 'json':
        return await this.exportToJSON(report);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private async exportToPDF(report: GeneratedReport): Promise<ExportResult> {
    const pdfDoc = await this.pdfGenerator.createDocument({
      title: report.reportName,
      author: 'Custom Reporting System',
      subject: 'Generated Report',
      creator: 'Report Builder'
    });

    // Add title page
    await this.pdfGenerator.addTitlePage(pdfDoc, {
      title: report.reportName,
      generatedAt: report.generatedAt,
      parameters: report.parameters
    });

    // Add sections
    for (const section of report.sections) {
      await this.pdfGenerator.addSection(pdfDoc, {
        title: section.title,
        content: section.content
      });

      // Add visualizations
      for (const visualization of section.visualizations) {
        const chartImage = await this.visualizationEngine.exportVisualization(
          visualization,
          'png'
        );
        await this.pdfGenerator.addImage(pdfDoc, chartImage.data, {
          title: visualization.title,
          width: 500,
          height: 300
        });
      }
    }

    const pdfBuffer = await this.pdfGenerator.finalize(pdfDoc);

    return {
      format: 'pdf',
      data: pdfBuffer,
      filename: `${report.reportName}.pdf`,
      mimeType: 'application/pdf',
      size: pdfBuffer.length
    };
  }

  private async exportToExcel(report: GeneratedReport): Promise<ExportResult> {
    const workbook = await this.excelGenerator.createWorkbook();

    // Create summary sheet
    const summarySheet = await this.excelGenerator.addWorksheet(workbook, 'Summary');
    await this.excelGenerator.addReportSummary(summarySheet, {
      reportName: report.reportName,
      generatedAt: report.generatedAt,
      parameters: report.parameters,
      dataFreshness: report.dataFreshness
    });

    // Add data sheets for each visualization
    for (const visualization of report.visualizations) {
      const dataSheet = await this.excelGenerator.addWorksheet(
        workbook,
        this.sanitizeSheetName(visualization.title)
      );

      // Add chart data
      await this.excelGenerator.addChartData(dataSheet, visualization.data);

      // Add chart if supported
      if (this.excelGenerator.supportsCharts()) {
        await this.excelGenerator.addChart(dataSheet, {
          type: visualization.type,
          data: visualization.data,
          title: visualization.title
        });
      }
    }

    const excelBuffer = await this.excelGenerator.writeToBuffer(workbook);

    return {
      format: 'excel',
      data: excelBuffer,
      filename: `${report.reportName}.xlsx`,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: excelBuffer.length
    };
  }

  private async exportToCSV(report: GeneratedReport): Promise<ExportResult> {
    // For CSV export, we'll combine all tabular data
    const csvData: string[] = [];
    
    // Add header
    csvData.push(`Report: ${report.reportName}`);
    csvData.push(`Generated: ${report.generatedAt.toISOString()}`);
    csvData.push(''); // Empty line

    // Add data from each visualization
    for (const visualization of report.visualizations) {
      csvData.push(`Section: ${visualization.title}`);
      
      if (visualization.data && visualization.data.datasets) {
        // Add headers
        const headers = ['Label', ...visualization.data.datasets.map(d => d.label)];
        csvData.push(headers.join(','));

        // Add data rows
        for (let i = 0; i < visualization.data.labels.length; i++) {
          const row = [
            visualization.data.labels[i],
            ...visualization.data.datasets.map(d => d.data[i])
          ];
          csvData.push(row.join(','));
        }
      }
      
      csvData.push(''); // Empty line between sections
    }

    const csvString = csvData.join('\n');
    const csvBuffer = Buffer.from(csvString, 'utf-8');

    return {
      format: 'csv',
      data: csvBuffer,
      filename: `${report.reportName}.csv`,
      mimeType: 'text/csv',
      size: csvBuffer.length
    };
  }

  private sanitizeSheetName(name: string): string {
    // Excel sheet names have restrictions
    return name
      .replace(/[\\\/\?\*\[\]]/g, '_') // Replace invalid characters
      .substring(0, 31); // Limit to 31 characters
  }
}
```

### Collaboration Manager Implementation

```typescript
class CollaborationManager {
  private reportStore: ReportStore;
  private commentStore: CommentStore;
  private notificationService: NotificationService;
  private realTimeSync: RealTimeSync;

  async shareReport(reportId: string, shareConfig: ShareConfig): Promise<ShareResult> {
    const report = await this.reportStore.findById(reportId);
    if (!report) throw new Error('Report not found');

    // Create share record
    const share: ReportShare = {
      id: this.generateShareId(),
      reportId,
      sharedBy: shareConfig.sharedBy,
      sharedWith: shareConfig.recipients,
      permissions: shareConfig.permissions,
      shareType: shareConfig.shareType,
      expiresAt: shareConfig.expiresAt,
      createdAt: new Date(),
      isActive: true
    };

    await this.reportStore.saveShare(share);

    // Send notifications
    for (const recipient of shareConfig.recipients) {
      await this.notificationService.sendShareNotification({
        recipient,
        reportName: report.name,
        sharedBy: shareConfig.sharedBy,
        shareUrl: this.generateShareUrl(share.id),
        permissions: shareConfig.permissions
      });
    }

    return {
      shareId: share.id,
      shareUrl: this.generateShareUrl(share.id),
      recipients: shareConfig.recipients,
      permissions: shareConfig.permissions
    };
  }

  async addComment(reportId: string, comment: CommentConfig): Promise<Comment> {
    const reportComment: Comment = {
      id: this.generateCommentId(),
      reportId,
      authorId: comment.authorId,
      content: comment.content,
      position: comment.position, // For positioning comments on specific visualizations
      parentCommentId: comment.parentCommentId, // For threaded comments
      createdAt: new Date(),
      updatedAt: new Date(),
      isResolved: false
    };

    await this.commentStore.save(reportComment);

    // Notify report collaborators
    const collaborators = await this.getReportCollaborators(reportId);
    for (const collaborator of collaborators) {
      if (collaborator.id !== comment.authorId) {
        await this.notificationService.sendCommentNotification({
          recipient: collaborator.id,
          reportId,
          commentId: reportComment.id,
          authorName: comment.authorName,
          content: comment.content
        });
      }
    }

    // Broadcast real-time update
    await this.realTimeSync.broadcastComment(reportId, reportComment);

    return reportComment;
  }

  async enableRealTimeCollaboration(reportId: string, userId: string): Promise<CollaborationSession> {
    const session: CollaborationSession = {
      id: this.generateSessionId(),
      reportId,
      userId,
      startedAt: new Date(),
      lastActivity: new Date(),
      isActive: true
    };

    await this.realTimeSync.joinSession(session);

    // Notify other collaborators
    const otherSessions = await this.realTimeSync.getActiveSessions(reportId);
    for (const otherSession of otherSessions) {
      if (otherSession.userId !== userId) {
        await this.realTimeSync.notifyUserJoined(otherSession.id, {
          userId,
          joinedAt: new Date()
        });
      }
    }

    return session;
  }

  async syncReportChanges(reportId: string, changes: ReportChange[]): Promise<SyncResult> {
    const report = await this.reportStore.findById(reportId);
    if (!report) throw new Error('Report not found');

    // Apply changes with conflict resolution
    const appliedChanges: AppliedChange[] = [];
    const conflicts: ChangeConflict[] = [];

    for (const change of changes) {
      try {
        const appliedChange = await this.applyChange(report, change);
        appliedChanges.push(appliedChange);
      } catch (error) {
        if (error instanceof ConflictError) {
          conflicts.push({
            change,
            conflict: error.conflict,
            resolution: error.suggestedResolution
          });
        } else {
          throw error;
        }
      }
    }

    // Save updated report
    if (appliedChanges.length > 0) {
      report.version++;
      report.lastModified = new Date();
      await this.reportStore.update(report);

      // Broadcast changes to other collaborators
      await this.realTimeSync.broadcastChanges(reportId, appliedChanges);
    }

    return {
      appliedChanges,
      conflicts,
      newVersion: report.version
    };
  }

  private async applyChange(report: Report, change: ReportChange): Promise<AppliedChange> {
    // Check for conflicts
    if (change.baseVersion && change.baseVersion < report.version) {
      const conflict = await this.detectConflict(report, change);
      if (conflict) {
        throw new ConflictError(conflict);
      }
    }

    // Apply the change
    switch (change.type) {
      case 'update_visualization':
        return await this.applyVisualizationUpdate(report, change);
      case 'add_visualization':
        return await this.applyVisualizationAdd(report, change);
      case 'remove_visualization':
        return await this.applyVisualizationRemove(report, change);
      case 'update_layout':
        return await this.applyLayoutUpdate(report, change);
      default:
        throw new Error(`Unsupported change type: ${change.type}`);
    }
  }
}
```

## Integration Points

### Business Intelligence Platform Integration
```typescript
interface BIIntegration {
  // Tableau integration
  tableau: {
    serverUrl: string;
    enableEmbedding: boolean;
    enableDataExtract: boolean;
  };
  
  // Power BI integration
  powerBI: {
    workspaceId: string;
    enableEmbedding: boolean;
    enableDirectQuery: boolean;
  };
  
  // Looker integration
  looker: {
    instanceUrl: string;
    enableEmbedding: boolean;
    enableScheduledReports: boolean;
  };
}

class BIIntegrationService {
  async embedExternalReport(reportConfig: ExternalReportConfig): Promise<EmbeddedReport> {
    switch (reportConfig.platform) {
      case 'tableau':
        return await this.embedTableauReport(reportConfig);
      case 'powerbi':
        return await this.embedPowerBIReport(reportConfig);
      case 'looker':
        return await this.embedLookerReport(reportConfig);
      default:
        throw new Error(`Unsupported BI platform: ${reportConfig.platform}`);
    }
  }
}
```

### Data Source Integration
```typescript
interface DataSourceConfig {
  databases: DatabaseConfig[];
  apis: APIConfig[];
  files: FileConfig[];
  cloudServices: CloudServiceConfig[];
}

class DataSourceConnector {
  async connectToDatabase(config: DatabaseConfig): Promise<DatabaseConnection> {
    const connection = await this.createDatabaseConnection(config);
    await this.validateConnection(connection);
    return connection;
  }

  async connectToAPI(config: APIConfig): Promise<APIConnection> {
    const connection = await this.createAPIConnection(config);
    await this.validateAPIConnection(connection);
    return connection;
  }

  async executeQuery(query: DataQuery, connection: DataConnection): Promise<QueryResult> {
    const result = await connection.execute(query);
    return this.transformQueryResult(result);
  }
}
```

## Security Considerations

### Report Security and Access Control
```typescript
class ReportSecurityManager {
  async validateReportAccess(userId: string, reportId: string, action: string): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    const reportPermissions = await this.getReportPermissions(reportId);
    
    return this.checkReportPermissions(userPermissions, reportPermissions, action);
  }

  async auditReportAccess(userId: string, reportId: string, action: string): Promise<void> {
    await this.auditLogger.log({
      userId,
      resource: `report:${reportId}`,
      action,
      timestamp: new Date(),
      ipAddress: await this.getCurrentUserIP(userId)
    });
  }

  async sanitizeReportData(data: QueryResult, userPermissions: UserPermissions): Promise<QueryResult> {
    // Apply data masking and filtering based on user permissions
    return await this.dataGovernance.applyDataPolicies(data, userPermissions);
  }
}
```

## Testing Considerations

### Custom Reporting Testing
```typescript
describe('Custom Reporting Functionality', () => {
  it('should create reports with correct structure', async () => {
    const reportConfig = {
      name: 'Test Report',
      type: 'dashboard',
      visualizations: [
        { type: 'bar_chart', title: 'Test Chart', dataQuery: 'SELECT * FROM test_data' }
      ]
    };
    
    const report = await reportBuilder.createReport(reportConfig);
    
    expect(report.name).toBe('Test Report');
    expect(report.visualizations).toHaveLength(1);
    expect(report.visualizations[0].type).toBe('bar_chart');
  });

  it('should export reports in multiple formats', async () => {
    const report = await reportBuilder.generateReport('test-report');
    
    const pdfExport = await exportEngine.exportReport(report, 'pdf');
    const excelExport = await exportEngine.exportReport(report, 'excel');
    
    expect(pdfExport.format).toBe('pdf');
    expect(pdfExport.data).toBeInstanceOf(Buffer);
    expect(excelExport.format).toBe('excel');
    expect(excelExport.data).toBeInstanceOf(Buffer);
  });

  it('should handle collaborative editing', async () => {
    const changes = [
      { type: 'update_visualization', visualizationId: 'viz-1', config: { title: 'Updated Title' } }
    ];
    
    const syncResult = await collaborationManager.syncReportChanges('test-report', changes);
    
    expect(syncResult.appliedChanges).toHaveLength(1);
    expect(syncResult.conflicts).toHaveLength(0);
  });
});
```

## Real-World Considerations

### Performance and Scalability
- Implement query optimization and caching for large datasets
- Use progressive loading for complex reports with many visualizations
- Consider report pagination and lazy loading for better user experience
- Implement efficient data streaming for real-time reports

### User Experience
- Provide intuitive drag-and-drop interfaces for report building
- Implement responsive design for mobile and tablet access
- Add contextual help and guided tutorials for new users
- Enable keyboard shortcuts and accessibility features

### Data Governance and Compliance
- Implement row-level security and column-level permissions
- Maintain audit trails for report access and modifications
- Ensure compliance with data privacy regulations (GDPR, CCPA)
- Regular security assessments and penetration testing

### Business Integration
- Align reporting capabilities with business requirements
- Provide template libraries for common business scenarios
- Enable integration with existing business intelligence tools
- Regular user feedback collection and feature enhancement