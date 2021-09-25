import { EventModel, Model, Combo, SchedulerPro, DateHelper, StringHelper, Panel, GlobalEvents, DomHelper, Splitter, Toast } from '../../build/schedulerpro.module.js?453246';

class Task extends EventModel {
    static get fields() {
        return [
            { name : 'address', defaultValue : {} },
            // in this demo, default duration for tasks will be 1 hour (instead of days)
            { name : 'duration', defaultValue : 1 },
            { name : 'durationUnit', defaultValue : 'h' }
        ];
    }

    get shortAddress() {
        /* eslint-disable */
        return (this.address?.display_name || '').split(',')[0];
    }
}


// The data model for a task address
class Address extends Model {
    static get fields() {
        return [
            'display_name',
            'lat',
            'lon'
        ];
    }
}


// A custom remote search field, querying OpenStreetMap for addresses.
class AddressSearchField extends Combo {
    // Factoryable type name
    static get type() {
        return 'addresssearchfield';
    }

    static get $name() {
        return 'AddressSearchField';
    }

    static get configurable() {
        return {
            clearable     : true,
            displayField  : 'display_name',
            // Setting the value field to null indicates we want the Combo to get/set address *records* as opposed to the
            // id of an address record.
            valueField    : null,
            filterOnEnter : true,
            store         : {
                modelClass    : Address,
                readUrl       : 'https://nominatim.openstreetmap.org/search/',
                restfulFilter : true,
                params        : {
                    format : 'json'
                },
                fetchOptions : {
                    // Please see MDN for fetch options: https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch
                    credentials : 'omit'
                }
            },
            // Addresses can be long
            pickerWidth    : 450,
            validateFilter : false,
            listCls        : 'address-results',
            // Custom list item template to show a map icon with lat + lon
            listItemTpl    : address => `<i class="b-fa b-fa-map-marker-alt"></i>
                <div class="address-container">
                    <span class="address-name">${address.display_name}</span>
                    <span class="lat-long">${address.lat}°, ${address.lon}°</span>
                </div>
            `
        };
    }
};

AddressSearchField.initClass();


class Schedule extends SchedulerPro {
    // Factoryable type name
    static get type() {
        return 'schedule';
    }

    static get $name() {
        return 'Schedule';
    }

    static get defaultConfig() {
        return {
            features : {
                stripe   : true,
                taskEdit : {
                    items : {
                        generalTab : {
                            items : {
                                resourcesField : {
                                    required : true
                                },
                                // For this demo we add an extra remote address search field
                                addressField : {
                                    type   : 'addresssearchfield',
                                    label  : 'Address',
                                    name   : 'address',
                                    weight : 100
                                }
                            }
                        }
                    }
                }
            },

            rowHeight  : 80,
            barMargin  : 4,
            eventColor : null,
            eventStyle : null,

            columns : [
                {
                    type           : 'resourceInfo',
                    text           : 'Name',
                    width          : 200,
                    showEventCount : false,
                    showRole       : true
                }
            ],

            // Custom view preset with header configuration
            viewPreset : 'hourAndDay',

            resourceImagePath : '../_shared/images/users/',

            tbar : [
                {
                    type : 'widget',
                    cls  : 'widget-title',
                    html : 'Schedule View',
                    flex : 1
                },
                {
                    text    : 'New event',
                    icon    : 'b-fa b-fa-plus',
                    color   : 'b-green b-raised',
                    onClick : 'up.onNewEventClick'
                },
                {
                    type     : 'datefield',
                    ref      : 'dateField',
                    width    : 190,
                    editable : false,
                    step     : 1,
                    onChange : 'up.onDateFieldChange'
                },
                {
                    type                 : 'textfield',
                    ref                  : 'filterByName',
                    placeholder          : 'Filter tasks',
                    clearable            : true,
                    keyStrokeChangeDelay : 100,
                    triggers             : {
                        filter : {
                            align : 'start',
                            cls   : 'b-fa b-fa-filter'
                        }
                    },
                    onChange : 'up.onFilterChange'
                }
            ]
        };
    }

    construct() {
        super.construct(...arguments);

        this.widgetMap.dateField.value = this.startDate;
    }

    onFilterChange({ value }) {
        value = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Replace all previous filters and set a new filter
        this.eventStore.filter({
            filters : event => new RegExp(value, 'i').test(event.name),
            replace : true
        });
    }

    onDateFieldChange({ value }) {
        this.setTimeSpan(DateHelper.add(value, 8, 'hour'), DateHelper.add(value, 20, 'hour'));
    }

    onNewEventClick() {
        const newTask = new this.eventStore.modelClass({
            startDate : this.startDate
        });

        this.editEvent(newTask);
    }

    onPrevious() {
        this.shiftPrevious();
    }

    onNext() {
        this.shiftNext();
    }

    // Custom event renderer showing the task name + location icon with a shortened address text
    eventRenderer({ eventRecord }) {
        return [
            {
                tag       : 'span',
                className : 'event-name',
                html      : StringHelper.encodeHtml(eventRecord.name)
            },
            {
                tag       : 'span',
                className : 'location',
                children  : [
                    eventRecord.shortAddress ? {
                        tag       : 'i',
                        className : 'b-fa b-fa-map-marker-alt'
                    } : null,
                    eventRecord.shortAddress || '⠀'
                ]
            }
        ];
    }
};

Schedule.initClass();

/* eslint-disable no-unused-vars */
/* global mapboxgl */

// NOTE: You must use your own Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoibWF0c2JyeW50c2UiLCJhIjoiY2tlcHdqd2lrM3hlZjJybHRpeDR0amo1cCJ9.PJc0GY_loGf0iQKlewuL0w';

// A simple class containing a MapboxGL JS map instance
class MapPanel extends Panel {
    // Factoryable type name
    static get type() {
        return 'mappanel';
    }

    // Required to store class name for IdHelper and bryntum.query in IE11
    static get $name() {
        return 'MapPanel';
    }

    static get defaultConfig() {
        return {
            monitorResize : true,
            // Some defaults of the initial map display
            zoom          : 11,
            lat           : 40.7128,
            lon           : -74.0060,
            textContent   : false,

            // Toolbar buttons
            tbar : [
                {
                    type : 'widget',
                    cls  : 'widget-title',
                    html : 'Map View',
                    flex : 1
                },
                {
                    type        : 'buttonGroup',
                    ref         : 'themeGroup',
                    toggleGroup : true,
                    items       : ['Stockholm', 'Classic-Dark'].map(name => {
                        const
                            isLight      = name.toLowerCase() === 'stockholm',
                            themeIsLight = !DomHelper.themeInfo.name.toLowerCase().match('dark');

                        return {
                            id      : name.toLowerCase(),
                            text    : isLight ? 'Light' : 'Dark',
                            pressed : isLight ? themeIsLight : !themeIsLight
                        };
                    }),
                    onAction({ source : button }) {
                        DomHelper.setTheme(button.id);
                    }
                },
                {
                    type  : 'buttongroup',
                    items : [
                        {
                            icon    : 'b-fa b-fa-plus',
                            onClick : 'up.onZoomIn'
                        },
                        {
                            icon    : 'b-fa b-fa-minus',
                            onClick : 'up.onZoomOut'
                        }
                    ]
                }
            ]
        };
    }

    onZoomIn() {
        this.map.zoomIn();
    }

    onZoomOut() {
        this.map.zoomOut();
    }

    composeBody() {
        const result = super.composeBody();

        result.listeners = {
            click    : 'onMapClick',
            delegate : '.mapboxgl-marker'
        };

        return result;
    }

    construct() {
        const me = this;

        super.construct(...arguments);

        const mapEl = me.bodyElement;

        // NOTE: You must use your own Mapbox access token
        me.map = new mapboxgl.Map({
            container : mapEl,
            style     : 'mapbox://styles/mapbox/streets-v11',
            center    : [me.lon, me.lat],
            zoom      : me.zoom
        });

        // First load the map and then setup our event listeners for store CRUD and time axis changes
        me.map.on('load', () => {
            mapEl.classList.add('maploaded');

            me.eventStore.on('change', me.onStoreChange, me);
            me.timeAxis.on('reconfigure', me.onTimeAxisReconfigure, me);

            // If data loaded before the map, trigger onStoreChange manually
            if (me.eventStore.count) {
                me.onStoreChange({ action : 'dataset', records : me.eventStore.records });
            }
        });

        // Switch to dark maps for dark theme
        GlobalEvents.on({
            theme   : 'onThemeChange',
            thisObj : me
        });
    }

    setMapStyle() {
        const
            isDark   = DomHelper.themeInfo.name.toLowerCase().includes('dark'),
            mapStyle = isDark ? 'dark-v10' : 'streets-v11';

        this.map.setStyle('mapbox://styles/mapbox/' + mapStyle);
    }

    // When data changes in the eventStore, update the map markers accordingly
    onStoreChange(event) {
        switch (event.action) {
            case 'add':
            case 'dataset':
                if (event.action === 'dataset') {
                    this.removeAllMarkers();
                }
                event.records.forEach(eventRecord => this.addEventMarker(eventRecord));
                break;

            case 'remove':
                event.records.forEach(event => this.removeEventMarker(event));
                break;

            case 'update': {
                const eventRecord = event.record;

                this.removeEventMarker(eventRecord);
                this.addEventMarker(eventRecord);

                break;
            }

            case 'filter': {
                const renderedMarkers = [];

                this.eventStore.query(rec => rec.marker, true).forEach(eventRecord => {
                    if (!event.records.includes(eventRecord)) {
                        this.removeEventMarker(eventRecord);
                    }
                    else {
                        renderedMarkers.push(eventRecord);
                    }
                });

                event.records.forEach(eventRecord => {
                    if (!renderedMarkers.includes(eventRecord)) {
                        this.addEventMarker(eventRecord);
                    }
                });

                break;
            }
        }
    }

    // Only show markers for events inside currently viewed time axis
    onTimeAxisReconfigure({ source : timeAxis }) {
        this.eventStore.forEach(eventRecord => {
            this.removeEventMarker(eventRecord);
            this.addEventMarker(eventRecord);
        });
    }

    // Puts a marker on the map, if it has lat/lon specified + the timespan intersects the time axis
    addEventMarker(eventRecord) {
        if (!eventRecord.address) return;

        const { lat, lon } = eventRecord.address;

        if (lat && lon && this.timeAxis.isTimeSpanInAxis(eventRecord)) {
            const
                color  = eventRecord.eventColor || eventRecord.resource?.eventColor || '#f0f0f0',
                marker = new mapboxgl.Marker({
                    color
                })
                    .setLngLat([lon, lat])
                    .addTo(this.map);

            marker.getElement().id = eventRecord.id;

            eventRecord.marker = marker;
            marker.eventRecord = eventRecord;
            marker.addTo(this.map);
        }
    }

    removeEventMarker(eventRecord) {
        const marker = eventRecord.marker;

        if (marker) {
            marker.popup && marker.popup.remove();
            marker.popup = null;
            marker.remove();
        }
        eventRecord.marker = null;
    }

    removeAllMarkers() {
        this.eventStore.forEach(eventRecord => this.removeEventMarker(eventRecord));
    }

    scrollMarkerIntoView(eventRecord) {
        const marker = eventRecord.marker;

        this.map.easeTo({
            center : marker.getLngLat()
        });
    }

    showTooltip(eventRecord, centerAtMarker) {
        const
            me     = this,
            marker = eventRecord.marker;

        me.popup && me.popup.remove();

        if (centerAtMarker) {
            me.scrollMarkerIntoView(eventRecord);
        }

        const popup = me.popup = marker.popup = new mapboxgl.Popup({
            offset : [0, -21]
        });

        popup.setLngLat(marker.getLngLat());
        popup.setHTML(StringHelper.xss`<span class="event-name">${eventRecord.name}</span><span class="location"><i class="b-fa b-fa-map-marker-alt"></i>${eventRecord.shortAddress}<span>`);
        popup.addTo(me.map);
    }

    onMapClick({ target }) {
        const markerEl = target.closest('.mapboxgl-marker');

        if (markerEl) {
            const eventRecord = this.eventStore.getById(markerEl.id);

            this.showTooltip(eventRecord);
            this.trigger('markerclick', { marker : eventRecord.marker, eventRecord });
        }
    }

    onResize() {
        // This widget was resized, so refresh the Mapbox map
        this.map?.resize();
    }

    onThemeChange({ theme }) {
        const buttonIndex = theme.toLowerCase().match('dark') ? 1 : 0;

        this.setMapStyle(theme);

        this.tbar.widgetMap.themeGroup.items[buttonIndex].pressed = true;
    }
};

// Register this widget type with its Factory
MapPanel.initClass();

const detectWebGL = () => {
    try {
        const canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
        const supported = Boolean(canvas.getContext('webgl'));
        canvas.remove();
        return supported;
    }
    catch (e) {
        return false;
    }
};

let mapPanel;
// This simple demo consists of two main classes, a schedule and a map. Open the 'lib' folder to see the application
// classes used.
const
    schedule = new Schedule({
        ref         : 'schedule',
        insertFirst : 'main',
        startDate   : new Date(2025, 11, 1, 8),
        endDate     : new Date(2025, 11, 1, 20),
        flex        : 5,
        // Configure the Project with a path, and the Store or Model to use for the loaded data.
        project     : {
            autoLoad   : true,
            eventStore : {
                modelClass : Task
            },
            transport : {
                load : {
                    url : 'data/data.json'
                }
            },

            // This config enables responses validation and dumping of found errors to the browser console.
            // It's meant to be used as a development stage helper only so please set it to false for production systems.
            validateResponse : true
        },
        listeners : {
            eventClick : ({ eventRecord }) => {
                // When an event bar is clicked, bring the marker into view and show a tooltip
                if (eventRecord.marker) {
                    mapPanel?.showTooltip(eventRecord, true);
                }
            },

            afterEventSave : ({ eventRecord }) => {
                if (eventRecord.marker) {
                    mapPanel?.scrollMarkerIntoView(eventRecord);
                }
            }
        }
    });

// A draggable splitter between the two main widgets
new Splitter({
    appendTo : 'main'
});

if (detectWebGL()) {

    // A custom MapPanel wrapping the MapboxGL JS map. We provide it with the timeAxis and the eventStore
    // So the map can show the same data as seen in the schedule
    mapPanel = new MapPanel({
        ref        : 'map',
        appendTo   : 'main',
        flex       : 2,
        eventStore : schedule.eventStore,
        timeAxis   : schedule.timeAxis,
        listeners  : {
            // When a map marker is clicked, scroll the event bar into view and highlight it
            markerclick : async({ eventRecord }) => {
                await schedule.scrollEventIntoView(eventRecord, { animate : true, highlight : true });
                schedule.selectedEvents = [eventRecord];
            }
        }
    });
}
else {
    Toast.show(
        {
            html    : `ERROR! Can not show show maps. WebGL is not supported!`,
            color   : 'b-red',
            style   : 'color:white',
            timeout : 0
        });
}