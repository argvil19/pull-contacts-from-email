const Imap = require('imap')
const fs = require('fs')
const mailInfo = {
    user: 'YOUR@EMAIL.HERE',
    password: 'YOURPASSHERE',
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    ssl: true
} // config for gmail
const formatEmail = (input) => {
    const regex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g
    const matched = input.match(regex)
    return matched ? matched[0] : null
}
const saveFile = (input) => {
    fs.writeFile('./output.txt', input, 'utf8', function () {
        console.log('Output saved to output.txt')
        process.exit()
    })
}

const Mail = new Imap(mailInfo)

Mail.once('ready', function () {
    Mail.openBox('INBOX', true, function (err, box) {
        if (err) {
            throw new Error('Error: ', err)
        }
        
        console.log('Fetching mails. It might take a while...')
        
        const q = Mail.seq.fetch('1:9999999', {
              bodies: 'HEADER.FIELDS (FROM)',
              struct: true
        })
        
        const msgArr = []
        
        q.on('message', function (msg, seqno) {
            msg.on('body', function (stream) {
                stream.on('data', function (chunk) {
                    msgArr.push(formatEmail(chunk.toString('utf8')))
                })
            })
        })
        
        q.on('end', function() {
            const mailArrFiltered = []
            msgArr.forEach((i) => {
                if (mailArrFiltered.indexOf(i) === -1) {
                    mailArrFiltered.push(i)
                }
            })
            
            return saveFile(mailArrFiltered.join('\n'))
        })
        
        q.once('error', function(err) {
            throw new Error('Error: ', err)
        })
    })
})

Mail.once('error', function(err) {
    throw new Error('Error: ', err)
})

Mail.connect()
