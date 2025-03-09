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
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
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

    const listProceduresLambda = new NodejsFunction(
      this,
      'listProceduresLambda',
      {
        runtime: Runtime.NODEJS_20_X,
        handler: 'handler',
        entry: 'src/lambda/list.ts',
        environment: {
          TABLE_NAME: proceduresTable.tableName,
        },
      }
    );

    const updateProceduresLambda = new NodejsFunction(
      this,
      'updateProceduresLambda',
      {
        runtime: Runtime.NODEJS_20_X,
        handler: 'handler',
        entry: 'src/lambda/update.ts',
        environment: {
          TABLE_NAME: proceduresTable.tableName,
        },
      }
    );

    const createProcedureLambda = new NodejsFunction(
      this,
      'CreateProcedureLambda',
      {
        runtime: Runtime.NODEJS_20_X,
        handler: 'handler',
        entry: 'src/lambda/create.ts',
        environment: {
          TABLE_NAME: proceduresTable.tableName,
        },
      }
    );

    const deleteProcedureLambda = new NodejsFunction(
      this,
      'DeleteProcedureLambda',
      {
        runtime: Runtime.NODEJS_20_X,
        handler: 'handler',
        entry: 'src/lambda/delete.ts',
        environment: {
          TABLE_NAME: proceduresTable.tableName,
        },
      }
    );

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
