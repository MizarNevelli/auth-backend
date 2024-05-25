export const registerMailTemplate = (redirect: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Awesome Email</title>
</head>
<body>
    <div>Hello, congratulations! You have successfully created your account!</div>

    <div>
      <a target="_" href="${redirect}">Go to Login page and use your credentials.</a>
    </div>
    
    <img src="cid:uniqueImageCID" alt="logo-image">
    
</body>
</html>
`;
