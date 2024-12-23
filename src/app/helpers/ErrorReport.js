import nodemailer from "nodemailer";
export default async function ErrorReport(error) {
  try {
    const { fileName, lineNumber, functionName } = getErrorLocation(error);
    let serializedError = {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
    };
    await sendEmailOtp(
      "babluyadav53543@gmail.com",
      ` file => ${fileName} \n line => ${lineNumber} \n function => ${functionName} \n ${JSON.stringify(
        serializedError
      )}`
    );
  } catch (error) {
    console.log(error);
  }
}

async function sendEmailOtp(EmailId, error) {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "manchestercityfootbaal24@gmail.com",
        pass: "xcjmrimqkkvgueau",
      },
    });

    let mailOptions = {
      from: "manchesterfootbaal24@gmail.com",
      to: `${EmailId}`,
      subject: "Error",
      text: error,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

function getErrorLocation(error) {
  const stack = error.stack;
  if (!stack) {
    return {
      fileName: null,
      lineNumber: null,
      functionName: null,
    };
  }

  const stackLines = stack.split("\n");

  for (let i = 1; i < stackLines.length; i++) {
    const line = stackLines[i].trim();
    const match = line.match(/at\s(.*?\s)?\(?([^:]+):(\d+):(\d+)\)?$/);
    if (match) {
      const [, functionName, fileName, lineNumber] = match;
      return {
        fileName,
        lineNumber,
        functionName,
      };
    }
  }

  return {
    fileName: null,
    lineNumber: null,
    functionName: null,
  };
}
