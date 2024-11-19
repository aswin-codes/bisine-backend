const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: 'AKIA2MNVLS4EC2LF3R4H',
  secretAccessKey: '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',
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

// Example usage
publishNewProductNotification('Awesome Gadget', 'This gadget will make your life easier!');
