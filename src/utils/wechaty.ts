import { WechatyBuilder } from 'wechaty'
import { getLogger } from 'src/utils'
import { scanHandle, loginHandle, messageHandle } from './wechaty_handle'
const logger = getLogger('wechaty')

export class WechatyClient {
    constructor() {
    }

    init() {
        const wechaty = WechatyBuilder.build()
        wechaty
            .on('scan', scanHandle)
            .on('login', loginHandle)
            .on('message', messageHandle)
            // .on('logout', logoutHandle)
            // .on('friendship', friendHandle)
            // .on('room-join', roomjoinHandle)
            // .on('room-topic', roomTopicHandle)
            // .on('room-leave', roomLeaveHandle)
            // .on('room-invite', roomInviteHandle)
        
        wechaty
            .start()
            .then(() => {
              logger.info('wechaty launch successfully, scan the QR code')
            })
            .catch(async function(e) {
              logger.error({ e }, 'wechaty lanch fails')
              await wechaty.stop()
              process.exit(1)
            });
    }

    static create() {
        return new WechatyClient()
    }
}
