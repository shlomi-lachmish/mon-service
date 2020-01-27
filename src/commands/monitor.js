/* eslint-disable no-lonely-if */
/* eslint-disable no-negated-condition */
/* eslint-disable object-curly-spacing */
/* eslint-disable semi */
/* eslint-disable quotes */
/* eslint-disable indent */
const { Command, flags } = require("@oclif/command");
const { promisify } = require("util");
const fs = require("fs");
const https = require("https");
const readFileAsync = promisify(fs.readFile);
const emojic = require("emojic");
const chalk = require("chalk");
const axios = require("axios");
const instance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

const getData = async element => {
  try {
    const thePL = element.hasOwnProperty("payload")
      ? element.payload
      : undefined;
    const response = await instance[element.type.toLowerCase()](
      element.url,
      thePL
    );
    // console.log(JSON.stringify(Object.keys(response), false, 2));
    // console.log(`${response.status} : ${response.statusText}`); // statusNumber
    // console.log(response.headers);
    // console.log(response.config);
    // if (thePL) {
    //   console.log(response.data, thePL);
    // }

    const data = response.data;
    let testProp = Object.keys(element.tests)[0];
    if (testProp !== "status") {
      // console.log(`testProp = ${testProp}`);
      // console.log(
      //   `element.tests[testProp] = ${JSON.stringify(element.tests[testProp])}`
      // );
      // console.log(`data[testProp] = ${JSON.stringify(data[testProp])}`);
      // console.log(
      //   `(data[testProp] === element.tests[testProp]) = ${data[testProp] ===
      //     element.tests[testProp]}`
      // );
      if (Array.isArray(element.tests[testProp])) {
        if (data[testProp][0] === element.tests[testProp][0]) {
          console.log(
            `${element.name}: ${chalk.bgGreen("Alive")} ${
              emojic.whiteCheckMark
            }`
          );
          if (thePL) {
            console.log(
              `input: ${JSON.stringify(thePL)} , output: ${JSON.stringify(
                response.data
              )}`
            );
          }
        } else {
          console.log(`${element.name}: ${chalk.bgRed("Dead")} ${emojic.x}`);
        }
      } else {
        if (data[testProp] === element.tests[testProp]) {
          console.log(
            `${element.name}: ${chalk.bgGreen("Alive")} ${
              emojic.whiteCheckMark
            }`
          );
        } else {
          console.log(`${element.name}: ${chalk.bgRed("Dead")} ${emojic.x}`);
        }
      }
    } else {
      if (response[testProp] === element.tests[testProp]) {
        console.log(
          `${element.name}: ${chalk.bgGreen("Alive")} ${emojic.whiteCheckMark}`
        );
      } else {
        console.log(`${element.name}: ${chalk.bgRed("Dead")} ${emojic.x}`);
      }
    }
  } catch (error) {
    let testProp = Object.keys(element.tests)[0];
    // console.error(error);
    if (error.response[testProp] === element.tests[testProp]) {
      console.log(
        `${element.name}: ${chalk.bgGreen("Alive")} ${emojic.whiteCheckMark}`
      );
    } else {
      console.log(`${element.name}: ${chalk.bgRed("Dead")} ${emojic.x}`);
      // console.error(Object.keys(error));
      // console.error(error.toJSON());
      // console.error(Object.keys(error.response));
      console.error(
        `${chalk.bgRed(error.response.status)} : ${chalk.bgRed(
          error.response.statusText
        )}`
      );
    }
    // console.log(`${element.name}: ${chalk.bgRed("Dead")} ${emojic.x}`);
  }
};
const isValidUrl = string => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};
class MonitorCommand extends Command {
  async run() {
    const { flags } = this.parse(MonitorCommand);
    const fileName = flags.file || "Please add test file path...";

    // readFileAsync(axios.get('db.json') .then(//...), { encoding: "utf8" })
    // const agent = new https.Agent({
    //   rejectUnauthorized: false
    // });
    if (isValidUrl(fileName)) {
      this.log(`This is the url name you gave me: ${fileName}`);
      instance
        .get(fileName)
        .then(contents => {
          // console.log(contents);
          // let arrTests = JSON.parse(contents);
          contents.data.forEach(element => {
            getData(element);
          });
        })
        .catch(error => {
          console.log(`err: ${error.code}`);
          throw error;
        });
    } else {
      this.log(`This is the file name you gave me: ${fileName}`);
      readFileAsync(`${__dirname}/../../${fileName}`, { encoding: "utf8" })
        .then(contents => {
          console.log(contents);
          let arrTests = JSON.parse(contents);
          arrTests.forEach(element => {
            getData(element);
          });
        })
        .catch(error => {
          console.log(`err: ${error.code}`);
          throw error;
        });
    }
  }
}

MonitorCommand.description = `Describe the Monitor command here
...
Extra documentation goes here
`;

MonitorCommand.flags = {
  file: flags.string({ char: "f", description: "tests object file path" })
};

module.exports = MonitorCommand;
