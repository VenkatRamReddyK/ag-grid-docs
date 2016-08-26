
// a list of names we pick from when generating data
var firstnames = ['Sophia','Emma','Olivia','Isabella','Mia','Ava','Lily','Zoe','Emily','Chloe','Layla','Madison','Madelyn','Abigail','Aubrey','Charlotte','Amelia','Ella','Kaylee','Avery','Aaliyah','Hailey','Hannah','Addison','Riley','Harper','Aria','Arianna','Mackenzie','Lila','Evelyn','Adalyn','Grace','Brooklyn','Ellie','Anna','Kaitlyn','Isabelle','Sophie','Scarlett','Natalie','Leah','Sarah','Nora','Mila','Elizabeth','Lillian','Kylie','Audrey','Lucy','Maya'];
var lastnames = ['Smith','Jones','Williams','Taylor','Brown','Davies','Evans','Wilson','Thomas','Johnson'];

var images = ['niall','sean','alberto','statue','horse'];

// each call gets a unique id, nothing to do with the grid, just help make the sample
// data more realistic
var callIdSequence = 555;

var rowData = createRowData();

// method creates all the data, both the top level grid and the lower level grids
function createRowData() {
    var rowData = [];

    for (var i = 0; i < 20; i++) {
        var firstName = firstnames[Math.floor(Math.random()*firstnames.length)];
        var lastName = lastnames[Math.floor(Math.random()*lastnames.length)];

        var image = images[i % images.length];

        var totalDuration = 0;

        var callRecords = [];
        // call count is random number between 20 and 120
        var callCount = Math.floor(Math.random() * 100) + 20;
        for (var j = 0; j<callCount; j++) {
            // duration is random number between 20 and 120
            var callDuration = Math.floor(Math.random() * 100) + 20;
            var callRecord = {
                callId: callIdSequence++,
                duration: callDuration,
                switchCode: 'SW' + Math.floor(Math.random() * 10),
                // 50% chance of in vs out
                direction: (Math.random()>.5) ? 'In' : 'Out',
                // made up number
                number:  '(0' + Math.floor(Math.random() * 10) + ') ' + Math.floor(Math.random() * 100000000)
            };
            callRecords.push(callRecord);
            totalDuration += callDuration;
        }

        var record = {
            name: firstName + ' ' + lastName,
            account: i + 177000,
            totalCalls: callCount,
            image: image,
            // convert from seconds to minutes
            totalMinutes: totalDuration / 60,
            callRecords: callRecords
        };
        rowData.push(record);
    }

    return rowData;
}

// create 200 data records

var minuteCellFormatter = function(params) {
    return params.value.toLocaleString() + 'm';
};

var secondCellFormatter = function(params) {
    return params.value.toLocaleString() + 's';
};

var columnDefs = [
    {headerName: 'Name', field: 'name',
        // left column is going to act as group column, with the expand / contract controls
        cellRenderer: 'group',
        // we don't want the child count - it would be one each time anyway as each parent
        // not has exactly one child node
        cellRendererParams: { suppressCount: true }
    },
    {headerName: 'Account', field: 'account'},
    {headerName: 'Calls', field: 'totalCalls'},
    {headerName: 'Minutes', field: 'totalMinutes', cellFormatter: minuteCellFormatter}
];

function NestedPanelCellRenderer() {}

NestedPanelCellRenderer.prototype.init = function(params) {
    // trick to convert string of html into dom object
    var eTemp = document.createElement('div');
    eTemp.innerHTML = this.getTemplate(params);
    this.eGui = eTemp.firstElementChild;

    this.setupNestedGrid(params.data);
    this.consumeMouseWheelOnNestedGrid();
    this.addSeachFeature();
    this.addButtonListeners();
};

NestedPanelCellRenderer.prototype.setupNestedGrid = function(callRecords) {

    this.gridOptions = {
        enableSorting: true,
        enableFilter: true,
        enableColResize: true,
        rowData: callRecords,
        columnDefs: [
            {headerName: 'Call ID', field: 'callId', cellClass: 'call-record-cell'},
            {headerName: 'Direction', field: 'direction', cellClass: 'call-record-cell'},
            {headerName: 'Number', field: 'number', cellClass: 'call-record-cell'},
            {headerName: 'Duration', field: 'duration', cellClass: 'call-record-cell', cellFormatter: secondCellFormatter},
            {headerName: 'Switch', field: 'switchCode', cellClass: 'call-record-cell'}
        ],
        onGridReady: function(params) {
            setTimeout( function() { params.api.sizeColumnsToFit(); }, 0);
        }
    };

    var eNestedGrid = this.eGui.querySelector('.nested-grid');
    new agGrid.Grid(eNestedGrid, this.gridOptions);
};

NestedPanelCellRenderer.prototype.getTemplate = function(params) {

    var parentRecord = params.node.parent.data;

    var template =
        '<div class="nested-panel">' +
        '  <div class="nested-details">' +
        '    <div class="nested-detail"><img width="120px" src="../images/'+parentRecord.image+'.png"/></div>' +
        '    <div class="nested-detail"><b>Name: </b>'+parentRecord.name+'</div>' +
        '    <div class="nested-detail"><b>Account: </b>'+parentRecord.account+'</div>' +
        '  </div>'+
        '  <div class="nested-grid"></div>' +
        '  <div class="nested-grid-toolbar">' +
        '       <img class="nested-phone-icon" src="../images/phone.png"/>' +
        '       <button><img src="../images/fire.png"/></button>' +
        '       <button><img src="../images/frost.png"/></button>' +
        '       <button><img src="../images/sun.png"/></button>' +
        '       <input class="nested-search" placeholder="Search..."/>' +
        '  </div>'+
        '</div>';

    return template;
};

NestedPanelCellRenderer.prototype.getGui = function() {
    return this.eGui;
};

NestedPanelCellRenderer.prototype.destroy = function() {
    this.gridOptions.api.destroy();
};

NestedPanelCellRenderer.prototype.addSeachFeature = function() {
    var tfSearch = this.eGui.querySelector('.nested-search');
    var gridApi = this.gridOptions.api;

    var searchListener = function() {
        var filterText = tfSearch.value;
        gridApi.setQuickFilter(filterText);
    };

    tfSearch.addEventListener('input', searchListener);
};

NestedPanelCellRenderer.prototype.addButtonListeners = function() {
    var eButtons = this.eGui.querySelectorAll('.nested-grid-toolbar button');

    for (var i = 0;  i<eButtons.length; i++) {
        eButtons[i].addEventListener('click', function() {
            window.alert('Sample button pressed!!');
        });
    }
};

// if we don't do this, then the mouse wheel will be picked up by the main
// grid and scroll the main grid and not this component. this ensures that
// the wheel move is only picked up by the text field
NestedPanelCellRenderer.prototype.consumeMouseWheelOnNestedGrid = function() {
    var eNestedGrid = this.eGui.querySelector('.nested-grid');

    var mouseWheelListener = function(event) {
        event.stopPropagation();
    };

    // event is 'mousewheel' for IE9, Chrome, Safari, Opera
    eNestedGrid.addEventListener('mousewheel', mouseWheelListener);
    // event is 'DOMMouseScroll' Firefox
    eNestedGrid.addEventListener('DOMMouseScroll', mouseWheelListener);
};

var gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,
    enableSorting: true,
    enableColResize: true,
    enableFilter: true,
    isFullWidthCell: function(rowNode) {
        return rowNode.level === 1;
    },
    onGridReady: function(params) {
        params.api.sizeColumnsToFit();
    },
    // see ag-Grid docs cellRenderer for details on how to build cellRenderers
    fullWidthCellRenderer: NestedPanelCellRenderer,
    getRowHeight: function(params) {
        var rowIsNestedRow = params.node.level===1;
        // return 100 when nested row, otherwise return 25
        return rowIsNestedRow ? 200 : 25;
    },
    getNodeChildDetails: function(record) {
        if (record.callRecords) {
            return {
                group: true,
                // the key is used by the default group cellRenderer
                key: record.name,
                // provide ag-Grid with the children of this group
                children: [record.callRecords],
                // for demo, expand the third row by default
                expanded: record.account === 177005
            };
        } else {
            return null;
        }
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});