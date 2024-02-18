import * as qrterminal from 'qrcode-terminal'
import { getLogger } from 'src/utils'
import { ChatGPT } from './chatgpt'
import * as fs from 'fs';
const chatgptClient = new ChatGPT()
const logger = getLogger('wechaty')

const scanHandle = (qrcode) => {
    qrterminal.generate(qrcode, {small: true})
    const qrUrl = `https://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`
    logger.info({ qrUrl }, 'scan qrimageurl')
}

const loginHandle = (user) => {
    logger.info({ user }, 'Log in')
}

async function replyRoomMessage(that,room, msg) {
    try{
        const contact = msg.talker();
        const contactName = contact.name()
        const roomName = await room.topic()
        if(process.env.GROUPS && !~process.env.GROUPS.indexOf(roomName)) return
        const type = msg.type();
        const mentionSelf = await msg.mentionSelf()
        // let contactAvatar = await contact.avatar();
        switch (type) {
          case that.Message.Type.Text:
            const content = msg.text();
            logger.info(`Group name: ${roomName} Sender name: ${contactName} Content: ${content}`)
            if(mentionSelf){
                const answer = await chatgptClient.askAi({
                    messages: [
                        {"role": "user", "content": `${content}`},
                    ]
                })
                room.say(`@${contactName} ${answer}`)
            }
            break;
          case that.Message.Type.Emoticon:
              logger.info(`群名: ${roomName} Sender: ${contactName} send an emoji`)
            break;
          case that.Message.Type.Image:
            logger.info(`群名: ${roomName} Sender: ${contactName} send a pic`)
            break;
          case that.Message.Type.Url:
            logger.info(`群名: ${roomName} Sender: ${contactName} send a link`)
            break;
          case that.Message.Type.Video:
            logger.info(`群名: ${roomName} Sender: ${contactName} send a video`)
            break;
          case that.Message.Type.Audio:
            logger.info(`群名: ${roomName} Sender: ${contactName} send an audio`)
            break;
          default:
            break;
        }
    } catch (error) {
        logger.error('Listener Error',error)
    }
}

async function replyFriendMessage(that, msg) {
    try {
        const type = msg.type();
        const contact = msg.talker();
        const contactName = contact.name()
        const isOfficial = contact.type() === that.Contact.Type.Official
        switch (type) {
        case that.Message.Type.Text:
            const content = msg.text();
            if(!isOfficial){
                logger.info(`Sender${contactName}:${content}`)
                const jsonFilePath = 'data-'+contactName+'.json';
                if(content.trim()){
                    fs.access(jsonFilePath, fs.constants.F_OK, (err) => {
                        if (err) {
                            // 文件不存在，创建新文件并写入 JSON 数据
                            fs.writeFile(jsonFilePath, JSON.stringify([], null, 2), (err) => {
                                if (err) {
                                    console.error('Failed to create JSON file:', err);
                                }
                            });
                        }
                    });
                    appendJson(content, jsonFilePath)
                    const externalData = fs.readFileSync(jsonFilePath, 'utf-8');
                    const answer = await chatgptClient.askAi({
                        messages: JSON.parse(externalData)
                    })
                    contact.say(answer)
                }
            }else{
                logger.info('Multi Platform Error')
            }
            break;
        case that.Message.Type.Emoticon:
            logger.info(`Sender${contactName}:Send an emoji`)
            break;
        case that.Message.Type.Image:
            logger.info(`Sender${contactName}:Send a pic`)
            break;
        case that.Message.Type.Url:
            logger.info(`Sender${contactName}:Send a link`)
            break;
        case that.Message.Type.Video:
            logger.info(`Sender${contactName}:Send a video`)
            break;
        case that.Message.Type.Audio:
            logger.info(`Sender${contactName}:Send an audio`)
            break;
        default:
            break;
        }
    } catch (error) {
        logger.error('Listener error',error)
    }
}




function messageHandle (msg) {
    const room = msg.room(); 
    const msgSelf = msg.self(); 
    if(msgSelf) return

    if (msg.text()=="清除"){
        const jsonPath = 'data-'+msg.talker().name()+'.json';
        fs.writeFileSync(jsonPath, JSON.stringify([], null, 2));
    } else {
        if(!room) {
            replyFriendMessage(this, msg)
        }

        if (room) {
            replyRoomMessage(this, room, msg)
        }
    }
}

function appendJson(msg, jsonFilePath){
    // 读取JSON文件内容
    const data = fs.readFileSync(jsonFilePath, 'utf-8');
    // 解析JSON
    const jsonData = JSON.parse(data);
    // 添加新的对象到JSON数组中
    jsonData.push({"role": "user", "content": msg});
    // 将更新后的JSON写回文件
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));
}

export {
    scanHandle,
    loginHandle,
    messageHandle
}