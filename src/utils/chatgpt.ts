import { HttpClient } from './http_base'
import * as fs from 'fs';
const chatpgtClient = HttpClient("https://api.openai.com")
const jsonPath = 'data.json'

export class ChatGPT {
    constructor() {
    }

    async askAi(body) {
        const res = await chatpgtClient.post('/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            ...body,
        }, {
            headers: { "Content-Type": "application/json", Authorization: `Bearer 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`, connection: "" },
        })

        const msg = res?.choices[0]?.message?.content.trim() || ''
        appendJson(msg)
        return msg
    }
}

function appendJson(msg){
    // 读取JSON文件内容
    const data = fs.readFileSync(jsonPath, 'utf-8');
    // 解析JSON
    const jsonData = JSON.parse(data);
    // 添加新的对象到JSON数组中
    jsonData.push({"role": "assistant", "content": msg});
    // 将更新后的JSON写回文件
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
}