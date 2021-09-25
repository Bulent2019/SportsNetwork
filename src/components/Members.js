import React from "react";
import '../App.css';

import Form, {
    SimpleItem,
    GroupItem,
    TabbedItem,
    TabPanelOptions,
    Tab
  } from 'devextreme-react/form';
import 'devextreme-react/text-area';


export default function Members() {

  const member = {
    'ID': 1,
    'FirstName': 'Bülent',
    'LastName': 'Arslan',
    'BirthDate': '1980/06/12',
    'Notes': 'Always ready for fun!',
    'City': 'Helsinki',
    'ZipCode': '00410',
    'Email': 'buelent_@hotmail.com',
    'Phone': '+358-449847217'
  };
  
  const car = [
    'Yes',
    'No',
  ];
  
  const interests = [
    'Yoga',
    'Soccer',
    'Chess',
    'Talking',
    'Photography',
    'Bouldering',
    'Coding',
    'Walk in the nature',
  ];


  const avatarRender = () => {
    return (
      <div className="form-avatar"></div>
    );
  }

    let birthDateOptions = { width: '100%' };
    let carOptions = {
      items: car,
      value: ''
    };
    let interestsOptions = {
      items: interests
    };
    let notesOptions = { height: 140 };

    
    return (
      <div>
        <h1>Member</h1>

        <Form formData={member}>
          <GroupItem cssClass="first-group" colCount={4}>
            <SimpleItem render={avatarRender}>
            </SimpleItem>
            <GroupItem colSpan={3}>
              <SimpleItem dataField="FirstName" />
              <SimpleItem dataField="LastName" />
              <SimpleItem
                dataField="BirthDate"
                editorType="dxDateBox"
                editorOptions={birthDateOptions}
              />
            </GroupItem>
          </GroupItem>

          <GroupItem cssClass="second-group" colCount={2}>
            <GroupItem>
              <SimpleItem dataField="Address" />
              <SimpleItem dataField="City" />
              <SimpleItem dataField="Car"
                editorType="dxSelectBox"
                editorOptions={carOptions} />
            </GroupItem>

            <GroupItem>
              <SimpleItem
                dataField="Interests"
                editorType="dxSelectBox"
                editorOptions={interestsOptions} />
              <SimpleItem dataField="ZipCode" />
            </GroupItem>
            <GroupItem>
              <TabbedItem>
                <TabPanelOptions deferRendering={false}/>
                <Tab title="Phone">
                  <SimpleItem dataField="Phone"/>
                </Tab>
                <Tab title="Email">
                  <SimpleItem dataField="Email"/>
                </Tab>
              </TabbedItem>
              
            </GroupItem>

            <SimpleItem
              colSpan={2}
              dataField="Notes"
              editorType="dxTextArea"
              editorOptions={notesOptions}
            />
          </GroupItem>
        </Form>
      </div>
    );
}