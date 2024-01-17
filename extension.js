const vscode = require("vscode");
const axios = require("axios");

const API_KEY_KEY = "geminicopilot.apiKey";
const YOUR_API_ENDPOINT = "http://localhost:3001/api/aichat";

function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

async function activate(context) {
  let apiKey = context.globalState.get(API_KEY_KEY);

  if (!apiKey) {
    let input = await vscode.window.showInputBox({
      placeHolder: "Enter your API key for Gemini Copilot",
      password: true,
    });

    if (input) {
      context.globalState.update(API_KEY_KEY, input);
      vscode.window.showInformationMessage("API key saved successfully!");
    } else {
      vscode.window.showErrorMessage(
        "API key is required. Please enter a valid API key."
      );
    }
  }

  let changeApiKeyDisposable = vscode.commands.registerCommand(
    "geminicopilot.changeApiKey",
    async function () {
      let input = await vscode.window.showInputBox({
        placeHolder: "Enter your new API key for Gemini Copilot",
        password: true,
      });

      if (input) {
        context.globalState.update(API_KEY_KEY, input);
        vscode.window.showInformationMessage("API key updated successfully!");
      } else {
        vscode.window.showErrorMessage(
          "API key is required. Please enter a valid API key."
        );
      }
    }
  );

  let keyBindingDisposable = vscode.commands.registerCommand(
    "extension.changeApiKey",
    () => {
      vscode.commands.executeCommand("geminicopilot.changeApiKey");
    }
  );

  vscode.workspace.onDidChangeTextDocument(async (event) => {
    if (
      vscode.window.activeTextEditor &&
      event.document === vscode.window.activeTextEditor.document
    ) {
      const documentContent = event.document.getText();
      const storedApiKey = context.globalState.get(API_KEY_KEY);

      if (!storedApiKey) {
        vscode.window.showErrorMessage(
          "API key is missing. Please enter a valid API key."
        );
        return;
      }

      //   try {
      //     const response = await axios.post(
      //       YOUR_API_ENDPOINT,
      //       { content: documentContent },
      //       {
      //         headers: {
      //           Authorization: `Bearer ${storedApiKey}`,
      //           "Content-Type": "application/json",
      //         },
      //       }
      //     );

      //     console.log(response.data);
      //   } catch (error) {
      //     vscode.window.showErrorMessage(
      //       `Error sending data to API: ${error.message}`
      //     );
      //   }
    }
  });

  let helloWorldDisposable = vscode.commands.registerCommand(
    "geminicopilot.helloWorld",
    async function () {
      const activeEditor = vscode.window.activeTextEditor;

      if (activeEditor) {
        const currentPosition = activeEditor.selection.start;
        const lineTwoLinesAbove = currentPosition.line;
        const wholeText = activeEditor.document.getText();

        if (lineTwoLinesAbove >= 0) {
          const textTwoLinesAbove =
            activeEditor.document.lineAt(lineTwoLinesAbove).text;

          const storedApiKey = context.globalState.get(API_KEY_KEY);

          if (!storedApiKey) {
            vscode.window.showErrorMessage(
              "API key is missing. Please enter a valid API key."
            );
            return;
          }

          try {
            const url = `${YOUR_API_ENDPOINT}/${apiKey}`;

            const response = await axios.post(
              url,
              {
                query: textTwoLinesAbove,
                wholeText: wholeText,
              },
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            const result = response.data;
            console.log(result);
            vscode.window.showInformationMessage("Req sent");
          } catch (error) {
            vscode.window.showErrorMessage(
              `Error sending data to API: ${error.message}`
            );
          }
        } else {
          vscode.window.showInformationMessage(
            "Not enough lines above the current line"
          );
        }
      } else {
        vscode.window.showErrorMessage("No active text editor.");
      }
    }
  );

  //   const debounceDelay = 2000;
  //   let onTypeDisposable = vscode.workspace.onDidChangeTextDocument(
  //     debounce(async (event) => {
  //       if (
  //         vscode.window.activeTextEditor &&
  //         event.document === vscode.window.activeTextEditor.document
  //       ) {
  //         const cursorPosition = vscode.window.activeTextEditor.selection.start;
  //         const line = event.document.lineAt(cursorPosition.line).text;
  //         vscode.window.showInformationMessage(`changing ${line}`);

  //         const storedApiKey = context.globalState.get(API_KEY_KEY);

  //         if (!storedApiKey) {
  //           vscode.window.showErrorMessage(
  //             "API key is missing. Please enter a valid API key."
  //           );
  //           return;
  //         }

  // 		if(line.length < 5){

  // 		}

  //         try {
  //           const url = `${YOUR_API_ENDPOINT}/${apiKey}`;
  //           const response = await axios.post(
  //             url,
  //             { content: line },
  //             {
  //               headers: {
  //                 Authorization: `Bearer ${storedApiKey}`,
  //                 "Content-Type": "application/json",
  //               },
  //             }
  //           );

  //           console.log(response.data);
  //         } catch (error) {
  //           vscode.window.showErrorMessage(
  //             `Error sending data to API: ${error.message}`
  //           );
  //         }
  //       }
  //     }, debounceDelay)
  //   );

  context.subscriptions.push(
    helloWorldDisposable,
    // onTypeDisposable,
    changeApiKeyDisposable,
    keyBindingDisposable
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
