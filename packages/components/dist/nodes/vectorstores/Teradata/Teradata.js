"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const documents_1 = require("@langchain/core/documents");
const teradatasql = __importStar(require("teradatasql"));
const utils_1 = require("../../../src/utils");
class Teradata_VectorStores {
    label;
    name;
    version;
    description;
    type;
    icon;
    category;
    badge;
    baseClasses;
    credential;
    inputs;
    outputs;
    constructor() {
        this.label = 'teradata';
        this.name = 'teradata';
        this.version = 1.0;
        this.type = 'teradata';
        this.icon = 'teradata.svg';
        this.category = 'Vector Stores';
        this.description = 'Upsert embedded data and perform similarity search upon query using Teradata Enterprise Vector Store';
        this.baseClasses = [this.type, 'BaseRetriever'];
        this.credential = {
            label: 'Connect Credential',
            name: 'credential',
            type: 'credential',
            credentialNames: ['teradataVectorStoreApiCredentials']
        };
        this.inputs = [
            {
                label: 'Document',
                name: 'document',
                type: 'Document',
                list: true
            },
            {
                label: 'Embeddings',
                name: 'embeddings',
                type: 'Embeddings'
            },
            {
                label: 'Vector_Store_Name',
                name: 'vectorStoreName',
                description: 'Teradata Vector Store Name',
                placeholder: `Vector_Store_Name`,
                type: 'string'
            },
            {
                label: 'Database',
                name: 'database',
                description: 'Database for Teradata Vector Store',
                placeholder: 'Database',
                type: 'string'
            },
            {
                label: 'Embeddings_Table_Name',
                name: 'embeddingsTableName',
                description: 'Table name for storing embeddings',
                placeholder: 'Embeddings_Table_Name',
                type: 'string'
            },
            {
                label: 'Vector_Store_Description',
                name: 'vectorStoreDescription',
                description: 'Teradata Vector Store Description',
                placeholder: `Vector_Store_Description`,
                type: 'string',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Search_Algorithm',
                name: 'searchAlgorithm',
                description: 'Search Algorithm for Vector Store',
                placeholder: 'Search_Algorithm',
                type: 'string',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Distance_Metric',
                name: 'distanceMetric',
                description: 'Distance Metric to be used for distance calculation between vectors',
                placeholder: 'Distance_Metric',
                type: 'string',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Initial_Centroids_Method',
                name: 'initialCentroidsMethod',
                description: 'Algorithm to be used for initializing the cluster centroids for Search Algorithm KMEANS',
                placeholder: 'Initial_Centroids_Method',
                type: 'string',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Train_NumCluster',
                name: 'trainNumCluster',
                description: 'Number of clusters to be trained for Search Algorithm KMEANS',
                placeholder: 'Train_NumCluster',
                type: 'string',
                additionalParams: true,
                optional: true
            },
            {
                label: 'MaxIterNum',
                name: 'maxIterNum',
                description: 'Maximum number of iterations to be run during training for Search Algorithm KMEANS',
                placeholder: 'MaxIterNum',
                type: 'string',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Stop_Threshold',
                name: 'stopThreshold',
                description: 'Threshold value at which training should be stopped for Search Algorithm KMEANS',
                placeholder: 'Stop_Threshold',
                type: 'string',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Seed',
                name: 'seed',
                description: 'Seed value to be used for random number generation for Search Algorithm KMEANS',
                placeholder: 'Seed',
                type: 'string',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Num_Init',
                name: 'numInit',
                description: 'number of times the k-means algorithm should run with different initial centroid seeds for Search Algorithm KMEANS',
                placeholder: 'Num_Init',
                type: 'string',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Top_K',
                name: 'topK',
                description: 'Number of top results to fetch. Default to 10',
                placeholder: 'Top_K',
                type: 'string',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Search_Threshold',
                name: 'searchThreshold',
                description: 'Threshold value to consider for matching tables/views while searching',
                placeholder: 'Search_Threshold',
                type: 'string',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Search_NumCluster',
                name: 'searchNumCluster',
                description: 'Number of clusters to be considered while searching for Search Algorithm KMEANS',
                placeholder: 'Search_NumCluster',
                type: 'string',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Ef_Search',
                name: 'efSearch',
                description: 'Number of neighbors to be considered during search in HNSW graph for Search Algorithm HNSW',
                placeholder: 'Ef_Search',
                type: 'string',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Num_Layer',
                name: 'numLayer',
                description: 'Number of layers in the HNSW graph for Search Algorithm HNSW',
                placeholder: 'Num_Layer',
                type: 'string',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Ef_Construction',
                name: 'efConstruction',
                description: 'Number of neighbors to be considered during construction of the HNSW graph for Search Algorithm HNSW',
                placeholder: 'Ef_Construction',
                type: 'string',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Num_ConnPerNode',
                name: 'numConnPerNode',
                description: 'Number of connections per node in the HNSW graph during construction for Search Algorithm HNSW',
                placeholder: 'Num_ConnPerNode',
                type: 'string',
                additionalParams: true,
                optional: true
            },
            {
                label: 'MaxNum_ConnPerNode',
                name: 'maxNumConnPerNode',
                description: 'Maximum number of connections per node in the HNSW graph during construction for Search Algorithm HNSW',
                placeholder: 'MaxNum_ConnPerNode',
                type: 'string',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Apply_Heuristics',
                name: 'applyHeuristics',
                description: 'Specifies whether to apply heuristics optimizations during construction of the HNSW graph for Search Algorithm HNSW',
                placeholder: 'Apply_Heuristics',
                type: 'string',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Rerank_Weight',
                name: 'rerankWeight',
                description: 'Weight to be used for reranking the search results',
                placeholder: 'Rerank_Weight',
                type: 'string',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Relevance_Top_K',
                name: 'relevanceTopK',
                description: 'Number of top similarity matches to be considered for reranking',
                placeholder: 'Relevance_Top_K',
                type: 'string',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Relevance_Search_Threshold',
                name: 'relevanceSearchThreshold',
                description: 'Threshold value to consider for matching tables/views while reranking',
                placeholder: 'Relevance_Search_Threshold',
                type: 'string',
                additionalParams: true,
                optional: true
            }
        ];
        this.outputs = [
            {
                label: 'Teradata Retriever',
                name: 'retriever',
                baseClasses: this.baseClasses
            },
            {
                label: 'Teradata Vector Store',
                name: 'vectorStore',
                baseClasses: [this.type, ...this.baseClasses]
            }
        ];
    }
    //@ts-ignore
    vectorStoreMethods = {
        async upsert(nodeData, options) {
            const docs = nodeData.inputs?.document;
            const embeddings = nodeData.inputs?.embeddings;
            const embeddingsTableName = nodeData.inputs?.embeddingsTableName;
            const vectorStoreName = nodeData.inputs?.vectorStoreName;
            const database = nodeData.inputs?.database;
            const vectorStoreDescription = nodeData.inputs?.vectorStoreDescription || null;
            const searchAlgorithm = nodeData.inputs?.searchAlgorithm || null;
            const distanceMetric = nodeData.inputs?.distanceMetric || null;
            const initialCentroidsMethod = nodeData.inputs?.initialCentroidsMethod || null;
            const trainNumCluster = parseInt(nodeData.inputs?.trainNumCluster) || null;
            const maxIterNum = parseInt(nodeData.inputs?.maxIterNum) || null;
            const stopThreshold = parseFloat(nodeData.inputs?.stopThreshold) || null;
            const seed = parseInt(nodeData.inputs?.seed) || null;
            const numInit = parseInt(nodeData.inputs?.numInit) || null;
            const topK = parseInt(nodeData.inputs?.topK) || 10;
            const searchThreshold = parseFloat(nodeData.inputs?.searchThreshold) || null;
            const searchNumCluster = parseInt(nodeData.inputs?.searchNumCluster) || null;
            const efSearch = parseInt(nodeData.inputs?.efSearch) || null;
            const numLayer = parseInt(nodeData.inputs?.numLayer) || null;
            const efConstruction = parseInt(nodeData.inputs?.efConstruction) || null;
            const numConnPerNode = parseInt(nodeData.inputs?.numConnPerNode) || null;
            const maxNumConnPerNode = parseInt(nodeData.inputs?.maxNumConnPerNode) || null;
            const applyHeuristics = nodeData.inputs?.applyHeuristics?.toLowerCase() === 'true' || null;
            const rerankWeight = parseFloat(nodeData.inputs?.rerankWeight) || null;
            const relevanceTopK = parseInt(nodeData.inputs?.relevanceTopK) || null;
            const relevanceSearchThreshold = parseFloat(nodeData.inputs?.relevanceSearchThreshold) || null;
            const credentialData = await (0, utils_1.getCredentialData)(nodeData.credential ?? '', options);
            // Get authentication parameters with fallback to direct inputs
            const user = (0, utils_1.getCredentialParam)('tdUsername', credentialData, nodeData) || null;
            const password = (0, utils_1.getCredentialParam)('tdPassword', credentialData, nodeData) || null;
            const host = (0, utils_1.getCredentialParam)('tdHostIp', credentialData, nodeData) || null;
            const baseURL = (0, utils_1.getCredentialParam)('baseURL', credentialData, nodeData) || null;
            // JWT authentication parameters - prioritize credential store
            const providedJwtToken = (0, utils_1.getCredentialParam)('jwtToken', credentialData, nodeData) || null;
            if (!docs || docs.length === 0) {
                throw new Error('No documents provided for upsert operation');
            }
            if (!embeddings) {
                throw new Error('Embeddings are required for upsert operation');
            }
            let jwtToken = null;
            if (providedJwtToken) {
                jwtToken = providedJwtToken;
            }
            // Generate embeddings
            const embedded_vectors = await embeddings.embedDocuments(docs.map((doc) => doc.pageContent));
            if (embedded_vectors.length !== docs.length) {
                throw new Error('The number of embedded vectors does not match the number of documents.');
            }
            const embeddings_dims = embedded_vectors[0].length;
            // Create Teradata connection
            const connection = new teradatasql.TeradataConnection();
            let cur = null;
            let tempTableName = '';
            let embeddingsTableCreated = false;
            try {
                // Connect to Teradata
                connection.connect({
                    host: host,
                    user: user,
                    password: password,
                    database: database
                });
                cur = connection.cursor();
                // Start transaction
                connection.autocommit = false;
                // Create temporary embeddings table with VARBYTE first
                tempTableName = `${embeddingsTableName}_temp_${Date.now()}`;
                const createTempTableSql = `
                    CREATE MULTISET TABLE ${tempTableName}
                        (
                            element_id INTEGER,
                            chunks VARCHAR(32000) CHARACTER SET UNICODE,
                            embedding VARBYTE(64000)
                        );
                `;
                try {
                    cur.execute(createTempTableSql);
                    // Commit the DDL statement
                    connection.commit();
                }
                catch (error) {
                    throw new Error(`Failed to create temporary table ${tempTableName}: ${error.message}`);
                }
                // Insert documents and embeddings into the temporary table using FastLoad
                const insertSql = `
                    {fn teradata_require_fastload}INSERT INTO ${tempTableName} (?, ?, ?)`;
                const insertDataArr = [];
                for (let i = 0; i < docs.length; i++) {
                    const doc = docs[i];
                    const embedding = embedded_vectors[i];
                    const elementId = i;
                    // Convert embedding array of doubles to byte array for VARBYTE column
                    const embeddingBuffer = Buffer.alloc(embedding.length * 8); // 8 bytes per double
                    for (let j = 0; j < embedding.length; j++) {
                        embeddingBuffer.writeDoubleLE(embedding[j], j * 8);
                    }
                    insertDataArr.push([elementId, doc.pageContent, embeddingBuffer]);
                }
                try {
                    cur.execute(insertSql, insertDataArr);
                    // Commit the insert operation
                    connection.commit();
                }
                catch (error) {
                    console.error(`Failed to insert documents into temporary table: ${error.message}`);
                    throw error;
                }
                // Create the final table with VECTOR datatype using the original embeddings table name
                const createFinalTableSql = `
                    CREATE MULTISET TABLE ${embeddingsTableName}
                        (
                            element_id INTEGER,
                            chunks VARCHAR(32000) CHARACTER SET UNICODE,
                            embedding VECTOR
                        ) no primary index;
                `;
                try {
                    cur.execute(createFinalTableSql);
                    embeddingsTableCreated = true;
                    // Commit the DDL statement
                    connection.commit();
                }
                catch (error) {
                    throw new Error(`Failed to create final embeddings table ${embeddingsTableName}: ${error.message}`);
                }
                // Load data from temporary VARBYTE table to final VECTOR table with casting
                const loadFinalTableSql = `
                    INSERT INTO ${embeddingsTableName} (element_id, chunks, embedding)
                    SELECT 
                        element_id,
                        chunks,
                        CAST(embedding AS VECTOR)
                    FROM ${tempTableName};
                `;
                try {
                    cur.execute(loadFinalTableSql);
                }
                catch (error) {
                    console.error(`Failed to load data into final table: ${error.message}`);
                    throw new Error(`Failed to load data into final table: ${error.message}`);
                }
                // Drop the temporary table
                try {
                    cur.execute(`DROP TABLE ${tempTableName}`);
                    tempTableName = ''; // Clear the temp table name since it's been dropped
                }
                catch (error) {
                    console.error(`Failed to drop temporary table: ${error.message}`);
                    throw new Error(`Failed to drop temporary table: ${error.message}`);
                }
                // Commit the transaction
                connection.commit();
                connection.autocommit = true; // Re-enable autocommit
                // Continue with the original API-based vector store upload for compatibility
                const data = {
                    database_name: database
                };
                // Determine authentication method and headers
                let authHeaders = {};
                if (jwtToken) {
                    authHeaders = {
                        Authorization: `Bearer ${jwtToken}`,
                        'Content-Type': 'application/json'
                    };
                }
                else {
                    // Encode the credentials string using Base64
                    const credentials = `${user}:${password}`;
                    const encodedCredentials = Buffer.from(credentials).toString('base64');
                    authHeaders = {
                        Authorization: `Basic ${encodedCredentials}`,
                        'Content-Type': 'application/json'
                    };
                }
                const sessionUrl = baseURL + (baseURL.endsWith('/') ? '' : '/') + 'data-insights/api/v1/session';
                const response = await fetch(sessionUrl, {
                    method: 'POST',
                    headers: authHeaders,
                    body: JSON.stringify(data)
                });
                if (!response.ok) {
                    throw new Error(`Failed to create session: ${response.status}`);
                }
                // Extract session_id from Set-Cookie header
                const setCookie = response.headers.get('set-cookie');
                let session_id = '';
                if (setCookie) {
                    const match = setCookie.match(/session_id=([^;]+)/);
                    if (match) {
                        session_id = match[1];
                    }
                }
                // Utility function to filter out null/undefined values
                const filterNullValues = (obj) => {
                    return Object.fromEntries(Object.entries(obj).filter(([_, value]) => value !== null && value !== undefined));
                };
                const vsParameters = filterNullValues({
                    search_algorithm: searchAlgorithm,
                    top_k: topK,
                    embeddings_dims: embeddings_dims,
                    metric: distanceMetric,
                    initial_centroids_method: initialCentroidsMethod,
                    train_numcluster: trainNumCluster,
                    max_iternum: maxIterNum,
                    stop_threshold: stopThreshold,
                    seed: seed,
                    num_init: numInit,
                    search_threshold: searchThreshold,
                    search_num_cluster: searchNumCluster,
                    ef_search: efSearch,
                    num_layer: numLayer,
                    ef_construction: efConstruction,
                    num_connpernode: numConnPerNode,
                    maxnum_connpernode: maxNumConnPerNode,
                    apply_heuristics: applyHeuristics,
                    rerank_weight: rerankWeight,
                    relevance_top_k: relevanceTopK,
                    relevance_search_threshold: relevanceSearchThreshold,
                    description: vectorStoreDescription
                });
                const vsIndex = filterNullValues({
                    target_database: database,
                    object_names: [embeddingsTableName],
                    key_columns: ['element_id'],
                    data_columns: ['embedding'],
                    vector_column: 'vector_index',
                    is_embedded: true,
                    is_normalized: false,
                    metadata_columns: ['chunks'],
                    metadata_descriptions: ['Content or Chunk of the document']
                });
                const formData = new FormData();
                formData.append('vs_parameters', JSON.stringify(vsParameters));
                formData.append('vs_index', JSON.stringify(vsIndex));
                const vectorstoresUrl = baseURL + (baseURL.endsWith('/') ? '' : '/') + 'data-insights/api/v1/vectorstores/' + vectorStoreName;
                // Prepare headers for vectorstores API call
                let vectorstoreHeaders = {};
                if (jwtToken) {
                    vectorstoreHeaders = {
                        Authorization: `Bearer ${jwtToken}`,
                        Cookie: `session_id=${session_id}`
                    };
                }
                else {
                    const credentials = `${user}:${password}`;
                    const encodedCredentials = Buffer.from(credentials).toString('base64');
                    vectorstoreHeaders = {
                        Authorization: `Basic ${encodedCredentials}`,
                        Cookie: `session_id=${session_id}`
                    };
                }
                const upsertResponse = await fetch(vectorstoresUrl, {
                    method: 'POST',
                    headers: vectorstoreHeaders,
                    body: formData,
                    credentials: 'include'
                });
                if (!upsertResponse.ok) {
                    throw new Error(`Failed to upsert documents: ${upsertResponse.statusText}`);
                }
                return { numAdded: docs.length, addedDocs: docs };
            }
            catch (e) {
                // Rollback transaction on any error
                try {
                    if (connection && !connection.autocommit) {
                        connection.rollback();
                        connection.autocommit = true;
                    }
                    // Clean up temporary table if it exists
                    if (tempTableName && cur) {
                        try {
                            cur.execute(`DROP TABLE ${tempTableName}`);
                        }
                        catch (cleanupError) {
                            console.warn(`Failed to clean up temporary table: ${cleanupError.message}`);
                        }
                    }
                    // Clean up embeddings table if it was created during this transaction
                    if (embeddingsTableCreated && cur) {
                        try {
                            cur.execute(`DROP TABLE ${embeddingsTableName}`);
                        }
                        catch (cleanupError) {
                            console.warn(`Failed to clean up embeddings table: ${cleanupError.message}`);
                        }
                    }
                }
                catch (rollbackError) {
                    console.error(`Failed to rollback transaction: ${rollbackError.message}`);
                }
                throw new Error(e.message || e);
            }
            finally {
                if (cur) {
                    cur.close();
                }
                // Close the connection
                if (connection) {
                    connection.close();
                }
            }
        }
    };
    async init(nodeData, _, options) {
        const log_level = 0;
        const embeddings = nodeData.inputs?.embeddings;
        const vectorStoreName = nodeData.inputs?.vectorStoreName;
        const database = nodeData.inputs?.database;
        // Optional parameters for vector store configuration
        const topK = parseInt(nodeData.inputs?.topK) || 10;
        const credentialData = await (0, utils_1.getCredentialData)(nodeData.credential ?? '', options);
        // Get authentication parameters with fallback to direct inputs
        const user = (0, utils_1.getCredentialParam)('tdUsername', credentialData, nodeData) || null;
        const password = (0, utils_1.getCredentialParam)('tdPassword', credentialData, nodeData) || null;
        const baseURL = (0, utils_1.getCredentialParam)('baseURL', credentialData, nodeData) || null;
        // JWT authentication parameters - prioritize credential store
        const providedJwtToken = (0, utils_1.getCredentialParam)('jwtToken', credentialData, nodeData) || null;
        // Check if JWT authentication should be used
        let jwtToken = null;
        if (providedJwtToken) {
            jwtToken = providedJwtToken;
        }
        // Determine authentication headers
        let authHeaders = {};
        if (jwtToken) {
            authHeaders = {
                Authorization: `Bearer ${jwtToken}`,
                'Content-Type': 'application/json'
            };
        }
        else {
            const credentials = `${user}:${password}`;
            const encodedCredentials = Buffer.from(credentials).toString('base64');
            authHeaders = {
                Authorization: `Basic ${encodedCredentials}`,
                'Content-Type': 'application/json'
            };
        }
        const sessionData = {
            database_name: database
        };
        const sessionUrl = baseURL + (baseURL.endsWith('/') ? '' : '/') + 'data-insights/api/v1/session';
        const sessionResponse = await fetch(sessionUrl, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify(sessionData)
        });
        if (!sessionResponse.ok) {
            throw new Error(`Failed to create session: ${sessionResponse.status}`);
        }
        // Extract session_id from Set-Cookie header
        const setCookie = sessionResponse.headers.get('set-cookie');
        let session_id = '';
        if (setCookie) {
            const match = setCookie.match(/session_id=([^;]+)/);
            if (match) {
                session_id = match[1];
            }
        }
        // Helper function for similarity search
        const performSimilaritySearch = async (query) => {
            try {
                // Generate embeddings for the query
                const queryEmbedding = await embeddings.embedQuery(query);
                if (!queryEmbedding || queryEmbedding.length === 0) {
                    throw new Error('Failed to generate query embedding');
                }
                const queryEmbeddingString = queryEmbedding.join(',');
                // Prepare the search request
                const searchData = {
                    question_vector: queryEmbeddingString
                };
                // Prepare headers for search API call
                let searchHeaders = {};
                if (jwtToken) {
                    searchHeaders = {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${jwtToken}`,
                        Cookie: `session_id=${session_id}`
                    };
                }
                else {
                    const credentials = `${user}:${password}`;
                    const encodedCredentials = Buffer.from(credentials).toString('base64');
                    searchHeaders = {
                        'Content-Type': 'application/json',
                        Authorization: `Basic ${encodedCredentials}`,
                        Cookie: `session_id=${session_id}`
                    };
                }
                const searchUrl = `${baseURL}${baseURL.endsWith('/') ? '' : '/'}data-insights/api/v1/vectorstores/${vectorStoreName}/similarity-search?log_level=${log_level}`;
                const searchResponse = await fetch(searchUrl, {
                    method: 'POST',
                    headers: searchHeaders,
                    body: JSON.stringify(searchData),
                    credentials: 'include'
                });
                if (!searchResponse.ok) {
                    throw new Error(`Search failed: ${searchResponse.statusText}`);
                }
                const searchResults = await searchResponse.json();
                return (searchResults.similar_objects_list?.map((result) => new documents_1.Document({
                    pageContent: result.chunks || '',
                    metadata: {
                        score: result.score || 0,
                        source: vectorStoreName,
                        database: result.DataBaseName,
                        table: result.TableName,
                        id: result.element_id
                    }
                })) || []);
            }
            catch (error) {
                console.error('Error during similarity search:', error);
                throw error;
            }
        };
        // Create vector store object following THub pattern
        const vectorStore = {
            async similaritySearch(query) {
                return performSimilaritySearch(query);
            },
            async similaritySearchWithScore(query) {
                const docs = await performSimilaritySearch(query);
                return docs.map((doc) => [doc, doc.metadata.score || 0]);
            },
            // Add invoke method directly to vectorStore
            async invoke(query) {
                return performSimilaritySearch(query);
            },
            async getRelevantDocuments(query) {
                return performSimilaritySearch(query);
            },
            async _getRelevantDocuments(query) {
                return performSimilaritySearch(query);
            },
            asRetriever() {
                return {
                    async getRelevantDocuments(query) {
                        return performSimilaritySearch(query);
                    },
                    async invoke(query) {
                        return performSimilaritySearch(query);
                    },
                    async _getRelevantDocuments(query) {
                        return performSimilaritySearch(query);
                    }
                };
            }
        };
        // Create retriever using the vectorStore methods
        const retriever = {
            async getRelevantDocuments(query) {
                return vectorStore.getRelevantDocuments(query);
            },
            async invoke(query) {
                return vectorStore.invoke(query);
            },
            async _getRelevantDocuments(query) {
                return vectorStore._getRelevantDocuments(query);
            }
        };
        if (nodeData.outputs?.output === 'retriever') {
            return retriever;
        }
        else if (nodeData.outputs?.output === 'vectorStore') {
            ;
            vectorStore.k = topK;
            return vectorStore;
        }
        return vectorStore;
    }
}
module.exports = { nodeClass: Teradata_VectorStores };
//# sourceMappingURL=Teradata.js.map