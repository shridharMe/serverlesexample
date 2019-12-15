# Project folder structure. 
* Lambda function code is inside  **lambdacode** folder.
* There are 2 cloduformation template inside **infracode** folder. 
    * **prerequisite.yaml**  is for creating prequisite resources like S3 bucket and Dynamodb.
    * **serverlessTest.yaml**  is for creating main resources like lambda and APIgateway.

# Follow below steps to test the code.
#### 1. cd infracode/
#### 2. Run following prerequisite steps to setup S3 bucket and Dynamodb table
```sh
# validate cloudformation
aws cloudformation validate-template --template-body file://prerequisite.yaml 
 
# create stack to provision S3 bucket and Dynamodb
aws cloudformation  create-stack --stack-name prerequisite --template-body file://prerequisite.yaml

# wait for stack to  complete
aws cloudformation wait stack-create-complete --stack-name prerequisite

# add data to the new created dynamodb
aws dynamodb batch-write-item --request-items file://InterestBandData.json
```
#### 2. Run following steps to create lambda,apigateway for our restApi

```sh
# This step is optional : create zip file of the lambda code index.js and place the zip file in root directory; Zip file already exists at root location. 
zip   ../lambdaCode.zip ../lambdaCode/index.js

# upload lambda function code zip file on S3 bucket
aws s3 cp ../lambdaCode.zip s3://dprlambdacode/lambdaCode.zip

# validate cloudformation
aws cloudformation validate-template --template-body file://serverlessTest.yaml

# create stack to provision lambda and apigateway
aws cloudformation  create-stack --capabilities  CAPABILITY_AUTO_EXPAND CAPABILITY_IAM --stack-name lambdafunction --template-body file://serverlessTest.yaml

# wait for stack to  complete
aws cloudformation wait stack-create-complete --stack-name lambdafunction
```

#### 3. Get the restAPI URL from the aws console, output tab of lambdafunction stack 
* e.g. https://baelgim1wb.execute-api.eu-west-1.amazonaws.com/dit?amount=
* api expects **amount** as numeric query parameter e.g. ?amount=100

#### 4. Run following steps to cleanup resources 
```sh
# empty S3 bucket
aws s3 rm s3://dprlambdacode --recursive

# delete lambda and apigateway
aws cloudformation  delete-stack --stack-name  lambdafunction

# delete S3 bucket and Dynamodb
aws cloudformation  delete-stack --stack-name  prerequisite

# ensure cloudwatch resource also gets deleted, if not delete it manually
```