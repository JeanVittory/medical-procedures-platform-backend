import * as cdk from 'aws-cdk-lib';
import {
  ApiKey,
  ApiKeySourceType,
  Cors,
  RestApi,
  UsagePlan,
  LambdaIntegration,
} from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class CdkInfraAssessmentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const proceduresTable = new Table(this, 'procedureTable', {
      tableName: 'Procedures',
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const dynamoPolicy = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'dynamodb:Scan',
        'dynamodb:GetItem',
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
        'dynamodb:DeleteItem',
      ],
      resources: [proceduresTable.tableArn],
    });

    const api = new RestApi(this, 'proceduresRestApiGateway', {
      restApiName: 'Procedures API',
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
      },
      apiKeySourceType: ApiKeySourceType.HEADER,
    });

    const apiKey = new ApiKey(this, 'proceduresAPIKey');

    const usagePlan = new UsagePlan(this, 'proceduresUsagePlan', {
      name: 'Procedures usage plan',
      apiStages: [
        {
          api,
          stage: api.deploymentStage,
        },
      ],
    });

    usagePlan.addApiKey(apiKey);

    const listProceduresLambda = new Function(this, 'listProceduresLambda', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'list.handler',
      code: Code.fromAsset('dist/lambda'),
      environment: {
        TABLE_NAME: proceduresTable.tableName,
      },
    });

    const updateProceduresLambda = new Function(
      this,
      'updateProceduresLambda',
      {
        runtime: Runtime.NODEJS_20_X,
        handler: 'update.handler',
        code: Code.fromAsset('dist/lambda'),
        environment: {
          TABLE_NAME: proceduresTable.tableName,
        },
      }
    );

    const createProcedureLambda = new Function(this, 'CreateProcedureLambda', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'create.handler',
      code: Code.fromAsset('dist/lambda'),
      environment: {
        TABLE_NAME: proceduresTable.tableName,
      },
    });

    const deleteProcedureLambda = new Function(this, 'DeleteProcedureLambda', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'delete.handler',
      code: Code.fromAsset('dist/lambda'),
      environment: {
        TABLE_NAME: proceduresTable.tableName,
      },
    });

    const proceduresResource = api.root.addResource('procedures');

    proceduresResource.addMethod(
      'GET',
      new LambdaIntegration(listProceduresLambda),
      {
        apiKeyRequired: true,
      }
    );
    proceduresResource.addMethod(
      'PUT',
      new LambdaIntegration(updateProceduresLambda),
      {
        apiKeyRequired: true,
      }
    );
    proceduresResource.addMethod(
      'POST',
      new LambdaIntegration(createProcedureLambda),
      {
        apiKeyRequired: true,
      }
    );
    proceduresResource.addMethod(
      'DELETE',
      new LambdaIntegration(deleteProcedureLambda),
      {
        apiKeyRequired: true,
      }
    );

    listProceduresLambda.addToRolePolicy(dynamoPolicy);
    updateProceduresLambda.addToRolePolicy(dynamoPolicy);
    createProcedureLambda.addToRolePolicy(dynamoPolicy);
    deleteProcedureLambda.addToRolePolicy(dynamoPolicy);
  }
}
