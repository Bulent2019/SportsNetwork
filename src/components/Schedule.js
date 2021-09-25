import React from 'react';
import '../App.css';
import Scheduler, { Resource } from 'devextreme-react/scheduler';
import { formatDate } from 'devextreme/localization';


export default function Schedule() {

    const groups = ['Id'];

    const member = [
        {
            id: 2,
            text: "Bülent",
            color: "blue",
        },
        {
            id: 1,
            text: "Sandra",
            color: "orange",
        },
        {
            id: 3,
            text: "Paul",
            color: "red",
        },
        {
            id: 4,
            text: "Sue",
            color: "yellow",
        },
    ]

    const data = [
        {
            Id: 1, locationId: 1, Firstname: "Me", Lastname: "you",
            text: "Self_defence Beginner",
            startDate: new Date('09/26/2021 08:00:00'),
            endDate: new Date('09/26/2021 13:00:00'),
        },
        {
            Id: 2, locationId: 1,
            text: "Yoga Seminar",
            startDate: new Date('09/26/2021 08:00:00'),
            endDate: new Date('09/26/2021 17:00:00'),
            description: "15 €/person, students 10 €/person"
        },
        {
            Id: 3, locationId: 2,
            text: "After work beer",
            startDate: new Date('09/24/2021 17:00:00'),
            endDate: new Date('09/24/2021 23:00:00'),
        },
        {
            Id: 2, locationId: 2,
            text: "After work beer",
            startDate: new Date('09/24/2021 17:00:00'),
            endDate: new Date('09/24/2021 20:00:00'),
        },
        {
            Id: 1, locationId: 2,
            text: "After work beer",
            startDate: new Date('09/24/2021 17:00:00'),
            endDate: new Date('09/24/2021 22:00:00'),
        },
        {
            Id: 1, locationId: 3,
            text: "Mushroom picking",
            startDate: new Date('09/25/2021 11:00:00'),
            endDate: new Date('09/25/2021 14:30:00'),
            description: "8 people max."
        },
        {
            Id: 2,
            text: "Launch",
            startDate: new Date('09/26/2021 13:30:00'),
            endDate: new Date('09/26/2021 14:30:00'),
        },
        {
            Id: 3, locationId: 4,
            text: "Business meeting",
            startDate: new Date('09/27/2021 14:00:00'),
            endDate: new Date('09/27/2021 17:00:00'),
        },
    ]

    const location = [
        {
            text: 'City Sports Hall',
            id: 1,
        },
        {
            text: 'Australian Pub',
            id: 2,
        },
        {
            text: 'Espoo Forest',
            id: 3,
        },
        {
            text: 'Ravintola Tervetuloa',
            id: 4,
        }
    ]


    const Meeting = model => {
        const {appointmentData} = model.data

        return (
            <div>
                <div>{appointmentData.text}</div>
                <div>
                    {formatDate(appointmentData.startDate, 'shortTime')}
                    {' - '}
                    {formatDate(appointmentData.endDate, 'shortTime')}
                </div>
            </div>
        )
    }


  return (
    <div>

        
        <h1 className="scheduleGraph" style={{textAlign:'left'}}>Scheduler</h1>
        <Scheduler
            className="scheduleGraph"
            dataSource={data}
            views={['day', 'week', 'month']}
            maxAppointmentsPerCell={'unlimited'} 
            groups={groups}
            defaultCurrentDate={Date.now()}
            defaultCurrentView="week"
            height={600}
            width={900}
            firstDayOfWeek={1}
            startDayHour={7}
            endDateHour={23}
            showAllDayPanel={true}
            cellDuration={30}
            editing={{allowAdding: true, allowUpdating: true}}
            appointmentComponent={Meeting}
        >  
            <Resource 
                fieldExpr="Id" 
                dataSource={member}
                label="Organizer"
            />
            <Resource 
                fieldExpr="location" 
                dataSource={location}
            />
        </Scheduler>

        <div style={{marginTop: '20px'}} className='App'>
        </div>
    </div>
  );
}

