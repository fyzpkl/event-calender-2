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
      if (event.origin !== "https://enterprise-force-7539--partialsb.sandbox.lightning.force.com") {
          console.error('Unauthorized attempt to communicate from', event.origin);
          return;
      }
  
      if (!event.data || !event.data.inspectionData) {
          console.error('Invalid data received', event.data);
          return;
      }
  
      const inspections = Array.isArray(event.data.inspectionData) ? event.data.inspectionData : [event.data.inspectionData];
      const newEvents = inspections.map(insp => {
          return {
              title: insp.Name || 'Unnamed Event',
              start: new Date(insp.Scheduled_Date_Time__c),  // Ensure this is parsed correctly
              end: new Date(insp.Confirmed_Date_Time__c),    // Ensure this is parsed correctly
              extendedProps: {
                  inspectorName: insp.inspectorName || 'No Inspector',
                  facilityName: insp.facilityName || 'No Facility',
                  facilityAddress: insp.facilityAddress ? `${insp.facilityAddress.country}, ${insp.facilityAddress.countryCode}` : 'No Address'
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
          eventContent={renderEventContent} // Custom event content for displaying additional details
          height="90vh"
      />

      </div>
    </div>
  );
}

// Customized display of event content
// Customized display of event content
function renderEventContent(eventInfo) {

  return (
    <>
        <b>{eventInfo.timeText}</b>
        <i>{eventInfo.event.title}</i>
        <div>{eventInfo.event.extendedProps.inspectorName}</div>
        <div>{eventInfo.event.extendedProps.facilityName} - {eventInfo.event.extendedProps.facilityAddress}</div>
    </>
);
}


export default App;
