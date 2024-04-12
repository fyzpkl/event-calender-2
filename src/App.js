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
      if (event.origin !== "https://enterprise-force-7539--partialsb.sandbox.lightning.force.com") {
          console.error('Unauthorized attempt to communicate from', event.origin);
          return;
      }
  
      if (!event.data || !event.data.inspectionData) {
          console.error('Invalid data received', event.data);
          return;
      }
  
      const inspections = Array.isArray(event.data.inspectionData) ? event.data.inspectionData : [event.data.inspectionData];
      console.log("Data received:", inspections);
      const newEvents = inspections.map(insp => {
          return {
              title: insp.Name || 'Unnamed Event',
              start: new Date(insp.Scheduled_Date_Time__c || new Date()),
              end: new Date(insp.Confirmed_Date_Time__c || new Date()),
              extendedProps: {
                  inspectorName: insp.inspectorName || 'No Inspector',
                  facilityName: insp.facilityName || 'No Facility',
                  facilityAddress: insp.facilityAddress || { country: 'Unknown', countryCode: '' }  // Ensure this is always an object
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
// Customized display of event content
function renderEventContent(eventInfo) {
  const facilityAddress = eventInfo.event.extendedProps.facilityAddress;
  // Format the facilityAddress object into a string for display
  const addressString = facilityAddress ? `${facilityAddress.country}, ${facilityAddress.countryCode}` : 'No Address Provided';

  return (
      <>
          <b>{eventInfo.timeText}</b>
          <i>{eventInfo.event.title}</i>
          <p>{eventInfo.event.extendedProps.inspectorName || 'No Inspector'}</p>
          <p>{eventInfo.event.extendedProps.facilityName} - {addressString}</p>
      </>
  );
}


export default App;
