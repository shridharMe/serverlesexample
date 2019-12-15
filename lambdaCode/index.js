// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region
AWS.config.update({ region: 'eu-west-1' });
// Create DynamoDB service object
var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

exports.handler = function (event, context) {
    if (event.query != undefined && event.query.amount != undefined && !isNaN(event.query.amount)) {
        var reqAmt = event.query.amount
        var params = {
            TableName: 'InterestBand',
            ExpressionAttributeValues: {
                ':reqAmt': { N: reqAmt }
            },
            FilterExpression: "minAmt <=:reqAmt   AND  maxAmt >= :reqAmt "
        }
        if (reqAmt >= 50000) { 
            context.done(null, "3");
        } else {
            ddb.scan(params, function (err, data) {
                if (err) {
                    console.log("Error", err);
                } else {
                        data.Items.forEach(function (element, index, array) {
                            context.done(null, element.interest.N);                        
                    });

                }
            });

        }
    } else {
        context.done(null, "invalid query parameter; api expects 'amount' numeric query parameter" );
    }

}



