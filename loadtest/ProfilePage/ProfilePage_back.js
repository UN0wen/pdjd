import http from 'k6/http'
import { sleep } from 'k6'

export const options = {
  scenarios: {
    standard: {
      executor: 'ramping-arrival-rate',
      startRate: 50,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 1000,
      stages: [{ target: 50, duration: '30s' }],
    },
  },
}

// setup code
export function setup() {
  // Login and profile
  var payload = JSON.stringify({
    email: 'jbruin@ucla.edu',
    password: 'password',
  })
  var params = {
    headers: {
      'Content-Type': 'application/json',
    },
  }
  http.post('http://localhost:3000/auth/login', payload, params)
  var jar = http.cookieJar()
  let cookies = jar.cookiesForURL('http://localhost:3000')
  return { authToken: cookies.authToken[0] }
}

export default function (data) {
  // Create event
  const payload = JSON.stringify({
    operationName: 'FetchUserProfile',
    variables: {
      id: 1,
    },
    query:
      'query FetchUserProfile($id: Int!) {\n  userProfile(id: $id) {\n    id\n    email\n    name\n    bio\n    phoneNumber\n    hostEvents {\n      id\n      title\n      description\n      startTime\n      endTime\n      maxGuestCount\n      eventStatus\n      isStarted\n      isCompleted\n      guestCount\n      location {\n        building {\n          name\n          __typename\n        }\n        room\n        __typename\n      }\n      __typename\n    }\n    guestEvents {\n      id\n      title\n      description\n      startTime\n      endTime\n      maxGuestCount\n      eventStatus\n      isStarted\n      isCompleted\n      guestCount\n      location {\n        building {\n          name\n          __typename\n        }\n        room\n        __typename\n      }\n      host {\n        name\n        id\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n',
  })
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    cookies: {
      authToken: data.authToken,
    },
  }
  http.post('http://localhost:3000/graphql', payload, params)
}
