exports.handler = async (event) => {
    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Yash Bonde says '+event.queryStringParameters.word),
    };
    return response;
};
