
const express = require('express')
const app = express()
const AWS = require('aws-sdk')
const { v4: uuid } = require('uuid')
const cors = require('cors')
const region = 'us-east-1'

const chime = new AWS.Chime({ region })
chime.endpoint = new AWS.Endpoint(
    'https://service.chime.aws.amazon.com/console'
)

app.get('/meeting', cors(), async (req, res) => {
    const response = {}
    try {
        response.meetingResponse = await chime
            .createMeeting({
                ClientRequestToken: uuid(),
                MediaRegion: region,
            })
            .promise()
    response.attendee = await chime
        .createAttendee({
            MeetingId: response.meetingResponse.Meeting.MeetingId,
            ExternalUserId: uuid(),
        })
        .promise()

    } catch (err) {
        res.send(err)
    }

    res.send(response)
})

app.listen(3001, () => console.log(`Video calling server listening at http://localhost:3001`))
