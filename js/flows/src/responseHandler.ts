export function parseJsonResponse(text: string, modelType?: string): any {
    let jsonResponse: any;
    let customResponse: { answer: string, safetyIssue: boolean } = { answer: "", safetyIssue: false };

    console.log("PRINTING: " + text)
    if (modelType === 'ollama' || process.env.MODEL_TYPE === 'ollama') {
        const indexJson = text.indexOf("```json");
        if (indexJson !== -1) {
            const resp = text.replace("```json", "").replace("```", "").trim();
            try {
                return JSON.parse(resp);
            } catch (error) {
                //console.error("Error parsing JSON from ollama response (transform):", error, "response text:", resp);
                customResponse.answer = resp;
                return customResponse;
            }
        }
        else {
            try {
                return JSON.parse(cleanStringForJson(text));
            } catch (error) {
                //console.error("Error parsing JSON from ollama response (no transform):", error, "response text:", text);
                customResponse.answer = text;
                return customResponse;
            }
        }
    } else {
        try {
            jsonResponse = JSON.parse(cleanStringForJson(text));
        } catch (error) {
            console.error("Error parsing JSON from standard response:", error, "response text:", text);
            return null;
        }
    }

    return jsonResponse;
}

function cleanStringForJson(input: string): string {
    // Replace problematic characters and fix semi-colons
    let cleanedString = input
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
        .replace(/\\"/g, '"') // unescape double quotes
        .replace(/&quot;/g, '"') // replace &quot; with "
        .replace(/;/g, '.'); // Replace semi-colons with full stops

    return cleanedString;
}