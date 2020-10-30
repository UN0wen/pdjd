import { useQuery } from '@apollo/client'
import { navigate, RouteComponentProps } from '@reach/router'
import { format, parseISO } from 'date-fns'
import * as React from 'react'
import Card from 'react-bootstrap/Card'
import { getApolloClient } from '../../graphql/apolloClient'
import { fetchAllActiveEvents, fetchEventRequestsGuests } from '../../graphql/fetchEvents'
import { createRequest } from '../../graphql/mutateRequests'
import {
  FetchAllActiveEvents,
  FetchEventRequestsGuests,
  FetchEventRequestsGuestsVariables
} from '../../graphql/query.gen'
import { Button } from '../../style/button'
import { H2, H3, H5 } from '../../style/header'
import { Spacer } from '../../style/spacer'
import { style } from '../../style/styled'
import { AppRouteParams, getEventPath } from '../nav/route'
import { toast } from '../toast/toast'
import { Page } from './Page'

interface HomePageProps extends RouteComponentProps, AppRouteParams {}

function RequestButton({
  eventID,
  hostID,
  parentCallback,
}: {
  eventID: number
  hostID: number
  parentCallback: (eventID: number, hostID: number) => void
}) {
  const { data } = useQuery<FetchEventRequestsGuests, FetchEventRequestsGuestsVariables>(fetchEventRequestsGuests, {
    variables: { eventID },
  })

  function handleClick() {
    parentCallback(eventID, hostID)
    setButtonActive(false)
    setRequestSent(true)
  }

  const [eventRequests, setEventRequests] = React.useState(data?.eventRequests)

  React.useEffect(() => {
    setEventRequests(data?.eventRequests)
  }, [data])

  const guestID = 1 //TODO: Update this

  const [buttonActive, setButtonActive] = React.useState(true)
  const [requestSent, setRequestSent] = React.useState(false)
  React.useEffect(() => {
    if (eventRequests)
      for (const guests of eventRequests) {
        if (guests.guest.id == guestID) {
          setButtonActive(false)
          setRequestSent(true)
          break
        }
      }
  }, [data, eventRequests])
  if (!data || !data.eventRequests) {
    return <div>Error?</div>
  }

  if (hostID == guestID) {
    return <div>You're the host of this event!</div>
  }

  return (
    <div>
      {buttonActive ? <Button onClick={handleClick}>Send Request</Button> : null}
      {requestSent ? <div>Request sent!</div> : null}
    </div>
  )
}

function ActiveEventList() {
  const { loading, data } = useQuery<FetchAllActiveEvents>(fetchAllActiveEvents)
  // const [event, setEvent] = React.useState('')

  if (loading) {
    return <div>Loading...</div>
  }
  if (!data || !data.activeEvents || data.activeEvents.length == 0) {
    return <div>No events available. Make one!</div>
  }

  function handleSubmit(eventID: number, hostID: number) {
    createRequest(getApolloClient(), {
      eventID: eventID,
      hostID: hostID,
      guestID: 1, //TODO: update this after sign in
    })
      .then(data => {
        console.log('Successful Mutation: ', data)
        toast('Request successfully sent.')
      })
      .catch(err => {
        console.log('handlesubmit ERROR : ', err)
      })
  }

  return (
    <div>
      {data.activeEvents.map((e, i) => (
        <div key={i}>
          <Card style={{ width: '50rem', backgroundColor: '#F2D9D9' }}>
            <div style={{ textAlign: 'center' }}>
              <H2>{e.title}</H2>
              <H3>{e.description}</H3>
            </div>
            <Content>
              <RContent>
                <H5>Date: {format(parseISO(e.startTime), 'MMM do yyyy')}</H5>
                <H5>
                  Time: {format(parseISO(e.startTime), 'h:mm b')} - {format(parseISO(e.endTime), 'h:mm b')}
                </H5>
                <H5>
                  Location: {e.location.building.name} {e.location.room}
                </H5>
              </RContent>
              <LContent>
                <H5>
                  # of People: {e.guestCount}/{e.maxGuestCount} confirmed
                </H5>
                <H5>Contact: {e.host.name}</H5>
                <Content>
                  <RequestButton eventID={e.id} hostID={e.host.id} parentCallback={handleSubmit} />
                  <Button
                    style={{ margin: 5 }}
                    onClick={() => {
                      void navigate(getEventPath(e.id))
                    }}
                  >
                    Check Event Details
                  </Button>
                </Content>
              </LContent>
            </Content>
          </Card>
          <Spacer $h4 />
        </div>
      ))}
      <br />
    </div>
  )
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function HomePage(props: HomePageProps) {
  // const [startTime, setStartTime] = React.useState("");
  // const [endTime, setEndTime] = React.useState("");
  // const [email, setEmail] = React.useState("");
  // const [location, setLocation] = React.useState("");
  // const [numPeople, setNumPeople] = React.useState({numPeople:0});

  return (
    <Page>
      <ActiveEventList />
    </Page>
  )
}

// const Hero = style("div", "mb4 w-100 ba b--mid-gray br2 pa3 tc", {
//   borderLeftColor: Colors.lemon + "!important",
//   borderRightColor: Colors.lemon + "!important",
//   borderLeftWidth: "4px",
//   borderRightWidth: "4px",
// });

const Content = style('div', 'flex-l')

const LContent = style('div', 'flex-grow-0 w-60-l mr4-l')

const RContent = style('div', 'flex-grow-0  w-60-l')

// const Section = style(
//   "div",
//   "mb4 mid-gray ba b--mid-gray br2 pa3",
//   (p: { $color?: ColorName }) => ({
//     borderLeftColor: Colors[p.$color || "lemon"] + "!important",
//     borderLeftWidth: "3px",
//   })
// );

// const TD = style('td', 'pa1', p => ({
//   color: p.$theme.textColor(),
// }))
