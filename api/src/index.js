import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { KJUR } from 'jsrsasign'
import { toStringArray } from './utils.js'
import {
  inNumberArray,
  isBetween,
  isLengthLessThan,
  isRequired,
  matchesStringArray,
  validateRequest
} from './validations.js'
import { nanoid } from 'nanoid'

dotenv.config()
const app = express()
const port = process.env.PORT || 4000

app.use(express.json(), cors())
app.options('*', cors())

// Validations should match Zoom Video SDK's documentation:
// https://developers.zoom.us/docs/video-sdk/auth/#payload
const validator = {
  roleType: [isRequired, inNumberArray([0, 1])],
  sessionName: [isRequired, isLengthLessThan(200)],
  expirationSeconds: isBetween(1800, 172800),
  userIdentity: isLengthLessThan(35),
  sessionKey: isLengthLessThan(36),
  geoRegions: matchesStringArray(['AU', 'BR', 'CA', 'CN', 'DE', 'HK', 'IN', 'JP', 'MX', 'NL', 'SG', 'US', 'BG']),
  cloudRecordingOption: inNumberArray([0, 1]),
  cloudRecordingElection: inNumberArray([0, 1]),
  audioCompatibleMode: inNumberArray([0, 1])
}

const coerceRequestBody = (body) => ({
  ...body,
  ...['roleType', 'expirationSeconds', 'cloudRecordingOption', 'cloudRecordingElection', 'audioCompatibleMode'].reduce(
    (acc, cur) => ({ ...acc, [cur]: typeof body[cur] === 'string' ? parseInt(body[cur]) : body[cur] }),
    {}
  )
})

const joinGeoRegions = (geoRegions) => toStringArray(geoRegions)?.join(',')

app.post('/generateToken', (req, res) => {
  const requestBody = coerceRequestBody(req.body)
  
  if(!requestBody.sessionKey && requestBody.roleType === 1) {
    requestBody.sessionKey = nanoid();
  }
  console.log("req body", requestBody);
  const validationErrors = validateRequest(requestBody, validator)

  if (validationErrors.length > 0) {
    // return res.status(400).json({ errors: validationErrors })
  }

  const {
    roleType,
    sessionName,
    expirationSeconds,
    // userIdentity,
    password = '',
    sessionKey,
  } = requestBody

  const iat = Math.floor(Date.now() / 1000)
  const exp = expirationSeconds ? iat + expirationSeconds : iat + 60 * 60 * 2
  const oHeader = { alg: 'HS256', typ: 'JWT' }

  let oPayload = {
    app_key: process.env.ZOOM_VIDEO_SDK_KEY,
    role_type: roleType,
    tpc: sessionName,
    version: 1,
    iat,
    exp,
    password,
    // user_identity: userIdentity,
    // geo_regions: joinGeoRegions(geoRegions),
    // cloud_recording_option: cloudRecordingOption,
    // cloud_recording_election: cloudRecordingElection,
    // audio_compatible_mode: audioCompatibleMode
  }

  if(sessionKey) {
    // oPayload.session_key = sessionKey;
  }
  console.log("payload", oPayload)
  const sHeader = JSON.stringify(oHeader)
  const sPayload = JSON.stringify(oPayload)
  const sdkJWT = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, process.env.ZOOM_VIDEO_SDK_SECRET)
  return res.json({ signature: sdkJWT })
})

app.listen(port, () => console.log(`Zoom Video SDK Auth Endpoint Sample Node.js, listening on port ${port}!`))
