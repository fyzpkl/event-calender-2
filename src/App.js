import React, { useState, useEffect } from 'react';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Modal from 'react-modal';  
import moment from 'moment-timezone';
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
  
    const newEvents = (Array.isArray(event.data.inspectionData) ? event.data.inspectionData : [event.data.inspectionData])
      .map(insp => {
        const startDate = moment(insp.Scheduled_Date_Time__c).toDate();
        const endDate = moment(insp.Confirmed_Date_Time__c).toDate();
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
  
    setEvents(prevEvents => [...prevEvents, ...newEvents]);
  }

  function handleEventClick(clickInfo) {
    setSelectedEvent(clickInfo.event);
    setModalIsOpen(true);
  }

  function closeModal() {
    setModalIsOpen(false);
  }

  const customStyles = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000
    },
    content: {
      position: 'absolute',
      top: '10%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, 0)',
      width: '80%',
      maxHeight: '80vh',
      overflow: 'auto',
      zIndex: 1001
    }
  };

  function renderEventContent(eventInfo) {
    console.log("Event info:", eventInfo); // Logs the event info to see what data is available
    return (
      <div style={{ padding: '5px', backgroundColor: '#fff', color: '#000' }}> 
        <strong>{eventInfo.timeText}</strong>
        <div>{eventInfo.event.title}</div>
      </div>
    );
  }
  return (
    <div className="App">
      <div style={{ padding: "3% 5%" }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          headerToolbar={{
            start: "today prev,next",
            center: "title",
            end: "dayGridMonth,timeGridWeek,timeGridDay"
          }}
          
          height="90vh"
        />
        {selectedEvent && (
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Event Details"
            ariaHideApp={false}
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

export default App;
