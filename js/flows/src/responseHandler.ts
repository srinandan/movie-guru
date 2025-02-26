export function parseJsonResponse(text: string, modelType?: string): any {
    let jsonResponse: any;
    let customResponse: { answer: string, safetyIssue: boolean } = { answer: "", safetyIssue: false };

    console.log(getFormattedTimestamp() + text)
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
        .replace(/\\"/g, '') // remove double quotes
        .replace(/&quot;/g, '.') // remove &quot; with "
        .replace(/'/g, ''); // remove single quotes

    return cleanedString;
}

function getFormattedTimestamp(): string {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    const milliseconds = String(now.getUTCMilliseconds()).padStart(3, '0');

    return `time=${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
}