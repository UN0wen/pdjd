import { gql } from '@apollo/client'

export const fetchUserHostRequests = gql`
  query FetchUserHostRequests($id: Int!) {
    userHostRequests(id: $id) {
      id
      event {
        id
        title
        description
        startTime
        endTime
        location {
          building {
            name
          }
          room
        }
        guestCount
        maxGuestCount
      }
      guest {
        name
      }
    }
  }
`

export const fetchUserGuestRequests = gql`
  query FetchUserGuestRequests($id: Int!) {
    userGuestRequests(id: $id) {
      id
      event {
        id
        title
        description
        startTime
        endTime
        location {
          building {
            name
          }
          room
        }
        guestCount
        maxGuestCount
      }
      host {
        name
      }
      requestStatus
    }
  }
`
