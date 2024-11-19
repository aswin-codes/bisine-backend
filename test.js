const AWS = require('aws-sdk');
const dotenv = require("dotenv");
dotenv.config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-south-1',
});

const sns = new AWS.SNS();

// Function to publish a new product notification
const publishNewProductNotification = async (productName, productDetails) => {
  const topicArn = 'arn:aws:sns:ap-south-1:713881786120:ProductNotification';
  
  const params = {
    TopicArn: topicArn,
    Message: `A new product has been published!\n\nProduct Name: ${productName}\nDetails: ${productDetails}`,
    Subject: 'New Product Notification',
  };

  try {
    const result = await sns.publish(params).promise();
    console.log('Notification sent successfully:', result);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

publishNewProductNotification('Awesome Gadget', 'This gadget will make your life easier!');