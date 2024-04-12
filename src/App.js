import React, { useState, useEffect } from 'react';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import './App.css';

function App() {
  // Initialize the events state with an example event
  const [events, setEvents] = useState([
    { title: 'Meeting', start: new Date() }
  ]);

  useEffect(() => {
    function receiveMessage(event) {
      if (event.origin !== "https://enterprise-force-7539--partialsb.sandbox.lightning.force.com") {
        console.error('Unauthorized attempt to communicate from', event.origin);
        return;
      }
      // Update the events state with the new events data received
      const newEvents = event.data.map(insp => {
        return {
          title: insp.Name,
          start: new Date(insp.Scheduled_Date_Time__c),
          end: new Date(insp.Confirmed_Date_Time__c),
          extendedProps: {
            inspectorName: insp.inspectorName,
            facilityName: insp.facilityName,
            facilityAddress: insp.facilityAddress
          }
        };
      });
      setEvents(newEvents);
    }

    window.addEventListener("message", receiveMessage, false);

    return () => window.removeEventListener("message", receiveMessage);
  }, []);

  return (
    <div className="App">
      <div style={{padding:"3% 5%"}}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          headerToolbar={{
            start: "today prev,next",
            center: "title",
            end: "dayGridMonth,timeGridWeek,timeGridDay"
          }}
          eventContent={renderEventContent} // Optionally render custom event content
          height="90vh"
        />
      </div>
    </div>
  );
}

// Optional: Customize how events are displayed
function renderEventContent(eventInfo) {
  return (
    <>
      <b>{eventInfo.timeText}</b>
      <i>{eventInfo.event.title}</i>
      <p>{eventInfo.event.extendedProps.inspectorName}</p>
      <p>{eventInfo.event.extendedProps.facilityName} - {eventInfo.event.extendedProps.facilityAddress}</p>
    </>
  );
}

export default App;
