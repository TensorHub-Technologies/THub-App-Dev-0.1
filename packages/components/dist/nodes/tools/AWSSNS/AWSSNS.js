"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("@langchain/core/tools");
const utils_1 = require("../../../src/utils");
const client_sns_1 = require("@aws-sdk/client-sns");
class AWSSNSTool extends tools_1.Tool {
    name = 'aws_sns_publish';
    description = 'Publishes a message to an AWS SNS topic';
    snsClient;
    topicArn;
    constructor(snsClient, topicArn) {
        super();
        this.snsClient = snsClient;
        this.topicArn = topicArn;
    }
    async _call(message) {
        try {
            const command = new client_sns_1.PublishCommand({
                TopicArn: this.topicArn,
                Message: message
            });
            const response = await this.snsClient.send(command);
            return `Successfully published message to SNS topic. MessageId: ${response.MessageId}`;
        }
        catch (error) {
            return `Failed to publish message to SNS: ${error}`;
        }
    }
}
class AWSSNS_Tools {
    label;
    name;
    version;
    type;
    icon;
    category;
    description;
    baseClasses;
    credential;
    inputs;
    constructor() {
        this.label = 'AWS SNS';
        this.name = 'awsSNS';
        this.version = 1.0;
        this.type = 'AWSSNS';
        this.icon = 'awssns.svg';
        this.category = 'Tools';
        this.description = 'Publish messages to AWS SNS topics';
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(AWSSNSTool)];
        this.credential = {
            label: 'AWS Credentials',
            name: 'credential',
            type: 'credential',
            credentialNames: ['awsApi']
        };
        this.inputs = [
            {
                label: 'AWS Region',
                name: 'region',
                type: 'options',
                options: [
                    { label: 'US East (N. Virginia) - us-east-1', name: 'us-east-1' },
                    { label: 'US East (Ohio) - us-east-2', name: 'us-east-2' },
                    { label: 'US West (N. California) - us-west-1', name: 'us-west-1' },
                    { label: 'US West (Oregon) - us-west-2', name: 'us-west-2' },
                    { label: 'Africa (Cape Town) - af-south-1', name: 'af-south-1' },
                    { label: 'Asia Pacific (Hong Kong) - ap-east-1', name: 'ap-east-1' },
                    { label: 'Asia Pacific (Mumbai) - ap-south-1', name: 'ap-south-1' },
                    { label: 'Asia Pacific (Osaka) - ap-northeast-3', name: 'ap-northeast-3' },
                    { label: 'Asia Pacific (Seoul) - ap-northeast-2', name: 'ap-northeast-2' },
                    { label: 'Asia Pacific (Singapore) - ap-southeast-1', name: 'ap-southeast-1' },
                    { label: 'Asia Pacific (Sydney) - ap-southeast-2', name: 'ap-southeast-2' },
                    { label: 'Asia Pacific (Tokyo) - ap-northeast-1', name: 'ap-northeast-1' },
                    { label: 'Canada (Central) - ca-central-1', name: 'ca-central-1' },
                    { label: 'Europe (Frankfurt) - eu-central-1', name: 'eu-central-1' },
                    { label: 'Europe (Ireland) - eu-west-1', name: 'eu-west-1' },
                    { label: 'Europe (London) - eu-west-2', name: 'eu-west-2' },
                    { label: 'Europe (Milan) - eu-south-1', name: 'eu-south-1' },
                    { label: 'Europe (Paris) - eu-west-3', name: 'eu-west-3' },
                    { label: 'Europe (Stockholm) - eu-north-1', name: 'eu-north-1' },
                    { label: 'Middle East (Bahrain) - me-south-1', name: 'me-south-1' },
                    { label: 'South America (São Paulo) - sa-east-1', name: 'sa-east-1' }
                ],
                default: 'us-east-1',
                description: 'AWS Region where your SNS topics are located'
            },
            {
                label: 'SNS Topic',
                name: 'topicArn',
                type: 'asyncOptions',
                loadMethod: 'listTopics',
                description: 'Select the SNS topic to publish to',
                refresh: true
            }
        ];
    }
    //@ts-ignore
    loadMethods = {
        listTopics: async (nodeData, options) => {
            try {
                const credentialData = await (0, utils_1.getCredentialData)(nodeData.credential ?? '', options ?? {});
                const accessKeyId = (0, utils_1.getCredentialParam)('awsKey', credentialData, nodeData);
                const secretAccessKey = (0, utils_1.getCredentialParam)('awsSecret', credentialData, nodeData);
                const sessionToken = (0, utils_1.getCredentialParam)('awsSession', credentialData, nodeData);
                const region = nodeData.inputs?.region || 'us-east-1';
                if (!accessKeyId || !secretAccessKey) {
                    return [
                        {
                            label: 'AWS Credentials Required',
                            name: 'placeholder',
                            description: 'Enter AWS Access Key ID and Secret Access Key'
                        }
                    ];
                }
                const credentials = {
                    accessKeyId: accessKeyId,
                    secretAccessKey: secretAccessKey
                };
                if (sessionToken) {
                    credentials.sessionToken = sessionToken;
                }
                const snsClient = new client_sns_1.SNSClient({
                    region: region,
                    credentials: credentials
                });
                const command = new client_sns_1.ListTopicsCommand({});
                const response = await snsClient.send(command);
                if (!response.Topics || response.Topics.length === 0) {
                    return [
                        {
                            label: 'No topics found',
                            name: 'placeholder',
                            description: 'No SNS topics found in this region'
                        }
                    ];
                }
                return response.Topics.map((topic) => {
                    const topicArn = topic.TopicArn || '';
                    const topicName = topicArn.split(':').pop() || topicArn;
                    return {
                        label: topicName,
                        name: topicArn,
                        description: topicArn
                    };
                });
            }
            catch (error) {
                console.error('Error loading SNS topics:', error);
                return [
                    {
                        label: 'Error Loading Topics',
                        name: 'error',
                        description: `Failed to load topics: ${error}`
                    }
                ];
            }
        }
    };
    async init(nodeData, _, options) {
        const credentialData = await (0, utils_1.getCredentialData)(nodeData.credential ?? '', options);
        const accessKeyId = (0, utils_1.getCredentialParam)('awsKey', credentialData, nodeData);
        const secretAccessKey = (0, utils_1.getCredentialParam)('awsSecret', credentialData, nodeData);
        const sessionToken = (0, utils_1.getCredentialParam)('awsSession', credentialData, nodeData);
        const region = nodeData.inputs?.region || 'us-east-1';
        const topicArn = nodeData.inputs?.topicArn;
        if (!accessKeyId || !secretAccessKey) {
            throw new Error('AWS Access Key ID and Secret Access Key are required');
        }
        if (!topicArn) {
            throw new Error('SNS Topic ARN is required');
        }
        const credentials = {
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey
        };
        if (sessionToken) {
            credentials.sessionToken = sessionToken;
        }
        const snsClient = new client_sns_1.SNSClient({
            region: region,
            credentials: credentials
        });
        return new AWSSNSTool(snsClient, topicArn);
    }
}
module.exports = { nodeClass: AWSSNS_Tools };
//# sourceMappingURL=AWSSNS.js.map