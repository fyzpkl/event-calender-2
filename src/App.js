import React, { useState, useEffect } from 'react';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Modal from 'react-modal';  
import moment from 'moment-timezone'; // Import moment-timezone
import './App.css';

function App() {
  const [events, setEvents] = useState([{ title: 'Initial Meeting', start: new Date() }]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    window.addEventListener("message", receiveMessage);
    return () => window.removeEventListener("message", receiveMessage);
  }, []);

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
      const startDate = moment(insp.Scheduled_Date_Time__c).toDate(); 
      const endDate = moment(insp.Confirmed_Date_Time__c).toDate();
    
      console.log('Start Date:', startDate);
      console.log('End Date:', endDate);
    
      return {
        title: insp.Name || 'Unnamed Event',
        start: startDate,
        end: endDate,
        extendedProps: {
          inspectorName: insp.inspectorName || 'No Inspector',
          facilityName: insp.facilityName || 'No Facility',
          facilityAddress: insp.facilityAddress ? `${insp.facilityAddress.country}, ${insp.facilityAddress.countryCode}` : 'No Address'
        }
      };
    });
    
    console.log('New Events:', newEvents); // Log the newEvents array
    
    setEvents(newEvents);
  }

  function handleEventClick(clickInfo) {
    setSelectedEvent(clickInfo.event);
    setModalIsOpen(true);
  }

  function closeModal() {
    setModalIsOpen(false);
  }
  
  const customStyles = {
    content: {
      top: '10%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, 0)',
      width: '80%', // Set a max width
      maxHeight: '80vh', // Ensure the modal does not go out of view vertically
      overflow: 'auto'
    }
  };

  return (
    <div className="App">
      <div style={{ padding: "3% 5%" }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={handleEventClick}
          headerToolbar={{
            start: "today prev,next",
            center: "title",
            end: "dayGridMonth,timeGridWeek,timeGridDay"
          }}
          eventContent={renderEventContent}
          height="90vh"
        />
        {selectedEvent && (
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            style={customStyles}  // Using customStyles for better modal presentation
            contentLabel="Event Details"
          >
            <h2>{selectedEvent.title}</h2>
            <div>Date: {selectedEvent.start.toDateString()}</div>
            <div>Inspector: {selectedEvent.extendedProps.inspectorName}</div>
            <div>Facility: {selectedEvent.extendedProps.facilityName}</div>
            <div>Address: {selectedEvent.extendedProps.facilityAddress}</div>
            <button onClick={closeModal} style={{ marginTop: '20px' }}>Close</button>
          </Modal>
        )}
      </div>
    </div>
  );
}

function renderEventContent(eventInfo) {
  return (
    <>
      <b>{eventInfo.timeText}</b>
      <i>{eventInfo.event.title}</i>
    </>
  );
}

export default App;
