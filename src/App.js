import React, { useState, useEffect } from 'react';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import './App.css';

function App() {
  const [events, setEvents] = useState([
    { title: 'Initial Meeting', start: new Date() }
  ]);

  useEffect(() => {
    function receiveMessage(event) {
      console.log('Received message from:', event.origin);
      // Update the expected origin as per your Salesforce deployment
      if (event.origin !== "https://enterprise-force-7539--partialsb.sandbox.lightning.force.com") {
        console.error('Unauthorized attempt to communicate from', event.origin);
        return;
      }

      if (!event.data || !Array.isArray(event.data)) {
        console.error('Invalid data received', event.data);
        return;
      }

      console.log("Data received:", event.data);
      // Ensure the data structure is as expected
      const newEvents = event.data.map(insp => {
        return {
          title: insp.Name || 'Unnamed Event',
          start: new Date(insp.Scheduled_Date_Time__c || new Date()),
          end: new Date(insp.Confirmed_Date_Time__c || new Date()),
          extendedProps: {
            inspectorName: insp.inspectorName || 'No Inspector',
            facilityName: insp.facilityName || 'No Facility',
            facilityAddress: insp.facilityAddress || 'No Address'
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

// Customized display of event content
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
